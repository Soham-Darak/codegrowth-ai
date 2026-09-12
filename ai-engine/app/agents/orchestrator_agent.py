from typing import Any, Dict

from app.agents.base_agent import BaseAgent
from app.agents.code_analysis_agent import CodeAnalysisAgent


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
        task: str
    ) -> BaseAgent:

        task_lower = task.lower()

        if any(
            keyword in task_lower
            for keyword in [
                "code",
                "source",
                "program",
                "bug",
                "complexity",
                "quality",
                "security"
            ]
        ):

            agent = self.agents.get(
                "code-analysis-agent"
            )

            if agent:
                return agent

        raise ValueError(
            "No suitable agent found for this task"
        )

    async def run(
        self,
        task: str,
        context: Dict[str, Any] | None = None
    ):

        agent = self.select_agent(task)

        result = await agent.run(
            task,
            context
        )

        return {
            "agent": agent.name,
            "status": "COMPLETED",
            "result": result
        }