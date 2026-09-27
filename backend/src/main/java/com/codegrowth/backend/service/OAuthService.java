package com.codegrowth.backend.service;

import com.codegrowth.backend.dto.AuthResponse;
import com.codegrowth.backend.entity.AppUser;
import com.codegrowth.backend.entity.Role;
import com.codegrowth.backend.entity.StudentProfile;
import com.codegrowth.backend.repository.AppUserRepository;
import com.codegrowth.backend.repository.StudentProfileRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;

@Service
public class OAuthService {

    private final AppUserRepository userRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final JwtService jwtService;
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;

    @Value("${codegrowth.oauth.google.client-id:}")
    private String googleClientId;

    @Value("${codegrowth.oauth.google.client-secret:}")
    private String googleClientSecret;

    @Value("${codegrowth.oauth.google.redirect-uri:}")
    private String googleRedirectUri;

    @Value("${codegrowth.oauth.github.client-id:}")
    private String githubClientId;

    @Value("${codegrowth.oauth.github.client-secret:}")
    private String githubClientSecret;

    @Value("${codegrowth.oauth.github.redirect-uri:}")
    private String githubRedirectUri;

    public OAuthService(AppUserRepository userRepository,
                        StudentProfileRepository studentProfileRepository,
                        JwtService jwtService,
                        ObjectMapper objectMapper) {
        this.userRepository = userRepository;
        this.studentProfileRepository = studentProfileRepository;
        this.jwtService = jwtService;
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newBuilder()
                .version(HttpClient.Version.HTTP_1_1)
                .connectTimeout(Duration.ofSeconds(10))
                .build();
    }

    // ============================================================
    // Google OAuth
    // ============================================================

    public String getGoogleAuthUrl() {
        return "https://accounts.google.com/o/oauth2/v2/auth"
                + "?client_id=" + encode(googleClientId)
                + "&redirect_uri=" + encode(googleRedirectUri)
                + "&response_type=code"
                + "&scope=" + encode("openid email profile")
                + "&access_type=offline"
                + "&prompt=consent";
    }

    public AuthResponse handleGoogleCallback(String code) {
        try {
            // Exchange code for tokens
            String tokenBody = "code=" + encode(code)
                    + "&client_id=" + encode(googleClientId)
                    + "&client_secret=" + encode(googleClientSecret)
                    + "&redirect_uri=" + encode(googleRedirectUri)
                    + "&grant_type=authorization_code";

            HttpRequest tokenRequest = HttpRequest.newBuilder()
                    .uri(URI.create("https://oauth2.googleapis.com/token"))
                    .header("Content-Type", "application/x-www-form-urlencoded")
                    .POST(HttpRequest.BodyPublishers.ofString(tokenBody))
                    .build();

            HttpResponse<String> tokenResponse = httpClient.send(tokenRequest,
                    HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));

            if (tokenResponse.statusCode() != 200) {
                throw new IllegalStateException("Google token exchange failed: " + tokenResponse.body());
            }

            JsonNode tokenData = objectMapper.readTree(tokenResponse.body());
            String accessToken = tokenData.get("access_token").asText();

            // Fetch user info
            HttpRequest userInfoRequest = HttpRequest.newBuilder()
                    .uri(URI.create("https://www.googleapis.com/oauth2/v2/userinfo"))
                    .header("Authorization", "Bearer " + accessToken)
                    .GET()
                    .build();

            HttpResponse<String> userInfoResponse = httpClient.send(userInfoRequest,
                    HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));

            if (userInfoResponse.statusCode() != 200) {
                throw new IllegalStateException("Google user info request failed");
            }

            JsonNode userInfo = objectMapper.readTree(userInfoResponse.body());
            String googleId = userInfo.get("id").asText();
            String email = userInfo.get("email").asText();
            String name = userInfo.has("name") ? userInfo.get("name").asText() : email;
            String avatar = userInfo.has("picture") ? userInfo.get("picture").asText() : null;

