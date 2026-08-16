package com.codegrowth.backend.api;

import com.codegrowth.backend.entity.AiGeneration;
import com.codegrowth.backend.entity.AppUser;
import com.codegrowth.backend.repository.AppUserRepository;
import com.codegrowth.backend.service.AiGenerationHistoryService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/ai/history")
public class AiHistoryController {
    private final AiGenerationHistoryService historyService;
    private final AppUserRepository userRepository;

    public AiHistoryController(
            AiGenerationHistoryService historyService,
            AppUserRepository userRepository) {
        this.historyService = historyService;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<List<AiGeneration>> getHistory(Authentication authentication) {
        return ResponseEntity.ok(historyService.findAll(currentUser(authentication)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AiGeneration> getHistoryItem(
            Authentication authentication,
            @PathVariable Long id) {
        return ResponseEntity.ok(historyService.findById(currentUser(authentication), id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteHistoryItem(
            Authentication authentication,
            @PathVariable Long id) {
        historyService.deleteById(currentUser(authentication), id);
        return ResponseEntity.noContent().build();
    }

    private AppUser currentUser(Authentication authentication) {
        return userRepository.findByEmailIgnoreCase(authentication.getName())
                .orElseThrow(() -> new IllegalArgumentException("Authenticated user not found"));
    }
}
