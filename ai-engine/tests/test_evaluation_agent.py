"""
Tests for EvaluationAgent — deterministic fallback, evidence override,
requirement normalization, and consistency validation.

All tests mock the LLM and CodeAnalysisAgent to test only the evaluation
logic without requiring Ollama.
"""

import json
import pytest

from app.agents.evaluation_agent import EvaluationAgent
from app.agents.code_analysis_agent import CodeAnalysisAgent
from app.models.code_analysis_models import CodeAnalysisResult
from app.models.evaluation_models import EvaluationResult
from app.services.evidence_validator import EvidenceValidator
from app.services.llm_provider import LLMProvider
from app.services.llm_runtime import LLMRuntime


# ==============================================================
# MOCKS
# ==============================================================

class FakeLLMProvider(LLMProvider):
    """LLM provider that returns a pre-configured JSON string."""

    def __init__(self, json_response: dict | str = None):
        if json_response is None:
            json_response = {}
        self._response = (
            json.dumps(json_response)
            if isinstance(json_response, dict)
            else json_response
        )

    def set_response(self, json_response: dict | str):
        self._response = (
            json.dumps(json_response)
            if isinstance(json_response, dict)
            else json_response
        )

    async def generate(self, prompt: str) -> str:
        return self._response

    async def generate_json(self, prompt: str) -> str:
        return self._response


class FakeCodeAnalysisAgent(CodeAnalysisAgent):
    """Returns a fixed CodeAnalysisResult without calling an LLM."""

    def __init__(self):
        # Bypass parent __init__ which requires real services
        self.name = "code-analysis-agent"
        self.description = "Mock code analysis agent"

    async def run(self, task, context=None):
        return CodeAnalysisResult(
            correctness_score=70,
            code_quality_score=60,
            complexity_score=50,
            security_score=40,
            testing_score=30,
            documentation_score=20,
            overall_score=45,
            strengths=["clean structure"],
            weaknesses=["no tests"],
            improvement_suggestions=["add tests"],
        )


# ==============================================================
# FIXTURES
# ==============================================================

def _build_llm_response(requirements, statuses=None, scores=None):
    """
    Helper to build a valid evaluation JSON that the LLM would return.
    """
    statuses = statuses or ["SATISFIED"] * len(requirements)
    scores = scores or [100] * len(requirements)

    return {
        "correctness_score": 80,
        "code_quality_score": 70,
        "complexity_score": 60,
        "testing_score": 50,
        "security_score": 40,
        "documentation_score": 30,
        "overall_score": 55,
        "requirement_results": [
            {
                "requirement": req,
                "status": st,
                "score": sc,
                "evidence": [f"Evidence for: {req}"],
                "feedback": f"Feedback for: {req}",
            }
            for req, st, sc in zip(requirements, statuses, scores)
        ],
        "strengths": ["Good project structure"],
        "weaknesses": ["Missing tests"],
        "feedback": "Overall decent submission",
        "improvement_suggestions": ["Add more tests"],
    }


def _make_evaluation_agent(llm_response: dict):
    """Build an EvaluationAgent with a fake LLM that returns the given dict."""
    provider = FakeLLMProvider(llm_response)
    runtime = LLMRuntime(provider=provider, max_retries=0)
    code_agent = FakeCodeAnalysisAgent()
    validator = EvidenceValidator()
    return EvaluationAgent(code_agent, runtime, validator)


# ==============================================================
# INPUT VALIDATION
# ==============================================================

@pytest.mark.asyncio
async def test_evaluation_requires_code():
    agent = _make_evaluation_agent({})
    with pytest.raises(ValueError, match="Student code is required"):
        await agent.run("evaluate", context={
            "assignment": {"title": "Test", "requirements": ["Use FastAPI"]},
            "code": "",
        })


@pytest.mark.asyncio
async def test_evaluation_requires_requirements():
    agent = _make_evaluation_agent({})
    with pytest.raises(ValueError, match="at least one requirement"):
        await agent.run("evaluate", context={
            "assignment": {"title": "Test", "requirements": []},
            "code": "print('hello')",
        })


