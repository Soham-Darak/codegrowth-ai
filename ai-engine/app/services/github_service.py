import os
import re
from typing import Tuple

import httpx
from dotenv import load_dotenv

from app.models.repository_models import (
    RepositoryMetadata
)

load_dotenv()


class GitHubService:

    GITHUB_HOST = "github.com"

    GITHUB_API = "https://api.github.com"

    def __init__(self):

        self.token = os.getenv(
            "GITHUB_TOKEN"
        )

        self.timeout = float(
            os.getenv(
                "GITHUB_TIMEOUT",
                "30"
            )
        )

    # ==================================================
    # URL VALIDATION
    # ==================================================

    def parse_repository_url(
        self,
        repository_url: str
    ) -> Tuple[str, str]:

        if not isinstance(
            repository_url,
            str
        ):
            raise ValueError(
                "Repository URL must be a string"
            )

        repository_url = (
            repository_url.strip()
        )

        if not repository_url:
            raise ValueError(
                "Repository URL cannot be empty"
            )

        pattern = (
            r"^https?://"
            r"(?:www\.)?"
            r"github\.com/"
            r"([^/\s]+)/"
            r"([^/\s]+)"
            r"/?$"
        )

        match = re.match(
            pattern,
            repository_url
        )

        if not match:
            raise ValueError(
                "Only valid GitHub repository URLs are supported"
            )

        owner = match.group(1)

        repository = match.group(2)

        if repository.endswith(".git"):
            repository = repository[:-4]

        if not owner or not repository:
            raise ValueError(
                "Invalid GitHub repository URL"
            )

        return owner, repository

    # ==================================================
    # CANONICAL URL
    # ==================================================

    def canonical_url(
        self,
        owner: str,
        repository: str
    ) -> str:

        return (
            f"https://github.com/"
            f"{owner}/{repository}"
        )

    # ==================================================
    # GIT CLONE URL
    # ==================================================

    def clone_url(
        self,
        owner: str,
        repository: str
    ) -> str:

        return (
            f"https://github.com/"
            f"{owner}/{repository}.git"
        )

    # ==================================================
    # GITHUB API HEADERS
    # ==================================================

    def _headers(self) -> dict:

        headers = {
            "Accept": (
                "application/vnd.github+json"
            ),
            "User-Agent": "CodeGrowth-AI"
        }

        if self.token:

            headers["Authorization"] = (
                f"Bearer {self.token}"
            )

        return headers

    # ==================================================
    # REPOSITORY METADATA
    # ==================================================

    async def get_repository_metadata(
        self,
        owner: str,
        repository: str
    ) -> dict:

        url = (
            f"{self.GITHUB_API}/repos/"
            f"{owner}/{repository}"
        )

        try:

            async with httpx.AsyncClient(
                timeout=self.timeout
            ) as client:

                response = await client.get(
                    url,
                    headers=self._headers()
                )

                response.raise_for_status()

                return response.json()

        except httpx.HTTPStatusError as exc:

            if exc.response.status_code == 404:

                raise ValueError(
                    "GitHub repository was not found "
                    "or is not accessible"
                ) from exc

            if exc.response.status_code == 401:

                raise ValueError(
                    "GitHub authentication failed. "
                    "Check GITHUB_TOKEN."
                ) from exc

            if exc.response.status_code == 403:

                raise RuntimeError(
                    "GitHub API access was forbidden. "
                    "The API rate limit may have been exceeded."
                ) from exc

            raise RuntimeError(
                "GitHub API request failed with "
                f"status {exc.response.status_code}"
            ) from exc

        except httpx.HTTPError as exc:

            raise RuntimeError(
                f"GitHub API request failed: {exc}"
            ) from exc