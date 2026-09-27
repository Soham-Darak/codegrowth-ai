import re
from typing import List

from app.models.code_analysis_models import (
    CodeFinding,
    DeterministicAnalysisResult,
    FileAnalysisResult,
)

from app.models.repository_models import (
    RepositoryFileContent,
)


class CodeAnalysisService:

    # ========================================================
    # REGEX PATTERNS
    # ========================================================

    SECRET_PATTERNS = [
        (
            "AWS Access Key",
            re.compile(
                r"\bAKIA[0-9A-Z]{16}\b"
            )
        ),
        (
            "Private Key",
            re.compile(
                r"-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----"
            )
        ),
        (
            "Generic API Key",
            re.compile(
                r"""(?i)\b(?:api[_-]?key|secret[_-]?key)\s*[:=]\s*['"][^'"]{8,}['"]"""
            )
        ),
        (
            "Hardcoded Password",
            re.compile(
                r"""(?i)\bpassword\s*[:=]\s*['"][^'"]+['"]"""
            )
        ),
        (
            "Generic Secret",
            re.compile(
                r"""(?i)\b(?:token|secret)\s*[:=]\s*['"][^'"]{8,}['"]"""
            )
        ),
    ]

    SQL_PATTERNS = [
        re.compile(
            r"""(?i)\b(?:SELECT|INSERT|UPDATE|DELETE)\b.*(?:\+|%s|\{.*\})"""
        ),
        re.compile(
            r"""(?i)\b(?:execute|executemany|raw|query)\s*\("""
        ),
    ]

    TODO_PATTERN = re.compile(
        r"(?i)\b(TODO|FIXME|HACK)\b"
    )

    DEBUG_PATTERNS = {
        "Python": re.compile(
            r"\bprint\s*\("
        ),
        "Java": re.compile(
            r"\bSystem\.out\.print(?:ln)?\s*\("
        ),
        "JavaScript": re.compile(
            r"\bconsole\.(log|debug|info)\s*\("
        ),
        "TypeScript": re.compile(
            r"\bconsole\.(log|debug|info)\s*\("
        ),
    }

    TEST_PATH_PATTERN = re.compile(
        r"(?i)(^|/)(test|tests|__tests__)(/|$)"
    )

    TEST_FILE_PATTERN = re.compile(
        r"(?i)(test_|_test\.|\.test\.|\.spec\.)"
    )

    # ========================================================
    # ANALYZE FILE
    # ========================================================

    def analyze_file(
        self,
        file: RepositoryFileContent
    ) -> FileAnalysisResult:

        lines = file.content.splitlines()

        findings: List[CodeFinding] = []

        findings.extend(
            self._detect_secrets(
                file,
                lines
            )
        )

        findings.extend(
            self._detect_sql_patterns(
                file,
                lines
            )
        )

        findings.extend(
            self._detect_todos(
                file,
                lines
            )
        )

        findings.extend(
            self._detect_debug_output(
                file,
                lines
            )
        )

        findings.extend(
            self._detect_empty_file(
                file
            )
        )

        return FileAnalysisResult(
            path=file.path,
            language=file.language,
            lines=len(lines),
            findings=findings,
            summary=self._build_summary(
                file,
                findings
            )
        )

    # ========================================================
    # ANALYZE REPOSITORY
    # ========================================================

    def analyze_repository(
        self,
        files: List[RepositoryFileContent]
    ) -> DeterministicAnalysisResult:

        analyzed_files = []

        for file in files:

            if file.truncated:
                continue

            analyzed_files.append(
                self.analyze_file(
                    file
                )
            )

        total_findings = sum(
            len(file.findings)
            for file in analyzed_files
        )

        files_with_findings = sum(
            1
            for file in analyzed_files
            if file.findings
        )

        high = 0
        medium = 0
        low = 0
        info = 0

        for file in analyzed_files:

            for finding in file.findings:

                severity = finding.severity.upper()

                if severity == "HIGH":
                    high += 1

                elif severity == "MEDIUM":
                    medium += 1

                elif severity == "LOW":
                    low += 1

                elif severity == "INFO":
                    info += 1

        return DeterministicAnalysisResult(
            total_files=len(files),
            analyzed_files=len(analyzed_files),
            files_with_findings=files_with_findings,
            total_findings=total_findings,
            high_severity_findings=high,
            medium_severity_findings=medium,
            low_severity_findings=low,
            info_findings=info,
            files=analyzed_files
        )

    # ========================================================
    # SECRET DETECTION
    # ========================================================

    def _detect_secrets(
        self,
        file: RepositoryFileContent,
        lines: List[str]
    ) -> List[CodeFinding]:

        findings = []

        for line_number, line in enumerate(
            lines,
            start=1
        ):

            for name, pattern in self.SECRET_PATTERNS:

                if pattern.search(line):

                    findings.append(
                        CodeFinding(
                            file=file.path,
                            line=line_number,
                            category="security",
                            severity="HIGH",
                            title=f"Possible {name}",
                            description=(
                                "A possible hardcoded secret "
                                "or credential was detected."
                            ),
                            evidence=[
                                self._safe_evidence(
                                    line
                                )
                            ],
                            suggestion=(
                                "Move secrets to environment "
                                "variables or a dedicated "
                                "secret-management system."
                            )
                        )
                    )

        return findings

    # ========================================================
    # SQL DETECTION
    # ========================================================

    def _detect_sql_patterns(
        self,
        file: RepositoryFileContent,
        lines: List[str]
    ) -> List[CodeFinding]:

        supported_languages = {
            "Python",
            "Java",
            "JavaScript",
            "TypeScript",
            "PHP",
            "C#",
            "Ruby",
        }

        if file.language not in supported_languages:
            return []

        findings = []

        for line_number, line in enumerate(
            lines,
            start=1
        ):

            for pattern in self.SQL_PATTERNS:

                if pattern.search(line):

                    findings.append(
                        CodeFinding(
                            file=file.path,
                            line=line_number,
                            category="security",
                            severity="MEDIUM",
                            title=(
                                "Potential unsafe SQL construction"
                            ),
                            description=(
                                "The source contains a database "
                                "query pattern that should be "
                                "reviewed for parameterization."
                            ),
                            evidence=[
                                self._safe_evidence(
                                    line
                                )
                            ],
                            suggestion=(
                                "Use parameterized queries, "
                                "prepared statements, or the "
                                "framework's ORM safely."
                            )
                        )
                    )

                    break

        return findings

    # ========================================================
    # TODO / FIXME
    # ========================================================

    def _detect_todos(
        self,
        file: RepositoryFileContent,
        lines: List[str]
    ) -> List[CodeFinding]:

        findings = []

        for line_number, line in enumerate(
            lines,
            start=1
        ):

            if self.TODO_PATTERN.search(line):

                findings.append(
                    CodeFinding(
                        file=file.path,
                        line=line_number,
                        category="maintainability",
                        severity="LOW",
                        title="Pending implementation marker",
                        description=(
                            "The source contains a TODO, "
                            "FIXME, or HACK marker."
                        ),
                        evidence=[
                            self._safe_evidence(
                                line
                            )
                        ],
                        suggestion=(
                            "Review and resolve the pending "
                            "implementation item."
                        )
                    )
                )

        return findings

    # ========================================================
    # DEBUG OUTPUT
    # ========================================================

    def _detect_debug_output(
        self,
        file: RepositoryFileContent,
        lines: List[str]
    ) -> List[CodeFinding]:

        pattern = self.DEBUG_PATTERNS.get(
            file.language
        )

        if not pattern:
            return []

        findings = []

        for line_number, line in enumerate(
            lines,
            start=1
        ):

            if pattern.search(line):

                findings.append(
                    CodeFinding(
                        file=file.path,
                        line=line_number,
                        category="quality",
                        severity="LOW",
                        title="Debug output statement",
                        description=(
                            "Debug output was detected "
                            "in source code."
                        ),
                        evidence=[
                            self._safe_evidence(
                                line
                            )
                        ],
                        suggestion=(
                            "Replace temporary debug output "
                            "with structured logging or "
                            "remove it before production."
                        )
                    )
                )

        return findings

    # ========================================================
    # EMPTY FILE
    # ========================================================

    def _detect_empty_file(
        self,
        file: RepositoryFileContent
    ) -> List[CodeFinding]:

        if file.size != 0:
            return []

        if file.content.strip():
            return []

        return [
            CodeFinding(
                file=file.path,
                line=None,
                category="quality",
                severity="INFO",
                title="Empty source file",
                description=(
                    "The repository contains an empty "
                    "supported source file."
                ),
                evidence=[],
                suggestion=(
                    "Remove the file if it is unnecessary "
                    "or add the required implementation."
                )
            )
        ]

    # ========================================================
    # HELPERS
    # ========================================================

    def _safe_evidence(
        self,
        line: str
    ) -> str:

        if len(line) > 300:
            return line[:297] + "..."

        return line

    def _build_summary(
        self,
        file: RepositoryFileContent,
        findings: List[CodeFinding]
    ) -> str:

        if not findings:

            return (
                f"No deterministic findings were detected "
                f"in {file.path}."
            )

        return (
            f"{len(findings)} deterministic finding(s) "
            f"detected in {file.path}."
        )