@pytest.mark.asyncio
async def test_evaluation_extracts_code_from_repository_files():
    """When code is not provided directly, it should be assembled from repository_files."""
    requirements = ["Must use FastAPI"]
    llm_response = _build_llm_response(requirements)
    agent = _make_evaluation_agent(llm_response)

    result = await agent.run("evaluate", context={
        "assignment": {"title": "Test", "requirements": requirements},
        "repository_files": [
            {"path": "main.py", "content": "from fastapi import FastAPI"},
        ],
    })

    assert isinstance(result, EvaluationResult)
    assert result.overall_score > 0


# ==============================================================
# DETERMINISTIC EVIDENCE OVERRIDE
# ==============================================================

@pytest.mark.asyncio
async def test_deterministic_override_not_found():
    """
    When deterministic evidence says a POST endpoint is NOT FOUND,
    the EvaluationAgent must force NOT_SATISFIED/0 regardless of what
    the LLM returns.
    """
    requirements = ["Create a POST endpoint for users"]

    # LLM falsely claims SATISFIED
    llm_response = _build_llm_response(
        requirements,
        statuses=["SATISFIED"],
        scores=[100],
    )

    agent = _make_evaluation_agent(llm_response)

    # Code has NO @PostMapping
    result = await agent.run("evaluate", context={
        "assignment": {"title": "Test", "requirements": requirements},
        "code": "public class UserController { public void list() {} }",
    })

    assert len(result.requirement_results) == 1
    req = result.requirement_results[0]
    assert req.status == "NOT_SATISFIED"
    assert req.score == 0


@pytest.mark.asyncio
async def test_deterministic_override_found():
    """
    When deterministic evidence says a POST endpoint IS FOUND,
    the evidence list should come from the validator.
    """
    requirements = ["Create a POST endpoint for testing"]

    llm_response = _build_llm_response(
        requirements,
        statuses=["SATISFIED"],
        scores=[100],
    )

    agent = _make_evaluation_agent(llm_response)

    # Code HAS @PostMapping
    code = "@RestController\nclass MyController {\n  @PostMapping('/api/test')\n  public void test() {}\n}"
    result = await agent.run("evaluate", context={
        "assignment": {"title": "Test", "requirements": requirements},
        "code": code,
    })

    assert len(result.requirement_results) == 1
    req = result.requirement_results[0]
    assert req.status == "SATISFIED"
    assert req.score == 100
    # Evidence should contain the matched pattern from the validator
    assert any("@PostMapping" in e for e in req.evidence)


@pytest.mark.asyncio
async def test_unknown_requirement_passes_through():
    """
    Requirements without deterministic validation (type UNKNOWN) should
    preserve the LLM's status and score.
    """
    requirements = ["Must implement clean architecture"]

    llm_response = _build_llm_response(
        requirements,
        statuses=["PARTIALLY_SATISFIED"],
        scores=[65],
    )

    agent = _make_evaluation_agent(llm_response)

    result = await agent.run("evaluate", context={
        "assignment": {"title": "Test", "requirements": requirements},
        "code": "class UserService:\n    def create_user(self): pass",
    })

    assert len(result.requirement_results) == 1
    req = result.requirement_results[0]
    assert req.status == "PARTIALLY_SATISFIED"
    assert req.score == 65


# ==============================================================
# CONSISTENCY VALIDATION
# ==============================================================

@pytest.mark.asyncio
async def test_consistency_not_satisfied_requires_zero_score():
    """
    If the LLM returns NOT_SATISFIED with a non-zero score,
    the agent should fail validation.
    """
    requirements = ["Must implement logging"]

    # LLM says NOT_SATISFIED but gives score 50 — inconsistent
    llm_response = _build_llm_response(
        requirements,
        statuses=["NOT_SATISFIED"],
        scores=[50],
    )

    agent = _make_evaluation_agent(llm_response)

    with pytest.raises(RuntimeError, match="NOT_SATISFIED"):
        await agent.run("evaluate", context={
            "assignment": {"title": "Test", "requirements": requirements},
            "code": "print('hello')",
        })


