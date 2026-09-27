from typing import Any, Dict

from app.agents.base_agent import BaseAgent
from app.models.repository_models import (
    RepositoryAnalysisResult,
    RepositoryRequest
)
from app.services.github_service import GitHubService
from app.services.repository_service import RepositoryService


class RepositoryAgent(BaseAgent):

    name = "repository-agent"

    description = (
        "Retrieves and inspects GitHub repositories "
        "without executing repository code."
    )

    def __init__(
        self,
        repository_service: RepositoryService
    ):
        self.repository_service = (
            repository_service
        )

    async def run(
        self,
        task: str,
        context: Dict[str, Any]
    ) -> Dict[str, Any]:

        repository_url = (
            context.get(
                "repository_url"
            )
        )

        branch = (
            context.get(
                "branch"
            )
        )

        request = RepositoryRequest(
            repository_url=repository_url,
            branch=branch
        )

        structure = (
            await self.repository_service
            .inspect_repository(
                repository_url=request.repository_url,
                branch=request.branch
            )
        )

        result = RepositoryAnalysisResult(
            status="COMPLETED",
            repository=structure,
            message=(
                "GitHub repository successfully "
                "retrieved and inspected."
            )
        )

        return result.model_dump()