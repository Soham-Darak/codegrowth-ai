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
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Duration;

@Service
public class AiService {
    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;
    private final CacheService cacheService;
    private final String generateUrl;

    public AiService(
            ObjectMapper objectMapper,
            CacheService cacheService,
            @Value("${codegrowth.ai.base-url:http://localhost:8000}") String baseUrl) {
        this.httpClient = HttpClient.newBuilder()
                .version(HttpClient.Version.HTTP_1_1)
                .connectTimeout(Duration.ofSeconds(10))
                .build();
        this.objectMapper = objectMapper;
        this.cacheService = cacheService;
        this.generateUrl = baseUrl.replaceAll("/$", "") + "/generate";
    }

    public GenerateResponse generate(GenerateRequest request) {
        String cacheKey = cacheKey(request.prompt());
        String cached = cacheService.get(cacheKey);

        if (cached != null) {
            return new GenerateResponse("cache", cached);
        }

        try {
            String requestBody = objectMapper.writeValueAsString(request);

            HttpRequest httpRequest = HttpRequest.newBuilder()
                    .uri(URI.create(generateUrl))
                    .version(HttpClient.Version.HTTP_1_1)
                    .timeout(Duration.ofSeconds(130))
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

            GenerateResponse result = objectMapper.readValue(response.body(), GenerateResponse.class);
            cacheService.set(cacheKey, result.response());
            return result;
        } catch (IOException exception) {
            throw new IllegalStateException("Failed to communicate with AI engine", exception);
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("AI engine request was interrupted", exception);
        }
    }

    private String cacheKey(String prompt) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(prompt.trim().getBytes(StandardCharsets.UTF_8));
            StringBuilder hex = new StringBuilder();
            for (byte value : hash) {
                hex.append(String.format("%02x", value));
            }
            return "codegrowth:ai:generate:" + hex;
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 is not available", exception);
        }
    }
}
