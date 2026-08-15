package com.codegrowth.backend.dto;

import jakarta.validation.constraints.NotBlank;

public record GenerateRequest(
        @NotBlank(message = "Prompt must not be blank")
        String prompt
) {
}
