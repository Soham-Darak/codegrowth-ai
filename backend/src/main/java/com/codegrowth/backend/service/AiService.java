package com.codegrowth.backend.service;

import com.codegrowth.backend.dto.GenerateRequest;
import com.codegrowth.backend.dto.GenerateResponse;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
public class AiService {
    private final RestClient restClient;
    private final ObjectMapper objectMapper;

    public AiService(
            RestClient.Builder restClientBuilder,
            ObjectMapper objectMapper,
            @Value("${codegrowth.ai.base-url:http://localhost:8000}") String baseUrl) {
        this.restClient = restClientBuilder.baseUrl(baseUrl).build();
        this.objectMapper = objectMapper;
    }

    public GenerateResponse generate(GenerateRequest request) {
        try {
            byte[] requestBody = objectMapper.writeValueAsBytes(request);

            return restClient.post()
                    .uri("/generate")
                    .contentType(MediaType.APPLICATION_JSON)
                    .contentLength(requestBody.length)
                    .body(requestBody)
                    .retrieve()
                    .body(GenerateResponse.class);
        } catch (JsonProcessingException exception) {
            throw new IllegalStateException("Failed to serialize AI generation request", exception);
        }
    }
}
