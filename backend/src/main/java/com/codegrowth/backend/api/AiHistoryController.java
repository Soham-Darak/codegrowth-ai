package com.codegrowth.backend.api;

import com.codegrowth.backend.entity.AiGeneration;
import com.codegrowth.backend.service.AiGenerationHistoryService;
import org.springframework.http.ResponseEntity;
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

    public AiHistoryController(AiGenerationHistoryService historyService) {
        this.historyService = historyService;
    }

    @GetMapping
    public ResponseEntity<List<AiGeneration>> getHistory() {
        return ResponseEntity.ok(historyService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AiGeneration> getHistoryItem(@PathVariable Long id) {
        return ResponseEntity.ok(historyService.findById(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteHistoryItem(@PathVariable Long id) {
        historyService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
