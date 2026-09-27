"""
Extended tests for EvidenceValidator — all pattern matchers, edge cases,
and the PostgreSQL / validation / testing checkers.
"""

import pytest

from app.services.evidence_validator import EvidenceValidator
from app.models.evidence_models import EvidenceValidationResult, EvidenceItem


@pytest.fixture
def validator():
    return EvidenceValidator()


# ==============================================================
# INPUT VALIDATION
# ==============================================================

def test_validate_rejects_empty_code(validator):
    with pytest.raises(ValueError, match="Student code is required"):
        validator.validate("", ["some requirement"])


def test_validate_rejects_none_code(validator):
    with pytest.raises(ValueError, match="Student code is required"):
        validator.validate(None, ["some requirement"])


def test_validate_rejects_non_list_requirements(validator):
    with pytest.raises(ValueError, match="Requirements must be a list"):
        validator.validate("code", "not a list")


# ==============================================================
# REST ENDPOINT — POST
# ==============================================================

def test_finds_post_endpoint(validator):
    code = "@PostMapping('/api/users')\npublic void create() {}"
    result = validator.validate(code, ["Create a POST endpoint"])
    assert result.items[0].found is True
    assert result.items[0].type == "REST_ENDPOINT"


def test_post_not_found(validator):
    code = "public class Controller {}"
    result = validator.validate(code, ["Create a POST endpoint"])
    assert result.items[0].found is False


# ==============================================================
# REST ENDPOINT — GET
# ==============================================================

def test_finds_get_endpoint(validator):
    code = "@GetMapping('/api/users')\npublic List<User> list() {}"
    result = validator.validate(code, ["Create a GET endpoint"])
    assert result.items[0].found is True


def test_get_not_found(validator):
    code = "@PostMapping('/api')\npublic void x() {}"
    result = validator.validate(code, ["Create a GET endpoint"])
    assert result.items[0].found is False


# ==============================================================
# REST ENDPOINT — PUT
# ==============================================================

def test_finds_put_endpoint(validator):
    code = "@PutMapping('/api/users/{id}')\npublic void update() {}"
    result = validator.validate(code, ["Create a PUT endpoint"])
    assert result.items[0].found is True


def test_put_not_found(validator):
    code = "@PostMapping\npublic void x() {}"
    result = validator.validate(code, ["Create a PUT endpoint"])
    assert result.items[0].found is False


# ==============================================================
# REST ENDPOINT — DELETE
# ==============================================================

def test_finds_delete_endpoint(validator):
    code = "@DeleteMapping('/api/users/{id}')\npublic void delete() {}"
    result = validator.validate(code, ["Create a DELETE endpoint"])
    assert result.items[0].found is True


def test_delete_not_found(validator):
    code = "@GetMapping\npublic void x() {}"
    result = validator.validate(code, ["Create a DELETE endpoint"])
    assert result.items[0].found is False


# ==============================================================
# JPA ENTITY
# ==============================================================

def test_finds_entity(validator):
    code = "@Entity\n@Table(name='users')\npublic class User {}"
    result = validator.validate(code, ["Must create a JPA entity"])
    assert result.items[0].found is True
    assert result.items[0].type == "JPA"


def test_entity_not_found(validator):
    code = "public class User {}"
    result = validator.validate(code, ["Must create a JPA entity"])
    assert result.items[0].found is False


# ==============================================================
# REPOSITORY
# ==============================================================

def test_finds_repository(validator):
    code = "@Repository\npublic interface UserRepo extends JpaRepository<User, Long> {}"
    result = validator.validate(code, ["Must create a repository"])
    assert result.items[0].found is True
    assert result.items[0].type == "DATABASE"


# ==============================================================
# POSTGRESQL
# ==============================================================

def test_finds_postgresql_jdbc(validator):
    code = "spring.datasource.url=jdbc:postgresql://localhost:5432/db"
    result = validator.validate(code, ["Must use PostgreSQL"])
    assert result.items[0].found is True
    assert result.items[0].type == "DATABASE"


def test_finds_postgresql_driver(validator):
    code = "import org.postgresql.Driver"
    result = validator.validate(code, ["Must use Postgres"])
    assert result.items[0].found is True


def test_postgresql_not_found(validator):
    code = "spring.datasource.url=jdbc:mysql://localhost:3306/db"
    result = validator.validate(code, ["Must use PostgreSQL"])
    assert result.items[0].found is False


# ==============================================================
# INPUT VALIDATION
# ==============================================================

def test_finds_validation_annotations(validator):
    code = "@NotNull\nprivate String name;\n@Size(max=100)\nprivate String email;"
    result = validator.validate(code, ["Must have input validation"])
    assert result.items[0].found is True
    assert result.items[0].type == "VALIDATION"


def test_validation_not_found(validator):
    code = "private String name;\nprivate String email;"
    result = validator.validate(code, ["Must have validation"])
    assert result.items[0].found is False


# ==============================================================
# TESTING
# ==============================================================

def test_finds_test_annotations(validator):
    code = "@Test\npublic void testCreate() {}\n@SpringBootTest\nclass AppTest {}"
    result = validator.validate(code, ["Must have testing"])
    assert result.items[0].found is True
    assert result.items[0].type == "TESTING"


def test_testing_not_found(validator):
    code = "public class App { public static void main(String[] args) {} }"
    result = validator.validate(code, ["Must have unit tests"])
    assert result.items[0].found is False


# ==============================================================
# UNKNOWN REQUIREMENTS
# ==============================================================

def test_unknown_requirement_returns_unknown_type(validator):
    code = "public class App {}"
    result = validator.validate(code, ["Must follow SOLID principles"])
    assert result.items[0].type == "UNKNOWN"
    assert result.items[0].found is False


# ==============================================================
# AGGREGATE STATISTICS
# ==============================================================

def test_aggregate_counts(validator):
    code = (
        "@PostMapping('/api/test')\npublic void test() {}\n"
        "@Entity\npublic class User {}\n"
    )
    requirements = [
        "Create a POST endpoint for testing",
        "Must create a JPA entity for User",
        "Must follow clean code practices",  # UNKNOWN
    ]
    result = validator.validate(code, requirements)

    assert result.total_requirements == 3
    assert result.satisfied_requirements == 2  # POST + Entity found
    assert result.unsatisfied_requirements == 1  # UNKNOWN=not found

    assert isinstance(result, EvidenceValidationResult)
    assert len(result.items) == 3
