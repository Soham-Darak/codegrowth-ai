import pytest
from app.agents.orchestrator_agent import OrchestratorAgent
from app.agents.base_agent import BaseAgent

class MockAgent(BaseAgent):
    name = "mock-agent"
    description = "Mock agent for testing"
    async def run(self, task, context=None):
        return {"mock": "result"}

class MockRepoAgent(BaseAgent):
    name = "repository-agent"
    description = "Mock repo agent"
    async def run(self, task, context=None):
        return {"repository": {"contents": [{"path": "main.py", "content": "print('hello')", "truncated": False}]}}

class MockCodeAgent(BaseAgent):
    name = "code-analysis-agent"
    description = "Mock code agent"
    async def run(self, task, context=None):
        return {"correctness_score": 100}

class MockEvaluationAgent(BaseAgent):
    name = "evaluation-agent"
    description = "Mock eval agent"
    async def run(self, task, context=None):
        return {"overall_score": 90}

@pytest.fixture
def orchestrator():
    return OrchestratorAgent([
        MockRepoAgent(),
        MockCodeAgent(),
        MockEvaluationAgent(),
        MockAgent()
    ])

def test_select_agent_assignment(orchestrator):
    agent = orchestrator.select_agent("do it", {"assignment": {"title": "x"}})
    assert agent.name == "evaluation-agent"

def test_select_agent_code(orchestrator):
    agent = orchestrator.select_agent("analyze code", {"code": "print(1)"})
    assert agent.name == "code-analysis-agent"

def test_select_agent_inspection(orchestrator):
    agent = orchestrator.select_agent("inspect this repository", {"repository_url": "http://x"})
    assert agent.name == "repository-agent"

@pytest.mark.asyncio
async def test_run_orchestrator_inspection(orchestrator):
    result = await orchestrator.run("inspect repository", {"repository_url": "http://x"})
    assert result["agent"] == "repository-agent"
    assert "repository" in result["result"]

@pytest.mark.asyncio
async def test_run_orchestrator_analysis(orchestrator):
    result = await orchestrator.run("analyze this repository", {"repository_url": "http://x"})
    assert result["agent"] == "code-analysis-agent"
    assert result["source_agent"] == "repository-agent"
    assert result["result"]["correctness_score"] == 100
