import re

from app.models.evidence_models import (
    EvidenceItem,
    EvidenceValidationResult
)


class EvidenceValidator:

    # ==================================================
    # REST ENDPOINT PATTERNS
    # ==================================================

    POST_MAPPING_PATTERN = re.compile(
        r"@PostMapping\s*(?:\([^)]*\))?",
        re.IGNORECASE
    )

    GET_MAPPING_PATTERN = re.compile(
        r"@GetMapping\s*(?:\([^)]*\))?",
        re.IGNORECASE
    )

    PUT_MAPPING_PATTERN = re.compile(
        r"@PutMapping\s*(?:\([^)]*\))?",
        re.IGNORECASE
    )

    DELETE_MAPPING_PATTERN = re.compile(
        r"@DeleteMapping\s*(?:\([^)]*\))?",
        re.IGNORECASE
    )

    # ==================================================
    # JPA / DATABASE PATTERNS
    # ==================================================

    ENTITY_PATTERN = re.compile(
        r"@Entity\b",
        re.IGNORECASE
    )

    REPOSITORY_PATTERN = re.compile(
        r"@Repository\b",
        re.IGNORECASE
    )

    # ==================================================
    # VALIDATION PATTERNS
    # ==================================================

    VALIDATION_PATTERNS = [
        re.compile(r"@Valid\b"),
        re.compile(r"@NotNull\b"),
        re.compile(r"@NotBlank\b"),
        re.compile(r"@NotEmpty\b"),
        re.compile(r"@Size\b"),
        re.compile(r"@Min\b"),
        re.compile(r"@Max\b"),
        re.compile(r"@Positive\b"),
        re.compile(r"@PositiveOrZero\b"),
        re.compile(r"@Negative\b"),
        re.compile(r"@NegativeOrZero\b"),
        re.compile(r"@Email\b"),
        re.compile(r"@Pattern\b")
    ]

    # ==================================================
    # TESTING PATTERNS
    # ==================================================

    TEST_PATTERNS = [
        re.compile(r"@Test\b"),
        re.compile(r"@SpringBootTest\b"),
        re.compile(r"@WebMvcTest\b"),
        re.compile(r"@DataJpaTest\b")
    ]

    # ==================================================
    # PUBLIC VALIDATION METHOD
    # ==================================================

    def validate(
        self,
        code: str,
        requirements: list[str]
    ) -> EvidenceValidationResult:

        if not isinstance(
            code,
            str
        ) or not code.strip():

            raise ValueError(
                "Student code is required for evidence validation"
            )

        if not isinstance(
            requirements,
            list
        ):

            raise ValueError(
                "Requirements must be a list"
            )

        normalized_requirements = [
            str(requirement).strip()
            for requirement in requirements
            if str(requirement).strip()
        ]

        items: list[EvidenceItem] = []

        for requirement in normalized_requirements:

            item = self._validate_requirement(
                code,
                requirement
            )

            items.append(item)

        satisfied_count = sum(
            1
            for item in items
            if item.found
        )

        unsatisfied_count = (
            len(items) - satisfied_count
        )

        return EvidenceValidationResult(
            items=items,
            total_requirements=len(items),
            satisfied_requirements=satisfied_count,
            unsatisfied_requirements=unsatisfied_count
        )

    # ==================================================
    # REQUIREMENT CLASSIFICATION
    # ==================================================

    def _validate_requirement(
        self,
        code: str,
        requirement: str
    ) -> EvidenceItem:

        requirement_lower = requirement.lower()

        # ----------------------------------------------
        # REST endpoints
        # ----------------------------------------------

        if "post endpoint" in requirement_lower:

            return self._check_pattern(
                code,
                requirement,
                self.POST_MAPPING_PATTERN,
                "REST_ENDPOINT",
                "POST endpoint"
            )

        if "get endpoint" in requirement_lower:

            return self._check_pattern(
                code,
                requirement,
                self.GET_MAPPING_PATTERN,
                "REST_ENDPOINT",
                "GET endpoint"
            )

        if "put endpoint" in requirement_lower:

            return self._check_pattern(
                code,
                requirement,
                self.PUT_MAPPING_PATTERN,
                "REST_ENDPOINT",
                "PUT endpoint"
            )

        if "delete endpoint" in requirement_lower:

            return self._check_pattern(
                code,
                requirement,
                self.DELETE_MAPPING_PATTERN,
                "REST_ENDPOINT",
                "DELETE endpoint"
            )

        # ----------------------------------------------
        # PostgreSQL
        # ----------------------------------------------

        if (
            "postgresql" in requirement_lower
            or "postgres" in requirement_lower
        ):

            return self._check_postgresql(
                code,
                requirement
            )

        # ----------------------------------------------
        # Input validation
        # ----------------------------------------------

        if (
            "input validation" in requirement_lower
            or "validation" in requirement_lower
        ):

            return self._check_validation(
                code,
                requirement
            )

        # ----------------------------------------------
        # Testing
        # ----------------------------------------------

        if (
            "testing" in requirement_lower
            or "unit test" in requirement_lower
            or "tests" in requirement_lower
        ):

            return self._check_testing(
                code,
                requirement
            )

        # ----------------------------------------------
        # JPA entity
        # ----------------------------------------------

        if (
            "@entity" in requirement_lower
            or "jpa entity" in requirement_lower
            or "entity" in requirement_lower
        ):

            return self._check_pattern(
                code,
                requirement,
                self.ENTITY_PATTERN,
                "JPA",
                "JPA entity"
            )

        # ----------------------------------------------
        # Repository
        # ----------------------------------------------

        if "repository" in requirement_lower:

            return self._check_pattern(
                code,
                requirement,
                self.REPOSITORY_PATTERN,
                "DATABASE",
                "repository"
            )

        # ----------------------------------------------
        # Unknown requirement
        # ----------------------------------------------

        return EvidenceItem(
            type="UNKNOWN",
            requirement=requirement,
            found=False,
            evidence=[],
            details=(
                "No deterministic validator is currently "
                "implemented for this requirement."
            )
        )

    # ==================================================
    # GENERIC PATTERN CHECKER
    # ==================================================

    def _check_pattern(
        self,
        code: str,
        requirement: str,
        pattern: re.Pattern,
        evidence_type: str,
        description: str
    ) -> EvidenceItem:

        matches = pattern.findall(code)

        unique_matches = list(
            dict.fromkeys(matches)
        )

        if unique_matches:

            return EvidenceItem(
                type=evidence_type,
                requirement=requirement,
                found=True,
                evidence=unique_matches,
                details=(
                    f"Found explicit {description} "
                    "implementation in the submitted code."
                )
            )

        return EvidenceItem(
            type=evidence_type,
            requirement=requirement,
            found=False,
            evidence=[],
            details=(
                f"No explicit {description} "
                "implementation was found."
            )
        )

    # ==================================================
    # POSTGRESQL CHECKER
    # ==================================================

    def _check_postgresql(
        self,
        code: str,
        requirement: str
    ) -> EvidenceItem:

        patterns = [
            re.compile(
                r"jdbc:postgresql:",
                re.IGNORECASE
            ),
            re.compile(
                r"org\.postgresql",
                re.IGNORECASE
            ),
            re.compile(
                r"postgresql",
                re.IGNORECASE
            )
        ]

        evidence: list[str] = []

        for pattern in patterns:

            matches = pattern.findall(code)

            evidence.extend(matches)

        evidence = list(
            dict.fromkeys(evidence)
        )

        if evidence:

            return EvidenceItem(
                type="DATABASE",
                requirement=requirement,
                found=True,
                evidence=evidence,
                details=(
                    "PostgreSQL-related database "
                    "configuration or dependency was found."
                )
            )

        return EvidenceItem(
            type="DATABASE",
            requirement=requirement,
            found=False,
            evidence=[],
            details=(
                "No PostgreSQL-specific database "
                "evidence was found."
            )
        )

    # ==================================================
    # VALIDATION CHECKER
    # ==================================================

    def _check_validation(
        self,
        code: str,
        requirement: str
    ) -> EvidenceItem:

        evidence: list[str] = []

        for pattern in self.VALIDATION_PATTERNS:

            matches = pattern.findall(code)

            evidence.extend(matches)

        evidence = list(
            dict.fromkeys(evidence)
        )

        if evidence:

            return EvidenceItem(
                type="VALIDATION",
                requirement=requirement,
                found=True,
                evidence=evidence,
                details=(
                    "Explicit input validation "
                    "annotations were found."
                )
            )

        return EvidenceItem(
            type="VALIDATION",
            requirement=requirement,
            found=False,
            evidence=[],
            details=(
                "No supported input validation "
                "annotations were found."
            )
        )

    # ==================================================
    # TESTING CHECKER
    # ==================================================

    def _check_testing(
        self,
        code: str,
        requirement: str
    ) -> EvidenceItem:

        evidence: list[str] = []

        for pattern in self.TEST_PATTERNS:

            matches = pattern.findall(code)

            evidence.extend(matches)

        evidence = list(
            dict.fromkeys(evidence)
        )

        if evidence:

            return EvidenceItem(
                type="TESTING",
                requirement=requirement,
                found=True,
                evidence=evidence,
                details=(
                    "Explicit test-related annotations "
                    "were found."
                )
            )

        return EvidenceItem(
            type="TESTING",
            requirement=requirement,
            found=False,
            evidence=[],
            details=(
                "No supported test annotations "
                "were found."
            )
        )