@pytest.mark.asyncio
async def test_consistency_satisfied_requires_100_score():
    """
    If the LLM returns SATISFIED with a score != 100,
    the agent should fail validation.
    """
    requirements = ["Must implement logging"]

    llm_response = _build_llm_response(
        requirements,
        statuses=["SATISFIED"],
        scores=[80],
    )

    agent = _make_evaluation_agent(llm_response)

    with pytest.raises((RuntimeError, ValueError)):
        await agent.run("evaluate", context={
            "assignment": {"title": "Test", "requirements": requirements},
            "code": "import logging\nlogger = logging.getLogger(__name__)",
        })


@pytest.mark.asyncio
async def test_consistency_partial_requires_1_to_99():
    """
    If the LLM returns PARTIALLY_SATISFIED with score 0 or 100,
    the agent should fail validation.
    """
    requirements = ["Must implement logging"]

    llm_response = _build_llm_response(
        requirements,
        statuses=["PARTIALLY_SATISFIED"],
        scores=[0],
    )

    agent = _make_evaluation_agent(llm_response)

    with pytest.raises((RuntimeError, ValueError)):
        await agent.run("evaluate", context={
            "assignment": {"title": "Test", "requirements": requirements},
            "code": "print('hello')",
        })


# ==============================================================
# MULTI-REQUIREMENT EVALUATION
# ==============================================================

@pytest.mark.asyncio
async def test_multiple_requirements_all_evaluated():
    """Every assignment requirement must produce exactly one requirement_result."""
    requirements = [
        "Must use FastAPI",
        "Must have a main.py file",
        "Must implement error handling",
    ]

    llm_response = _build_llm_response(
        requirements,
        statuses=["SATISFIED", "SATISFIED", "NOT_SATISFIED"],
        scores=[100, 100, 0],
    )

    agent = _make_evaluation_agent(llm_response)

    result = await agent.run("evaluate", context={
        "assignment": {
            "title": "Build an API",
            "description": "Create a simple REST API",
            "requirements": requirements,
        },
        "code": "from fastapi import FastAPI\napp = FastAPI()",
    })

    assert len(result.requirement_results) == 3


@pytest.mark.asyncio
async def test_requirement_count_mismatch_raises():
    """
    If the LLM returns fewer requirement_results than assignment
    requirements, the normalization step should raise because the
    missing requirement has no status/score from the LLM.
    """
    requirements = ["Req A", "Req B", "Req C"]

    # Only return 2 results for 3 requirements
    llm_response = _build_llm_response(
        requirements[:2],
        statuses=["SATISFIED", "SATISFIED"],
        scores=[100, 100],
    )

    agent = _make_evaluation_agent(llm_response)

    with pytest.raises(RuntimeError, match="did not provide a status"):
        await agent.run("evaluate", context={
            "assignment": {"title": "Test", "requirements": requirements},
            "code": "some code here",
        })


# ==============================================================
# OVERALL SCORE RECALCULATION
# ==============================================================

@pytest.mark.asyncio
async def test_overall_score_is_recalculated():
    """
    The EvaluationAgent recalculates overall_score as the average of
    the six dimension scores.
    """
    requirements = ["Must compile"]
    llm_response = _build_llm_response(
        requirements,
        statuses=["SATISFIED"],
        scores=[100],
    )
    # Set dimension scores to known values
    llm_response["correctness_score"] = 100
    llm_response["code_quality_score"] = 80
    llm_response["complexity_score"] = 60
    llm_response["testing_score"] = 40
    llm_response["security_score"] = 20
    llm_response["documentation_score"] = 0
    # LLM provides wrong overall — agent should recalculate
    llm_response["overall_score"] = 99

    agent = _make_evaluation_agent(llm_response)

    result = await agent.run("evaluate", context={
        "assignment": {"title": "Test", "requirements": requirements},
        "code": "print('compiles')",
    })

    expected = round((100 + 80 + 60 + 40 + 20 + 0) / 6, 2)
    assert result.overall_score == expected