            AppUser user = findOrCreateOAuthUser("GOOGLE", googleId, email, name, avatar);
            return toResponse(user);

        } catch (IOException | InterruptedException e) {
            if (e instanceof InterruptedException) Thread.currentThread().interrupt();
            throw new IllegalStateException("Google OAuth failed", e);
        }
    }

    // ============================================================
    // GitHub OAuth
    // ============================================================

    public String getGitHubAuthUrl() {
        return "https://github.com/login/oauth/authorize"
                + "?client_id=" + encode(githubClientId)
                + "&redirect_uri=" + encode(githubRedirectUri)
                + "&scope=" + encode("read:user user:email");
    }

    public AuthResponse handleGitHubCallback(String code) {
        try {
            // Exchange code for token
            String tokenBody = objectMapper.writeValueAsString(
                    java.util.Map.of(
                            "client_id", githubClientId,
                            "client_secret", githubClientSecret,
                            "code", code,
                            "redirect_uri", githubRedirectUri
                    )
            );

            HttpRequest tokenRequest = HttpRequest.newBuilder()
                    .uri(URI.create("https://github.com/login/oauth/access_token"))
                    .header("Content-Type", "application/json")
                    .header("Accept", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(tokenBody))
                    .build();

            HttpResponse<String> tokenResponse = httpClient.send(tokenRequest,
                    HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));

            JsonNode tokenData = objectMapper.readTree(tokenResponse.body());
            if (tokenData.has("error")) {
                throw new IllegalStateException("GitHub token exchange failed: " + tokenData.get("error_description").asText());
            }
            String accessToken = tokenData.get("access_token").asText();

            // Fetch user info
            HttpRequest userRequest = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.github.com/user"))
                    .header("Authorization", "Bearer " + accessToken)
                    .header("Accept", "application/json")
                    .GET()
                    .build();

            HttpResponse<String> userResponse = httpClient.send(userRequest,
                    HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));

            JsonNode userInfo = objectMapper.readTree(userResponse.body());
            String githubId = String.valueOf(userInfo.get("id").asLong());
            String name = userInfo.has("name") && !userInfo.get("name").isNull()
                    ? userInfo.get("name").asText()
                    : userInfo.get("login").asText();
            String avatar = userInfo.has("avatar_url") ? userInfo.get("avatar_url").asText() : null;

            // Fetch email (may be private)
            String email = userInfo.has("email") && !userInfo.get("email").isNull()
                    ? userInfo.get("email").asText()
                    : fetchGitHubEmail(accessToken);

            if (email == null || email.isBlank()) {
                throw new IllegalStateException("GitHub account has no public email. Please make your email visible in GitHub settings.");
            }

            AppUser user = findOrCreateOAuthUser("GITHUB", githubId, email, name, avatar);
            return toResponse(user);

        } catch (IOException | InterruptedException e) {
            if (e instanceof InterruptedException) Thread.currentThread().interrupt();
            throw new IllegalStateException("GitHub OAuth failed", e);
        }
    }

    private String fetchGitHubEmail(String accessToken) throws IOException, InterruptedException {
        HttpRequest emailRequest = HttpRequest.newBuilder()
                .uri(URI.create("https://api.github.com/user/emails"))
                .header("Authorization", "Bearer " + accessToken)
                .header("Accept", "application/json")
                .GET()
                .build();

        HttpResponse<String> emailResponse = httpClient.send(emailRequest,
                HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));

        JsonNode emails = objectMapper.readTree(emailResponse.body());
        if (emails.isArray()) {
            for (JsonNode emailNode : emails) {
                if (emailNode.has("primary") && emailNode.get("primary").asBoolean()) {
                    return emailNode.get("email").asText();
                }
            }
            if (!emails.isEmpty()) {
                return emails.get(0).get("email").asText();
            }
        }
        return null;
    }

    // ============================================================
    // Shared
    // ============================================================

    private AppUser findOrCreateOAuthUser(String provider, String providerId, String email, String name, String avatarUrl) {
        // Try to find by provider + ID first
        return userRepository.findByProviderAndProviderId(provider, providerId)
                .map(existing -> {
                    // Update profile info if changed
                    if (name != null && !name.equals(existing.getName())) existing.setName(name);
                    if (avatarUrl != null && !avatarUrl.equals(existing.getAvatarUrl())) existing.setAvatarUrl(avatarUrl);
                    return userRepository.save(existing);
                })
                .orElseGet(() -> {
                    // Check if email already exists (different provider)
                    if (userRepository.existsByEmailIgnoreCase(email)) {
                        throw new IllegalArgumentException(
                                "An account with this email already exists. Please log in with your original method.");
                    }
                    AppUser newUser = new AppUser(name, email, provider, providerId, avatarUrl);
                    newUser = userRepository.save(newUser);
                    studentProfileRepository.save(new StudentProfile(newUser));
                    return newUser;
                });
    }

    private AuthResponse toResponse(AppUser user) {
        return new AuthResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole().name(),
                jwtService.generateToken(user.getId(), user.getEmail(), user.getRole())
        );
    }

    private static String encode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }
}
