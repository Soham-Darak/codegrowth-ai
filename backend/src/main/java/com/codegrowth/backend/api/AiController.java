package com.codegrowth.backend.api;

import com.codegrowth.backend.dto.GenerateRequest;
import com.codegrowth.backend.dto.GenerateResponse;
import com.codegrowth.backend.entity.AppUser;
import com.codegrowth.backend.repository.AppUserRepository;
import com.codegrowth.backend.service.AiService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ai")
public class AiController {
    private final AiService aiService;
    private final AppUserRepository userRepository;

    public AiController(AiService aiService, AppUserRepository userRepository) {
        this.aiService = aiService;
        this.userRepository = userRepository;
    }

    @PostMapping("/generate")
    public ResponseEntity<GenerateResponse> generate(
            Authentication authentication,
            @Valid @RequestBody GenerateRequest request) {
        AppUser user = userRepository.findByEmailIgnoreCase(authentication.getName())
                .orElseThrow(() -> new IllegalArgumentException("Authenticated user not found"));
        return ResponseEntity.ok(aiService.generate(user, request));
    }
}
