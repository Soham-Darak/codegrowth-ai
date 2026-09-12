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
        # Rule 1: Code context has highest priority
        # --------------------------------------------------

        if context.get("code"):

            agent = self.agents.get(
                "code-analysis-agent"
            )

            if agent:
                return agent

        # --------------------------------------------------
        # Rule 2: Code-related task keywords
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
            "evaluate",
            "evaluation",
            "analyze",
            "analysis",
            "review",
            "assignment"
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