package com.codegrowth.backend.service;

import com.codegrowth.backend.entity.AiGeneration;
import com.codegrowth.backend.entity.AppUser;
import com.codegrowth.backend.repository.AiGenerationRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AiGenerationHistoryService {
    private final AiGenerationRepository repository;

    public AiGenerationHistoryService(AiGenerationRepository repository) {
        this.repository = repository;
    }

    public AiGeneration save(AppUser user, String prompt, String response, String model) {
        return repository.save(new AiGeneration(user, prompt, response, model));
    }

    public List<AiGeneration> findAll(AppUser user) {
        return repository.findAllByUserIdOrderByCreatedAtDesc(user.getId());
    }

    public AiGeneration findById(AppUser user, Long id) {
        return repository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new IllegalArgumentException("AI generation not found: " + id));
    }

    public void deleteById(AppUser user, Long id) {
        if (!repository.existsByIdAndUserId(id, user.getId())) {
            throw new IllegalArgumentException("AI generation not found: " + id);
        }
        repository.deleteByIdAndUserId(id, user.getId());
    }
}
