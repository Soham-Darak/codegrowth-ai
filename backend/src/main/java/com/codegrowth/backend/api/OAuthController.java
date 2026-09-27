package com.codegrowth.backend.api;

import com.codegrowth.backend.dto.AuthResponse;
import com.codegrowth.backend.service.OAuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth/oauth")
public class OAuthController {

    private final OAuthService oAuthService;

    public OAuthController(OAuthService oAuthService) {
        this.oAuthService = oAuthService;
    }

    @GetMapping("/google/url")
    public ResponseEntity<Map<String, String>> googleAuthUrl() {
        return ResponseEntity.ok(Map.of("url", oAuthService.getGoogleAuthUrl()));
    }

    @PostMapping("/google/callback")
    public ResponseEntity<AuthResponse> googleCallback(@RequestBody Map<String, String> body) {
        String code = body.get("code");
        if (code == null || code.isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        AuthResponse response = oAuthService.handleGoogleCallback(code);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/github/url")
    public ResponseEntity<Map<String, String>> githubAuthUrl() {
        return ResponseEntity.ok(Map.of("url", oAuthService.getGitHubAuthUrl()));
    }

    @PostMapping("/github/callback")
    public ResponseEntity<AuthResponse> githubCallback(@RequestBody Map<String, String> body) {
        String code = body.get("code");
        if (code == null || code.isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        AuthResponse response = oAuthService.handleGitHubCallback(code);
        return ResponseEntity.ok(response);
    }
}
