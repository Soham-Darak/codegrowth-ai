package com.codegrowth.backend.service;

import com.codegrowth.backend.dto.EvaluationResponse;
import com.codegrowth.backend.dto.GenerateRequest;
import com.codegrowth.backend.dto.GenerateResponse;
import com.codegrowth.backend.entity.AppUser;
import com.codegrowth.backend.entity.Assignment;
import com.codegrowth.backend.entity.Submission;
import com.fasterxml.jackson.databind.JsonNode;
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
import java.util.HashMap;
import java.util.HexFormat;
import java.util.Map;

@Service
public class AiService {
    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;
    private final CacheService cacheService;
    private final AiGenerationHistoryService historyService;
    private final String generateUrl;

    public AiService(
            ObjectMapper objectMapper,
            CacheService cacheService,
            AiGenerationHistoryService historyService,
            @Value("${codegrowth.ai.base-url:http://localhost:8000}") String baseUrl) {
        this.httpClient = HttpClient.newBuilder()
                .version(HttpClient.Version.HTTP_1_1)
                .connectTimeout(Duration.ofSeconds(10))
                .build();
        this.objectMapper = objectMapper;
        this.cacheService = cacheService;
        this.historyService = historyService;
        this.generateUrl = baseUrl.replaceAll("/$", "") + "/generate";
    }

    public EvaluationResponse evaluateSubmission(Submission submission) {
        try {
            Assignment assignment = submission.getAssignment();

            Map<String, Object> assignmentCtx = new HashMap<>();
            assignmentCtx.put("title", assignment.getTitle());
            assignmentCtx.put("description", assignment.getDescription());
            assignmentCtx.put("requirements", assignment.getRequirements());

            Map<String, Object> context = new HashMap<>();
            context.put("assignment", assignmentCtx);

            String content = submission.getContent().trim();
            if (content.startsWith("http")) {
                context.put("repository_url", content);
            } else {
                context.put("code", content);
            }

            Map<String, Object> payload = new HashMap<>();
            payload.put("task", "evaluate assignment");
            payload.put("context", context);

            String requestBody = objectMapper.writeValueAsString(payload);
            String runUrl = generateUrl.replace("/generate", "/agents/run");

            HttpRequest httpRequest = HttpRequest.newBuilder()
                    .uri(URI.create(runUrl))
                    .version(HttpClient.Version.HTTP_1_1)
                    .timeout(Duration.ofSeconds(300))
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

            JsonNode rootNode = objectMapper.readTree(response.body());
            if (!rootNode.has("result")) {
                throw new IllegalStateException("AI engine response missing 'result' field");
            }

            return objectMapper.treeToValue(rootNode.get("result"), EvaluationResponse.class);

        } catch (IOException exception) {
            throw new IllegalStateException("Failed to communicate with AI engine", exception);
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("AI engine request was interrupted", exception);
        }
    }

    public GenerateResponse generate(AppUser user, GenerateRequest request) {
        String prompt = request.prompt().trim();
        String cacheKey = cacheKey(prompt);
        String cached = cacheService.get(cacheKey);

        if (cached != null) {
            GenerateResponse result = new GenerateResponse("cache", cached);
            historyService.save(user, prompt, result.response(), result.model());
            return result;
        }

        try {
            String requestBody = objectMapper.writeValueAsString(new GenerateRequest(prompt));
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
            historyService.save(user, prompt, result.response(), result.model());
            return result;
        } catch (IOException exception) {
            throw new IllegalStateException("Failed to communicate with AI engine", exception);
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("AI engine request was interrupted", exception);
        }
    }

    public String analyzeRepository(String repositoryUrl, String branch) {
        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("repository_url", repositoryUrl);
            if (branch != null && !branch.isBlank()) {
                payload.put("branch", branch);
            }
            payload.put("max_files", 50);

            String requestBody = objectMapper.writeValueAsString(payload);
            String runUrl = generateUrl.replace("/generate", "/repositories/analyze");

            HttpRequest httpRequest = HttpRequest.newBuilder()
                    .uri(URI.create(runUrl))
                    .version(HttpClient.Version.HTTP_1_1)
                    .timeout(Duration.ofSeconds(300))
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

            return response.body();
        } catch (IOException exception) {
            throw new IllegalStateException("Failed to communicate with AI engine", exception);
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("AI engine request was interrupted", exception);
        }
    }

    public String analyzeAuthenticity(String repositoryUrl) {
        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("repository_url", repositoryUrl);

            String requestBody = objectMapper.writeValueAsString(payload);
            String runUrl = generateUrl.replace("/generate", "/repositories/authenticity");

            HttpRequest httpRequest = HttpRequest.newBuilder()
                    .uri(URI.create(runUrl))
                    .version(HttpClient.Version.HTTP_1_1)
                    .timeout(Duration.ofSeconds(120))
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

            return response.body();
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
            byte[] hash = digest.digest(prompt.getBytes(StandardCharsets.UTF_8));
            return "codegrowth:ai:generate:" + HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 is not available", exception);
        }
    }
}
