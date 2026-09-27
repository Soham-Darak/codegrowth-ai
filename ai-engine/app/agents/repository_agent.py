from typing import Any, Dict, Optional

from app.agents.base_agent import BaseAgent
from app.services.repository_service import RepositoryService


class RepositoryAgent(BaseAgent):

    name = "repository-agent"

    description = (
        "Retrieves and inspects GitHub repositories "
        "without executing repository code."
    )

    def __init__(
        self,
        repository_service: RepositoryService,
    ):
        self.repository_service = (
            repository_service
        )

    async def run(
        self,
        task: str,
        context: Optional[
            Dict[str, Any]
        ] = None,
    ) -> Dict[str, Any]:

        context = context or {}

        repository_url = context.get(
            "repository_url"
        )

        branch = context.get(
            "branch"
        )

        include_contents = context.get(
            "include_contents",
            True,
        )

        max_files = context.get(
            "max_files"
        )

        if not repository_url:

            raise ValueError(
                "repository_url is required "
                "for repository inspection"
            )

        repository = (
            await self.repository_service
            .inspect_repository(
                repository_url=repository_url,
                branch=branch,
                include_contents=include_contents,
                max_files=max_files,
            )
        )

        return {
            "status": "COMPLETED",
            "repository": repository,
            "message": (
                "GitHub repository successfully "
                "retrieved and inspected."
            ),
        }