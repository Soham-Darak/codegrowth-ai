from typing import Any, Dict

from app.agents.base_agent import BaseAgent


class OrchestratorAgent:

    name = "orchestrator-agent"

    description = (
        "Routes CodeGrowth AI tasks to the appropriate agent."
    )

    def __init__(
        self,
        agents: list[BaseAgent]
    ):

        self.agents = {
            agent.name: agent
            for agent in agents
        }

    # ========================================================
    # LIST AGENTS
    # ========================================================

    def list_agents(self):

        return [
            {
                "name": agent.name,
                "description": agent.description
            }
            for agent in self.agents.values()
        ]

    # ========================================================
    # SELECT AGENT
    # ========================================================

    def select_agent(
        self,
        task: str,
        context: Dict[str, Any] | None = None
    ) -> BaseAgent:

        context = context or {}

        task_lower = (
            task or ""
        ).lower()

        # ----------------------------------------------------
        # 1. ASSIGNMENT EVALUATION
        # ----------------------------------------------------

        if context.get(
            "assignment"
        ):

            agent = self.agents.get(
                "evaluation-agent"
            )

            if agent:
                return agent

        evaluation_keywords = [
            "assignment evaluation",
            "evaluate submission",
            "evaluate assignment",
            "grade submission",
            "grade assignment",
            "assess submission",
            "assess assignment",
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

        # ----------------------------------------------------
        # 2. REPOSITORY REQUEST
        # ----------------------------------------------------

        repository_url = context.get(
            "repository_url"
        )

        if repository_url:

            repository_keywords = [
                "repository",
                "repo",
                "github",
                "github repository",
                "source repository",
            ]

            if any(
                keyword in task_lower
                for keyword in repository_keywords
            ):

                # --------------------------------------------
                # Repository analysis
                # --------------------------------------------

                analysis_keywords = [
                    "analyze",
                    "analyse",
                    "review",
                    "audit",
                    "evaluate",
                    "assessment",
                    "quality",
                    "security",
                    "code quality",
                ]

                if any(
                    keyword in task_lower
                    for keyword in analysis_keywords
                ):

                    agent = self.agents.get(
                        "repository-agent"
                    )

                    if agent:
                        return agent

                # --------------------------------------------
                # Repository inspection
                # --------------------------------------------

                agent = self.agents.get(
                    "repository-agent"
                )

                if agent:
                    return agent

        # ----------------------------------------------------
        # 3. REPOSITORY FILES ALREADY PROVIDED
        # ----------------------------------------------------

        if context.get(
            "repository_files"
        ):

            agent = self.agents.get(
                "code-analysis-agent"
            )

            if agent:
                return agent

        # ----------------------------------------------------
        # 4. DIRECT CODE
        # ----------------------------------------------------

        if context.get(
            "code"
        ):

            agent = self.agents.get(
                "code-analysis-agent"
            )

            if agent:
                return agent

        # ----------------------------------------------------
        # 5. CODE TASK
        # ----------------------------------------------------

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
            "analyse",
            "analysis",
            "review",
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

        # ----------------------------------------------------
        # NO AGENT
        # ----------------------------------------------------

        raise ValueError(
            "No suitable agent found for this task"
        )

    # ========================================================
    # RUN
    # ========================================================

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

        # ----------------------------------------------------
        # Repository requests need two stages:
        #
        # 1. Retrieve repository
        # 2. Analyze repository
        # ----------------------------------------------------

        if (
            agent.name == "repository-agent"
            and context.get(
                "repository_url"
            )
        ):

            repository_agent_result = (
                await agent.run(
                    task,
                    {
                        **context,
                        "operation": "content"
                    }
                )
            )

            if isinstance(
                repository_agent_result,
                dict
            ):

                repository = (
                    repository_agent_result.get(
                        "repository"
                    )
                )

                if hasattr(
                    repository,
                    "files"
                ):

                    repository_files = [
                        file.model_dump()
                        for file in repository.files
                    ]

                elif isinstance(
                    repository,
                    dict
                ):

                    repository_files = (
                        repository.get(
                            "files",
                            []
                        )
                    )

                else:
                    repository_files = []

                code_agent = self.agents.get(
                    "code-analysis-agent"
                )

                if not code_agent:
                    raise ValueError(
                        "Code analysis agent is not registered."
                    )

                analysis_result = await code_agent.run(
                    task,
                    {
                        **context,
                        "repository_files": repository_files
                    }
                )

                if hasattr(
                    analysis_result,
                    "model_dump"
                ):

                    analysis_result = (
                        analysis_result.model_dump()
                    )

                return {
                    "agent": "code-analysis-agent",
                    "source_agent": "repository-agent",
                    "status": "COMPLETED",
                    "result": analysis_result
                }

            if hasattr(
                repository_agent_result,
                "model_dump"
            ):

                repository_agent_result = (
                    repository_agent_result.model_dump()
                )

            return {
                "agent": agent.name,
                "status": "COMPLETED",
                "result": repository_agent_result
            }

        # ----------------------------------------------------
        # NORMAL AGENT
        # ----------------------------------------------------

        result = await agent.run(
            task,
            context
        )

        if hasattr(
            result,
            "model_dump"
        ):

            result = result.model_dump()

        return {
            "agent": agent.name,
            "status": "COMPLETED",
            "result": result
        }