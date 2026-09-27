import os
import shutil
import subprocess
import tempfile
from pathlib import Path
from typing import List, Optional

from app.models.repository_models import (
    RepositoryFile,
    RepositoryMetadata,
    RepositoryStructure
)
from app.services.github_service import GitHubService


class RepositoryService:

    DEFAULT_MAX_FILE_SIZE = 512 * 1024

    DEFAULT_MAX_FILES = 1000

    SOURCE_EXTENSIONS = {
        ".py": "Python",
        ".js": "JavaScript",
        ".jsx": "JavaScript",
        ".ts": "TypeScript",
        ".tsx": "TypeScript",
        ".java": "Java",
        ".c": "C",
        ".h": "C",
        ".cpp": "C++",
        ".cc": "C++",
        ".cxx": "C++",
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
        ".css": "CSS",
        ".scss": "SCSS",
        ".vue": "Vue",
        ".xml": "XML",
        ".yaml": "YAML",
        ".yml": "YAML",
        ".json": "JSON",
        ".md": "Markdown"
    }

    IGNORED_DIRECTORIES = {
        ".git",
        ".svn",
        ".hg",

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

        ".idea",
        ".vscode"
    }

    IGNORED_FILENAMES = {
        ".env",
        ".env.local",
        ".env.production",
        ".env.development",

        "id_rsa",
        "id_dsa",
        "id_ecdsa",
        "id_ed25519",

        "credentials",
        "credentials.json",

        ".npmrc",
        ".pypirc"
    }

    IGNORED_EXTENSIONS = {
        ".exe",
        ".dll",
        ".so",
        ".dylib",

        ".bin",
        ".class",

        ".jar",
        ".war",

        ".pyc",

        ".png",
        ".jpg",
        ".jpeg",
        ".gif",
        ".bmp",
        ".ico",
        ".webp",

        ".mp3",
        ".mp4",
        ".avi",
        ".mov",

        ".zip",
        ".tar",
        ".gz",
        ".7z",
        ".rar",

        ".pdf"
    }

    def __init__(
        self,
        github_service: GitHubService
    ):
        self.github_service = github_service

        self.max_file_size = int(
            os.getenv(
                "REPOSITORY_MAX_FILE_SIZE",
                str(self.DEFAULT_MAX_FILE_SIZE)
            )
        )

        self.max_files = int(
            os.getenv(
                "REPOSITORY_MAX_FILES",
                str(self.DEFAULT_MAX_FILES)
            )
        )

        self.clone_timeout = int(
            os.getenv(
                "REPOSITORY_CLONE_TIMEOUT",
                "120"
            )
        )

    # ==========================================================
    # CLONE REPOSITORY
    # ==========================================================

    def clone_repository(
        self,
        repository_url: str,
        branch: Optional[str] = None
    ) -> str:

        owner, repository = (
            self.github_service.parse_repository_url(
                repository_url
            )
        )

        clone_url = (
            self.github_service.clone_url(
                owner,
                repository
            )
        )

        temporary_directory = tempfile.mkdtemp(
            prefix="codegrowth-repository-"
        )

        command = [
            "git",
            "clone",
            "--depth",
            "1",
            "--no-tags",
            "--single-branch"
        ]

        if branch:
            command.extend(
                [
                    "--branch",
                    branch
                ]
            )

        command.extend(
            [
                clone_url,
                temporary_directory
            ]
        )

        try:

            subprocess.run(
                command,
                check=True,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                timeout=self.clone_timeout
            )

        except subprocess.TimeoutExpired as exc:

            shutil.rmtree(
                temporary_directory,
                ignore_errors=True
            )

            raise RuntimeError(
                "Repository cloning timed out"
            ) from exc

        except subprocess.CalledProcessError as exc:

            shutil.rmtree(
                temporary_directory,
                ignore_errors=True
            )

            error_message = (
                exc.stderr.strip()
                if exc.stderr
                else "Unknown git error"
            )

            raise RuntimeError(
                f"Repository cloning failed: "
                f"{error_message}"
            ) from exc

        except FileNotFoundError as exc:

            shutil.rmtree(
                temporary_directory,
                ignore_errors=True
            )

            raise RuntimeError(
                "Git executable was not found. "
                "Install Git and ensure it is available "
                "on PATH."
            ) from exc

        return temporary_directory

    # ==========================================================
    # FILE VALIDATION
    # ==========================================================

    def _is_allowed_file(
        self,
        path: Path
    ) -> bool:

        if path.name in self.IGNORED_FILENAMES:
            return False

        if path.suffix.lower() in self.IGNORED_EXTENSIONS:
            return False

        if path.suffix.lower() not in self.SOURCE_EXTENSIONS:
            return False

        try:

            size = path.stat().st_size

        except OSError:

            return False

        if size > self.max_file_size:
            return False

        return True

    # ==========================================================
    # DIRECTORY VALIDATION
    # ==========================================================

    def _is_ignored_directory(
        self,
        path: Path
    ) -> bool:

        return path.name in self.IGNORED_DIRECTORIES

    # ==========================================================
    # FILE DISCOVERY
    # ==========================================================

    def discover_files(
        self,
        repository_path: str
    ) -> List[RepositoryFile]:

        root = Path(
            repository_path
        ).resolve()

        if not root.exists():
            raise ValueError(
                "Repository directory does not exist"
            )

        if not root.is_dir():
            raise ValueError(
                "Repository path is not a directory"
            )

        discovered_files: List[
            RepositoryFile
        ] = []

        for current_root, directories, filenames in os.walk(
            root
        ):

            current_path = Path(
                current_root
            )

            directories[:] = [
                directory
                for directory in directories
                if not self._is_ignored_directory(
                    current_path / directory
                )
            ]

            for filename in filenames:

                file_path = (
                    current_path / filename
                )

                if not self._is_allowed_file(
                    file_path
                ):
                    continue

                try:

                    relative_path = (
                        file_path
                        .relative_to(root)
                        .as_posix()
                    )

                    size = file_path.stat().st_size

                except OSError:

                    continue

                extension = (
                    file_path.suffix.lower()
                )

                language = (
                    self.SOURCE_EXTENSIONS.get(
                        extension
                    )
                )

                discovered_files.append(
                    RepositoryFile(
                        path=relative_path,
                        size=size,
                        extension=extension,
                        language=language
                    )
                )

                if (
                    len(discovered_files)
                    >= self.max_files
                ):
                    return discovered_files

        return discovered_files

    # ==========================================================
    # BUILD REPOSITORY STRUCTURE
    # ==========================================================

    async def inspect_repository(
        self,
        repository_url: str,
        branch: Optional[str] = None
    ) -> RepositoryStructure:

        owner, repository = (
            self.github_service.parse_repository_url(
                repository_url
            )
        )

        metadata = (
            await self.github_service
            .get_repository_metadata(
                owner,
                repository
            )
        )

        temporary_directory = None

        try:

            temporary_directory = (
                self.clone_repository(
                    repository_url,
                    branch
                )
            )

            files = self.discover_files(
                temporary_directory
            )

            repository_metadata = (
                RepositoryMetadata(
                    owner=owner,
                    name=repository,
                    url=self.github_service
                    .canonical_url(
                        owner,
                        repository
                    ),
                    branch=(
                        branch
                        or metadata.get(
                            "default_branch"
                        )
                    )
                )
            )

            return RepositoryStructure(
                metadata=repository_metadata,
                total_files=len(files),
                analyzed_files=len(files),
                skipped_files=0,
                files=files
            )

        finally:

            if temporary_directory:

                shutil.rmtree(
                    temporary_directory,
                    ignore_errors=True
                )