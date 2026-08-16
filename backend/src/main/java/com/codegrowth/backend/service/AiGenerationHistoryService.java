package com.codegrowth.backend.service;

import com.codegrowth.backend.entity.AiGeneration;
import com.codegrowth.backend.repository.AiGenerationRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AiGenerationHistoryService {
    private final AiGenerationRepository repository;

    public AiGenerationHistoryService(AiGenerationRepository repository) {
        this.repository = repository;
    }

    public AiGeneration save(String prompt, String response, String model) {
        return repository.save(new AiGeneration(prompt, response, model));
    }

    public List<AiGeneration> findAll() {
        return repository.findAllByOrderByCreatedAtDesc();
    }

    public AiGeneration findById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("AI generation not found: " + id));
    }

    public void deleteById(Long id) {
        if (!repository.existsById(id)) {
            throw new IllegalArgumentException("AI generation not found: " + id);
        }
        repository.deleteById(id);
    }
}
