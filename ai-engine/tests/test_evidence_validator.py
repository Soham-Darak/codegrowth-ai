import pytest
from app.services.evidence_validator import EvidenceValidator
from app.models.evidence_models import EvidenceValidationResult, EvidenceItem

def test_evidence_validator_finds_post_endpoint():
    validator = EvidenceValidator()
    code = "@RestController\nclass MyController {\n  @PostMapping('/api/test')\n  public void test() {}\n}"
    requirements = ["Create a POST endpoint for testing"]
    
    result = validator.validate(code, requirements)
    
    assert isinstance(result, EvidenceValidationResult)
    
    found_post = False
    for item in result.items:
        if item.type == "REST_ENDPOINT" and item.found:
            found_post = True
            break
            
    assert found_post, "Validator failed to find @PostMapping"

def test_evidence_validator_finds_jpa_entity():
    validator = EvidenceValidator()
    code = "@Entity\n@Table(name='users')\npublic class User {}"
    requirements = ["Must create a JPA entity for User"]
    
    result = validator.validate(code, requirements)
    
    found_entity = False
    for item in result.items:
        if item.type == "JPA" and item.found:
            found_entity = True
            break
            
    assert found_entity, "Validator failed to find @Entity"
