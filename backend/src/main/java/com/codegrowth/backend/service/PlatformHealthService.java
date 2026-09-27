package com.codegrowth.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import javax.sql.DataSource;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.sql.Connection;
import java.util.LinkedHashMap;
import java.util.Map;

@Service
public class PlatformHealthService {
    private final DataSource dataSource;
    private final StringRedisTemplate redis;
    private final String aiHealthUrl;
    private final HttpClient client = HttpClient.newBuilder().connectTimeout(java.time.Duration.ofSeconds(2)).build();

    public PlatformHealthService(DataSource dataSource, StringRedisTemplate redis,
                                 @Value("${codegrowth.ai.base-url:http://localhost:8000}") String aiBaseUrl) {
        this.dataSource = dataSource;
        this.redis = redis;
        this.aiHealthUrl = aiBaseUrl.replaceAll("/$", "") + "/health";
    }

    public Map<String, String> check() {
        Map<String, String> result = new LinkedHashMap<>();
        result.put("backend", "UP");
        result.put("database", databaseStatus());
        result.put("redis", redisStatus());
        result.put("aiEngine", aiStatus());
        return result;
    }

    private String databaseStatus() {
        try (Connection ignored = dataSource.getConnection()) { return "UP"; }
        catch (Exception e) { return "DOWN"; }
    }

    private String redisStatus() {
        try { return "PONG".equalsIgnoreCase(redis.getConnectionFactory().getConnection().ping()) ? "UP" : "DOWN"; }
        catch (Exception e) { return "DOWN"; }
    }

    private String aiStatus() {
        try {
            HttpRequest request = HttpRequest.newBuilder().uri(URI.create(aiHealthUrl)).timeout(java.time.Duration.ofSeconds(3)).GET().build();
            HttpResponse<Void> response = client.send(request, HttpResponse.BodyHandlers.discarding());
            return response.statusCode() >= 200 && response.statusCode() < 300 ? "UP" : "DOWN";
        } catch (Exception e) { return "DOWN"; }
    }
}
