package com.codegrowth.backend.api;

import com.codegrowth.backend.entity.AppUser;
import com.codegrowth.backend.repository.AppUserRepository;
import com.codegrowth.backend.service.OAuthService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.Map;

@RestController
@RequestMapping("/api/github")
public class GitHubController {

    private final AppUserRepository userRepository;
    private final OAuthService oAuthService;
    private final HttpClient httpClient;

    public GitHubController(AppUserRepository userRepository, OAuthService oAuthService) {
        this.userRepository = userRepository;
        this.oAuthService = oAuthService;
        this.httpClient = HttpClient.newBuilder()
                .version(HttpClient.Version.HTTP_1_1)
                .connectTimeout(Duration.ofSeconds(10))
                .build();
    }

    /** Returns whether the current user has GitHub linked and the URL to link it. */
    @GetMapping("/status")
    public ResponseEntity<?> githubStatus(Authentication auth) {
        AppUser user = userRepository.findByEmailIgnoreCase(auth.getName()).orElse(null);
        if (user == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        boolean connected = user.getGithubAccessToken() != null && !user.getGithubAccessToken().isBlank();
        return ResponseEntity.ok(Map.of(
                "connected", connected,
                "linkUrl", oAuthService.getGitHubLinkUrl()
        ));
    }

    /** Callback from GitHub OAuth "link" flow — saves the token to the current user. */
    @PostMapping("/link")
    public ResponseEntity<?> linkGitHub(Authentication auth, @RequestBody Map<String, String> body) {
        String code = body.get("code");
        if (code == null || code.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Missing code"));
        }
        AppUser user = userRepository.findByEmailIgnoreCase(auth.getName()).orElse(null);
        if (user == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        oAuthService.linkGitHub(user.getId(), code);
        return ResponseEntity.ok(Map.of("connected", true));
    }

    /** Returns the authenticated user's GitHub repositories. */
    @GetMapping("/my-repos")
    public ResponseEntity<?> getMyRepos(Authentication auth) {
        AppUser user = userRepository.findByEmailIgnoreCase(auth.getName()).orElse(null);

        if (user == null || user.getGithubAccessToken() == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(
                    Map.of("error", "User not connected to GitHub", "connected", false));
        }

        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.github.com/user/repos?sort=updated&per_page=100"))
                    .header("Authorization", "Bearer " + user.getGithubAccessToken())
                    .header("Accept", "application/vnd.github.v3+json")
                    .GET()
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 200) {
                return ResponseEntity.ok()
                        .header(HttpHeaders.CONTENT_TYPE, "application/json")
                        .body(response.body());
            } else {
                return ResponseEntity.status(response.statusCode()).body(response.body());
            }

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error fetching repos: " + e.getMessage()));
        }
    }
}
