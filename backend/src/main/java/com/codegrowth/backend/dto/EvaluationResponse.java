package com.codegrowth.backend.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record EvaluationResponse(
    Double correctness_score,
    Double code_quality_score,
    Double complexity_score,
    Double testing_score,
    Double security_score,
    Double documentation_score,
    Double overall_score,
    List<RequirementResultDto> requirement_results,
    List<String> strengths,
    List<String> weaknesses,
    String feedback,
    List<String> improvement_suggestions
) {
    @JsonIgnoreProperties(ignoreUnknown = true)
    public record RequirementResultDto(
        String requirement,
        String status,
        Double score,
        List<String> evidence,
        String feedback
    ) {}
}
