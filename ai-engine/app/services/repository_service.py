import os
from pathlib import PurePosixPath
from typing import Any, Dict, List, Optional

from app.models.repository_models import (
    RepositoryFile,
    RepositoryFileContent,
    RepositoryMetadata,
    RepositoryStatistics,
    RepositoryStructure,
)

from app.services.github_service import GitHubService


class RepositoryService:
    """
    High-level repository inspection service.

    Responsibilities:
    - Parse repository information
    - Retrieve GitHub metadata
    - Retrieve repository tree
    - Filter irrelevant/binary files
    - Retrieve source contents
    - Build normalized repository models
    - Calculate repository statistics

    Repository code is NEVER executed.
    """

    DEFAULT_MAX_FILE_SIZE = 512 * 1024

    DEFAULT_MAX_FILES = 100

    SOURCE_EXTENSIONS = {
        ".py": "Python",
        ".java": "Java",
        ".js": "JavaScript",
        ".jsx": "JavaScript",
        ".ts": "TypeScript",
        ".tsx": "TypeScript",
        ".mjs": "JavaScript",
        ".cjs": "JavaScript",
        ".java": "Java",
        ".c": "C",
        ".h": "C/C++",
        ".cpp": "C++",
        ".cc": "C++",
        ".cxx": "C++",
        ".hpp": "C++",
        ".cs": "C#",
        ".go": "Go",
        ".rs": "Rust",
        ".php": "PHP",
        ".rb": "Ruby",
        ".kt": "Kotlin",
        ".kts": "Kotlin",
        ".swift": "Swift",
        ".dart": "Dart",
        ".scala": "Scala",
        ".sql": "SQL",
        ".html": "HTML",
        ".htm": "HTML",
        ".css": "CSS",
        ".scss": "SCSS",
        ".sass": "Sass",
        ".vue": "Vue",
        ".xml": "XML",
        ".yaml": "YAML",
        ".yml": "YAML",
        ".json": "JSON",
        ".md": "Markdown",
        ".txt": "Text",
        ".properties": "Properties",
        ".gradle": "Gradle",
        ".sh": "Shell",
        ".bat": "Batch",
        ".ps1": "PowerShell",
        ".toml": "TOML",
        ".ini": "INI",
    }

    SPECIAL_FILES = {
        "dockerfile": "Dockerfile",
        "makefile": "Makefile",
        ".gitignore": "Git Ignore",
        ".dockerignore": "Docker Ignore",
        ".editorconfig": "EditorConfig",
    }

    IGNORED_DIRECTORIES = {
        ".git",
        ".svn",
        ".hg",
        ".idea",
        ".vscode",
        "node_modules",
        "__pycache__",
        ".pytest_cache",
        ".mypy_cache",
        ".venv",
        "venv",
        "env",
        "dist",
        "build",
        "target",
        ".next",
        ".nuxt",
        "coverage",
        ".coverage",
        "vendor",
        "bower_components",
        "bin",
        "obj",
    }

    IGNORED_FILES = {
        ".env",
        ".env.local",
        ".env.production",
        ".env.development",
        ".env.test",
        ".env.staging",
        "id_rsa",
        "id_dsa",
        "id_ecdsa",
        "id_ed25519",
        ".npmrc",
        ".pypirc",
        "credentials.json",
        "service-account.json",
        "secrets.json",
        "secrets.yaml",
        "secrets.yml",
    }

    BINARY_EXTENSIONS = {
        ".png",
        ".jpg",
        ".jpeg",
        ".gif",
        ".webp",
        ".ico",
        ".bmp",
        ".svg",
        ".mp3",
        ".wav",
        ".mp4",
        ".avi",
        ".mov",
        ".zip",
        ".tar",
        ".gz",
        ".7z",
        ".rar",
        ".exe",
        ".dll",
        ".so",
        ".dylib",
        ".pdf",
        ".doc",
        ".docx",
        ".xls",
        ".xlsx",
        ".woff",
        ".woff2",
        ".ttf",
        ".otf",
        ".jar",
        ".class",
        ".bin",
    }

    def __init__(
        self,
        github_service: Optional[GitHubService] = None,
    ):
        self.github_service = (
            github_service
            or GitHubService()
        )

        self.max_file_size = int(
            os.getenv(
                "REPOSITORY_MAX_FILE_SIZE",
                str(
                    self.DEFAULT_MAX_FILE_SIZE
                ),
            )
        )

        self.max_files = int(
            os.getenv(
                "REPOSITORY_MAX_FILES",
                str(
                    self.DEFAULT_MAX_FILES
                ),
            )
        )

    # ==========================================================
    # FILE HELPERS
    # ==========================================================

    @staticmethod
    def _extension(
        path: str,
    ) -> str:

        return PurePosixPath(
            path
        ).suffix.lower()

    def _language(
        self,
        path: str,
    ) -> Optional[str]:

        filename = (
            path.replace("\\", "/")
            .split("/")[-1]
            .lower()
        )

        if filename in self.SPECIAL_FILES:
            return self.SPECIAL_FILES[
                filename
            ]

        extension = self._extension(
            path
        )

        return self.SOURCE_EXTENSIONS.get(
            extension
        )

    def _is_ignored_path(
        self,
        path: str,
    ) -> bool:

        normalized = path.replace(
            "\\",
            "/",
        )

        parts = normalized.split(
            "/"
        )

        for part in parts:

            if part in self.IGNORED_DIRECTORIES:
                return True

        filename = parts[-1].lower()

        ignored_files = {
            item.lower()
            for item in self.IGNORED_FILES
        }

        return filename in ignored_files

    def _is_binary(
        self,
        path: str,
    ) -> bool:

        return (
            self._extension(path)
            in self.BINARY_EXTENSIONS
        )

    def _is_supported_file(
        self,
        path: str,
    ) -> bool:

        if self._is_ignored_path(
            path
        ):
            return False

        if self._is_binary(
            path
        ):
            return False

        return (
            self._language(path)
            is not None
        )

    # ==========================================================
    # BUILD FILE LIST
    # ==========================================================

    def _build_file_list(
        self,
        tree: List[Dict[str, Any]],
        max_files: Optional[int] = None,
    ) -> tuple[
        List[RepositoryFile],
        int,
        int,
    ]:
        """
        Returns (selected_files, skipped_count, total_blob_count).

        total_blob_count is the actual number of blob entries
        in the GitHub tree, regardless of filtering.
        """

        limit = (
            max_files
            if max_files is not None
            else self.max_files
        )

        files: List[
            RepositoryFile
        ] = []

        skipped = 0
        total_blobs = 0

        for item in tree:

            if item.get("type") != "blob":
                continue

            total_blobs += 1

            path = item.get(
                "path",
                "",
            )

            if not path:
                skipped += 1
                continue

            if not self._is_supported_file(
                path
            ):
                skipped += 1
                continue

            size = int(
                item.get(
                    "size",
                    0,
                )
                or 0
            )

            if size > self.max_file_size:
                skipped += 1
                continue

            if len(files) >= limit:
                skipped += 1
                continue

            files.append(
                RepositoryFile(
                    path=path,
                    size=size,
                    extension=self._extension(
                        path
                    ),
                    language=self._language(
                        path
                    ),
                )
            )

        return files, skipped, total_blobs

    # ==========================================================
    # METADATA
    # ==========================================================

    def _build_metadata(
        self,
        metadata: Dict[str, Any],
        owner: str,
        repository: str,
        branch: str,
    ) -> RepositoryMetadata:

        return RepositoryMetadata(
            owner=owner,
            name=repository,
            url=self.github_service.canonical_url(
                owner,
                repository,
            ),
            branch=branch,
            description=metadata.get(
                "description"
            ),
            default_branch=metadata.get(
                "default_branch"
            ),
            private=bool(
                metadata.get(
                    "private",
                    False,
                )
            ),
            fork=bool(
                metadata.get(
                    "fork",
                    False,
                )
            ),
            stars=int(
                metadata.get(
                    "stars",
                    0,
                )
                or 0
            ),
            forks=int(
                metadata.get(
                    "forks",
                    0,
                )
                or 0
            ),
            open_issues=int(
                metadata.get(
                    "open_issues",
                    0,
                )
                or 0
            ),
        )

    # ==========================================================
    # LANGUAGE STATISTICS
    # ==========================================================

    def _build_language_statistics(
        self,
        files: List[RepositoryFile],
    ) -> Dict[str, int]:

        result: Dict[str, int] = {}

        for file in files:

            language = (
                file.language
                or "Unknown"
            )

            result[language] = (
                result.get(
                    language,
                    0,
                )
                + 1
            )

        return result

    # ==========================================================
    # CONTENT RETRIEVAL
    # ==========================================================

    async def _retrieve_contents(
        self,
        owner: str,
        repository: str,
        branch: str,
        files: List[RepositoryFile],
    ) -> tuple[
        List[RepositoryFileContent],
        int,
    ]:

        contents: List[
            RepositoryFileContent
        ] = []

        skipped = 0

        for file in files:

            try:

                content = (
                    await self.github_service
                    .get_file_content(
                        owner=owner,
                        repository=repository,
                        path=file.path,
                        branch=branch,
                    )
                )

            except (
                ValueError,
                RuntimeError,
            ):

                skipped += 1
                continue

            contents.append(
                RepositoryFileContent(
                    path=file.path,
                    size=file.size,
                    extension=file.extension,
                    language=file.language,
                    content=content,
                    truncated=False,
                )
            )

        return contents, skipped

    # ==========================================================
    # MAIN INSPECTION
    # ==========================================================

    async def inspect_repository(
        self,
        repository_url: str,
        branch: Optional[str] = None,
        include_contents: bool = True,
        max_files: Optional[int] = None,
    ) -> RepositoryStructure:

        owner, repository = (
            self.github_service
            .parse_repository_url(
                repository_url
            )
        )

        metadata = (
            await self.github_service
            .get_repository_metadata(
                owner,
                repository,
            )
        )

        selected_branch = (
            branch
            or metadata.get(
                "default_branch"
            )
            or "main"
        )

        tree = (
            await self.github_service
            .get_repository_tree(
                owner=owner,
                repository=repository,
                branch=selected_branch,
            )
        )

        files, skipped_files, total_blobs = (
            self._build_file_list(
                tree=tree,
                max_files=max_files,
            )
        )

        contents: List[
            RepositoryFileContent
        ] = []

        content_failures = 0

        if include_contents:

            (
                contents,
                content_failures,
            ) = await self._retrieve_contents(
                owner=owner,
                repository=repository,
                branch=selected_branch,
                files=files,
            )

        total_skipped = (
            skipped_files
            + content_failures
        )

        total_source_bytes = sum(
            file.size
            for file in files
        )

        statistics = RepositoryStatistics(
            total_files=total_blobs,
            analyzed_files=len(contents),
            skipped_files=total_skipped,
            total_source_files=len(files),
            total_source_bytes=total_source_bytes,
            languages=(
                self._build_language_statistics(
                    files
                )
            ),
        )

        return RepositoryStructure(
            metadata=self._build_metadata(
                metadata=metadata,
                owner=owner,
                repository=repository,
                branch=selected_branch,
            ),
            statistics=statistics,
            files=files,
            contents=contents,
        )

    # ==========================================================
    # CONTENT-ONLY API
    # ==========================================================

    async def get_repository_contents(
        self,
        repository_url: str,
        branch: Optional[str] = None,
        max_files: Optional[int] = None,
    ) -> List[RepositoryFileContent]:

        repository = (
            await self.inspect_repository(
                repository_url=repository_url,
                branch=branch,
                include_contents=True,
                max_files=max_files,
            )
        )

        return repository.contents

    # ==========================================================
    # COMMITS API
    # ==========================================================

    async def get_commit_history(
        self,
        repository_url: str,
        branch: Optional[str] = None,
        limit: int = 10,
    ) -> List[Dict[str, Any]]:
        owner, repository = self.github_service.parse_repository_url(repository_url)
        resolved_branch = await self.github_service.resolve_branch(repository_url, branch)
        
        commits = await self.github_service.get_commits(
            owner=owner,
            repository=repository,
            branch=resolved_branch,
            per_page=limit,
        )
        
        result = []
        for commit in commits:
            sha = commit.get("sha")
            try:
                diff = await self.github_service.get_commit_diff(owner, repository, sha)
            except Exception:
                diff = ""
                
            result.append({
                "sha": sha,
                "author": commit.get("commit", {}).get("author", {}).get("name"),
                "date": commit.get("commit", {}).get("author", {}).get("date"),
                "message": commit.get("commit", {}).get("message"),
                "diff": diff[:5000] # truncate very large diffs
            })
            
        return result