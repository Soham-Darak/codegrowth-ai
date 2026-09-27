from typing import Any, Dict

from app.agents.base_agent import BaseAgent


class OrchestratorAgent:

    name = "orchestrator-agent"

    def __init__(
        self,
        agents: list[BaseAgent]
    ):
        self.agents = {
            agent.name: agent
            for agent in agents
        }

    # ==================================================
    # LIST AVAILABLE AGENTS
    # ==================================================

    def list_agents(self):

        return [
            {
                "name": agent.name,
                "description": agent.description
            }
            for agent in self.agents.values()
        ]

    # ==================================================
    # SELECT AGENT
    # ==================================================

    def select_agent(
        self,
        task: str,
        context: Dict[str, Any] | None = None
    ) -> BaseAgent:

        context = context or {}

        task_lower = task.lower()

        # ==================================================
        # RULE 1: REPOSITORY CONTEXT
        # ==================================================

        if context.get("repository_url"):

            agent = self.agents.get(
                "repository-agent"
            )

            if agent:
                return agent

        # ==================================================
        # RULE 2: REPOSITORY TASK
        # ==================================================

        repository_keywords = [
            "repository",
            "repo",
            "github repository",
            "github repo",
            "inspect repository",
            "inspect repo",
            "repository structure",
            "repository files",
            "clone repository"
        ]

        if any(
            keyword in task_lower
            for keyword in repository_keywords
        ):

            agent = self.agents.get(
                "repository-agent"
            )

            if agent:
                return agent

        # ==================================================
        # RULE 3: EXPLICIT EVALUATION CONTEXT
        # ==================================================

        if context.get("assignment"):

            agent = self.agents.get(
                "evaluation-agent"
            )

            if agent:
                return agent

        # ==================================================
        # RULE 4: EXPLICIT EVALUATION TASK
        # ==================================================

        evaluation_keywords = [
            "assignment evaluation",
            "evaluate submission",
            "evaluate assignment",
            "grade submission",
            "grade assignment",
            "assess submission",
            "assess assignment"
        ]

        if any(
            keyword in task_lower
            for keyword in evaluation_keywords
        ):

            agent = self.agents.get(
                "evaluation-agent"
            )

            if agent:
                return agent

        # ==================================================
        # RULE 5: CODE CONTEXT
        # ==================================================

        if context.get("code"):

            agent = self.agents.get(
                "code-analysis-agent"
            )

            if agent:
                return agent

        # ==================================================
        # RULE 6: CODE-RELATED TASK
        # ==================================================

        code_keywords = [
            "code",
            "source",
            "program",
            "programming",
            "java",
            "python",
            "javascript",
            "typescript",
            "method",
            "function",
            "class",
            "bug",
            "debug",
            "complexity",
            "quality",
            "security",
            "testing",
            "documentation",
            "analyze",
            "analysis",
            "review"
        ]

        if any(
            keyword in task_lower
            for keyword in code_keywords
        ):

            agent = self.agents.get(
                "code-analysis-agent"
            )

            if agent:
                return agent

        # ==================================================
        # NO SUITABLE AGENT
        # ==================================================

        raise ValueError(
            "No suitable agent found for this task"
        )

    # ==================================================
    # RUN SELECTED AGENT
    # ==================================================

    async def run(
        self,
        task: str,
        context: Dict[str, Any] | None = None
    ):

        context = context or {}

        agent = self.select_agent(
            task,
            context
        )

        result = await agent.run(
            task,
            context
        )

        return {
            "agent": agent.name,
            "status": "COMPLETED",
            "result": result
        }