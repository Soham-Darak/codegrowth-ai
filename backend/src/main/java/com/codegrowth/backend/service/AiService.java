package com.codegrowth.backend.service;

import com.codegrowth.backend.dto.GenerateRequest;
import com.codegrowth.backend.dto.GenerateResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;

@Service
public class AiService {
    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;
    private final String generateUrl;

    public AiService(
            ObjectMapper objectMapper,
            @Value("${codegrowth.ai.base-url:http://localhost:8000}") String baseUrl) {
        this.httpClient = HttpClient.newHttpClient();
        this.objectMapper = objectMapper;
        this.generateUrl = baseUrl.replaceAll("/$", "") + "/generate";
    }

    public GenerateResponse generate(GenerateRequest request) {
        try {
            String requestBody = objectMapper.writeValueAsString(request);

            HttpRequest httpRequest = HttpRequest.newBuilder()
                    .uri(URI.create(generateUrl))
                    .header("Content-Type", "application/json")
                    .header("Accept", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody, StandardCharsets.UTF_8))
                    .build();

            HttpResponse<String> response = httpClient.send(
                    httpRequest,
                    HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));

            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                throw new IllegalStateException(
                        "AI engine returned HTTP " + response.statusCode() + ": " + response.body());
            }

            return objectMapper.readValue(response.body(), GenerateResponse.class);
        } catch (IOException exception) {
            throw new IllegalStateException("Failed to communicate with AI engine", exception);
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("AI engine request was interrupted", exception);
        }
    }
}
