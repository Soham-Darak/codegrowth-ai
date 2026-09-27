import base64
import os

from typing import Any, Dict, List, Optional, Tuple
from urllib.parse import quote, urlparse

import httpx
from dotenv import load_dotenv


load_dotenv()


class GitHubService:
    """
    GitHub API client used by CodeGrowth AI.

    Responsibilities:
    - Validate GitHub repository URLs
    - Authenticate using GITHUB_TOKEN
    - Retrieve repository metadata
    - Retrieve repository tree
    - Retrieve file contents

    This service NEVER executes repository code.
    """

    API_BASE_URL = "https://api.github.com"

    DEFAULT_TIMEOUT = 30.0

    MAX_FILE_SIZE = 512 * 1024

    SUPPORTED_TEXT_EXTENSIONS = {
        ".py",
        ".java",
        ".js",
        ".jsx",
        ".ts",
        ".tsx",
        ".c",
        ".cpp",
        ".h",
        ".hpp",
        ".cs",
        ".go",
        ".rs",
        ".rb",
        ".php",
        ".swift",
        ".kt",
        ".kts",
        ".scala",
        ".sql",
        ".html",
        ".htm",
        ".css",
        ".scss",
        ".sass",
        ".json",
        ".xml",
        ".yaml",
        ".yml",
        ".md",
        ".txt",
        ".properties",
        ".toml",
        ".ini",
        ".sh",
        ".bat",
        ".ps1",
        ".gradle",
        ".mjs",
        ".cjs",
    }

    LANGUAGE_MAP = {
        ".py": "Python",
        ".java": "Java",
        ".js": "JavaScript",
        ".jsx": "JavaScript",
        ".mjs": "JavaScript",
        ".cjs": "JavaScript",
        ".ts": "TypeScript",
        ".tsx": "TypeScript",
        ".c": "C",
        ".cpp": "C++",
        ".h": "C/C++",
        ".hpp": "C++",
        ".cs": "C#",
        ".go": "Go",
        ".rs": "Rust",
        ".rb": "Ruby",
        ".php": "PHP",
        ".swift": "Swift",
        ".kt": "Kotlin",
        ".kts": "Kotlin",
        ".scala": "Scala",
        ".sql": "SQL",
        ".html": "HTML",
        ".htm": "HTML",
        ".css": "CSS",
        ".scss": "SCSS",
        ".sass": "Sass",
        ".json": "JSON",
        ".xml": "XML",
        ".yaml": "YAML",
        ".yml": "YAML",
        ".md": "Markdown",
        ".txt": "Text",
        ".properties": "Properties",
        ".toml": "TOML",
        ".ini": "INI",
        ".sh": "Shell",
        ".bat": "Batch",
        ".ps1": "PowerShell",
        ".gradle": "Gradle",
    }

    SPECIAL_TEXT_FILES = {
        "dockerfile": "Dockerfile",
        "makefile": "Makefile",
        ".gitignore": "Git Ignore",
        ".dockerignore": "Docker Ignore",
        ".editorconfig": "EditorConfig",
    }

    def __init__(
        self,
        token: Optional[str] = None,
    ):
        self.token = (
            token
            or os.getenv("GITHUB_TOKEN")
            or ""
        ).strip()

        self.headers = {
            "Accept": "application/vnd.github+json",
            "User-Agent": "CodeGrowth-AI/1.0",
            "X-GitHub-Api-Version": "2022-11-28",
        }

        if self.token:
            self.headers["Authorization"] = (
                f"Bearer {self.token}"
            )

    # ==========================================================
    # URL HELPERS
    # ==========================================================

    def parse_repository_url(
        self,
        repository_url: str,
    ) -> Tuple[str, str]:

        if not isinstance(repository_url, str):
            raise ValueError(
                "Repository URL must be a string."
            )

        repository_url = repository_url.strip()

        parsed = urlparse(repository_url)

        if parsed.scheme not in {
            "http",
            "https",
        }:
            raise ValueError(
                "Repository URL must use http or https."
            )

        hostname = (
            parsed.hostname or ""
        ).lower()

        if hostname not in {
            "github.com",
            "www.github.com",
        }:
            raise ValueError(
                "Only GitHub repository URLs are supported."
            )

        parts = [
            part
            for part in parsed.path.split("/")
            if part
        ]

        if len(parts) < 2:
            raise ValueError(
                "Invalid GitHub repository URL."
            )

        owner = parts[0]
        repository = parts[1]

        if repository.endswith(".git"):
            repository = repository[:-4]

        if not owner or not repository:
            raise ValueError(
                "Unable to determine GitHub owner and repository."
            )

        return owner, repository

    def canonical_url(
        self,
        owner: str,
        repository: str,
    ) -> str:

        return (
            f"https://github.com/"
            f"{owner}/{repository}"
        )

    def clone_url(
        self,
        owner: str,
        repository: str,
    ) -> str:

        return self.canonical_url(
            owner,
            repository,
        ) + ".git"

    # ==========================================================
    # HTTP REQUEST
    # ==========================================================

    async def _request(
        self,
        method: str,
        endpoint: str,
        **kwargs: Any,
    ) -> httpx.Response:

        url = (
            f"{self.API_BASE_URL}"
            f"{endpoint}"
        )

        headers = dict(
            self.headers
        )

        request_headers = kwargs.pop(
            "headers",
            None,
        )

        if request_headers:
            headers.update(
                request_headers
            )

        timeout = kwargs.pop(
            "timeout",
            self.DEFAULT_TIMEOUT,
        )

        async with httpx.AsyncClient(
            timeout=timeout,
            follow_redirects=True,
        ) as client:

            try:
                response = await client.request(
                    method,
                    url,
                    headers=headers,
                    **kwargs,
                )

            except httpx.RequestError as exc:

                raise RuntimeError(
                    f"Unable to connect to GitHub: {exc}"
                ) from exc

        if response.status_code == 401:
            raise RuntimeError(
                "GitHub authentication failed. "
                "Check that GITHUB_TOKEN is valid."
            )

        if response.status_code == 403:

            remaining = response.headers.get(
                "X-RateLimit-Remaining"
            )

            reset = response.headers.get(
                "X-RateLimit-Reset"
            )

            if remaining == "0":
                raise RuntimeError(
                    "GitHub API rate limit exceeded. "
                    f"Rate limit reset timestamp: "
                    f"{reset or 'unknown'}."
                )

            raise RuntimeError(
                "GitHub API access was forbidden. "
                "Check GITHUB_TOKEN permissions and "
                "repository access."
            )

        if response.status_code == 404:
            raise RuntimeError(
                "GitHub repository or resource was not found. "
                "Check the repository URL, branch, "
                "and token permissions."
            )

        if not response.is_success:

            try:
                data = response.json()

                message = data.get(
                    "message",
                    response.text,
                )

            except Exception:
                message = response.text

            raise RuntimeError(
                f"GitHub API error "
                f"({response.status_code}): {message}"
            )

        return response

    # ==========================================================
    # REPOSITORY METADATA
    # ==========================================================

    async def get_repository_metadata(
        self,
        owner: str,
        repository: str,
    ) -> Dict[str, Any]:

        response = await self._request(
            "GET",
            f"/repos/{owner}/{repository}",
        )

        data = response.json()

        return {
            "owner": (
                data.get("owner", {})
                .get("login", owner)
            ),
            "name": data.get(
                "name",
                repository,
            ),
            "url": data.get(
                "html_url",
                self.canonical_url(
                    owner,
                    repository,
                ),
            ),
            "description": data.get(
                "description"
            ),
            "default_branch": data.get(
                "default_branch",
                "main",
            ),
            "private": bool(
                data.get(
                    "private",
                    False,
                )
            ),
            "fork": bool(
                data.get(
                    "fork",
                    False,
                )
            ),
            "stars": int(
                data.get(
                    "stargazers_count",
                    0,
                )
                or 0
            ),
            "forks": int(
                data.get(
                    "forks_count",
                    0,
                )
                or 0
            ),
            "open_issues": int(
                data.get(
                    "open_issues_count",
                    0,
                )
                or 0
            ),
            "language": data.get(
                "language"
            ),
        }

    async def get_repository(
        self,
        repository_url: str,
    ) -> Dict[str, Any]:

        owner, repository = (
            self.parse_repository_url(
                repository_url
            )
        )

        return await self.get_repository_metadata(
            owner,
            repository,
        )

    async def resolve_branch(
        self,
        repository_url: str,
        branch: Optional[str] = None,
    ) -> str:

        if branch:
            return branch

        owner, repository = (
            self.parse_repository_url(
                repository_url
            )
        )

        metadata = await self.get_repository_metadata(
            owner,
            repository,
        )

        resolved = metadata.get(
            "default_branch"
        )

        if not resolved:
            raise RuntimeError(
                "Unable to determine repository default branch."
            )

        return resolved

    # ==========================================================
    # REPOSITORY TREE
    # ==========================================================

    async def get_repository_tree(
        self,
        owner: str,
        repository: str,
        branch: str,
    ) -> List[Dict[str, Any]]:

        encoded_branch = quote(
            branch,
            safe="",
        )

        response = await self._request(
            "GET",
            (
                f"/repos/{owner}/{repository}"
                f"/git/trees/{encoded_branch}"
            ),
            params={
                "recursive": "1",
            },
        )

        data = response.json()

        if data.get("truncated"):
            raise RuntimeError(
                "GitHub returned a truncated repository tree. "
                "The repository is too large for the current "
                "inspection mode."
            )

        return data.get(
            "tree",
            [],
        )

    async def get_tree(
        self,
        repository_url: str,
        branch: Optional[str] = None,
    ) -> List[Dict[str, Any]]:

        owner, repository = (
            self.parse_repository_url(
                repository_url
            )
        )

        resolved_branch = (
            await self.resolve_branch(
                repository_url,
                branch,
            )
        )

        return await self.get_repository_tree(
            owner=owner,
            repository=repository,
            branch=resolved_branch,
        )

    async def list_files(
        self,
        owner: str,
        repository: str,
        branch: str,
    ) -> List[Dict[str, Any]]:

        tree = await self.get_repository_tree(
            owner=owner,
            repository=repository,
            branch=branch,
        )

        files = []

        for item in tree:

            if item.get("type") != "blob":
                continue

            path = item.get(
                "path",
                "",
            )

            if not path:
                continue

            files.append(
                {
                    "path": path,
                    "size": int(
                        item.get(
                            "size",
                            0,
                        )
                        or 0
                    ),
                    "sha": item.get(
                        "sha"
                    ),
                    "url": item.get(
                        "url"
                    ),
                }
            )

        return files

    # ==========================================================
    # FILE HELPERS
    # ==========================================================

    def get_extension(
        self,
        path: str,
    ) -> str:

        filename = path.rsplit(
            "/",
            1,
        )[-1].lower()

        if filename in self.SPECIAL_TEXT_FILES:
            return ""

        if "." not in filename:
            return ""

        return (
            "."
            + filename.rsplit(
                ".",
                1,
            )[-1]
        )

    def get_language(
        self,
        path: str,
    ) -> Optional[str]:

        filename = path.rsplit(
            "/",
            1,
        )[-1].lower()

        if filename in self.SPECIAL_TEXT_FILES:
            return self.SPECIAL_TEXT_FILES[
                filename
            ]

        extension = self.get_extension(
            path
        )

        return self.LANGUAGE_MAP.get(
            extension
        )

    def is_supported_text_file(
        self,
        path: str,
    ) -> bool:

        filename = path.rsplit(
            "/",
            1,
        )[-1].lower()

        if filename in self.SPECIAL_TEXT_FILES:
            return True

        extension = self.get_extension(
            path
        )

        return (
            extension
            in self.SUPPORTED_TEXT_EXTENSIONS
        )

    # ==========================================================
    # FILE CONTENT
    # ==========================================================

    async def get_file_content(
        self,
        owner: str,
        repository: str,
        path: str,
        branch: str,
    ) -> str:

        encoded_path = quote(
            path,
            safe="/",
        )

        response = await self._request(
            "GET",
            (
                f"/repos/{owner}/{repository}"
                f"/contents/{encoded_path}"
            ),
            params={
                "ref": branch,
            },
        )

        data = response.json()

        if isinstance(data, list):
            raise RuntimeError(
                f"{path} is a directory, not a file."
            )

        size = int(
            data.get(
                "size",
                0,
            )
            or 0
        )

        if size > self.MAX_FILE_SIZE:
            raise RuntimeError(
                f"File {path} is too large for analysis."
            )

        content = data.get(
            "content"
        )

        if content:

            content = content.replace(
                "\n",
                "",
            )

            try:

                decoded = base64.b64decode(
                    content
                )

                return decoded.decode(
                    "utf-8",
                    errors="replace",
                )

            except Exception as exc:

                raise RuntimeError(
                    f"Unable to decode file {path}: {exc}"
                ) from exc

        download_url = data.get(
            "download_url"
        )

        if not download_url:
            return ""

        async with httpx.AsyncClient(
            timeout=self.DEFAULT_TIMEOUT,
            follow_redirects=True,
        ) as client:

            try:

                download_response = (
                    await client.get(
                        download_url,
                        headers=self.headers,
                    )
                )

                download_response.raise_for_status()

                return download_response.text

            except httpx.HTTPError as exc:

                raise RuntimeError(
                    f"Unable to download file {path}: {exc}"
                ) from exc