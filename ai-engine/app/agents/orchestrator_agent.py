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

    def list_agents(self):

        return [
            {
                "name": agent.name,
                "description": agent.description
            }
            for agent in self.agents.values()
        ]

    def select_agent(
        self,
        task: str,
        context: Dict[str, Any] | None = None
    ) -> BaseAgent:

        context = context or {}

        task_lower = task.lower()

        # --------------------------------------------------
        # Rule 1: Explicit evaluation context
        # --------------------------------------------------

        if context.get("assignment"):

            agent = self.agents.get(
                "evaluation-agent"
            )

            if agent:
                return agent

        # --------------------------------------------------
        # Rule 2: Explicit evaluation task
        # --------------------------------------------------

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

        # --------------------------------------------------
        # Rule 3: Code context
        # --------------------------------------------------

        if context.get("code"):

            agent = self.agents.get(
                "code-analysis-agent"
            )

            if agent:
                return agent

        # --------------------------------------------------
        # Rule 4: Code-related task
        # --------------------------------------------------

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

        # --------------------------------------------------
        # No suitable agent
        # --------------------------------------------------

        raise ValueError(
            "No suitable agent found for this task"
        )

    async def run(
        self,
        task: str,
        context: Dict[str, Any] | None = None
    ):

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