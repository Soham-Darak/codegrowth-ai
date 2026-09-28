package com.codegrowth.backend.service;

import com.codegrowth.backend.entity.ConnectedRepository;
import com.codegrowth.backend.repository.ConnectedRepositoryRepository;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class RepositoryAnalysisService {
    private final AiService aiService;
    private final ConnectedRepositoryRepository repositoryRepo;

    public RepositoryAnalysisService(AiService aiService, ConnectedRepositoryRepository repositoryRepo) {
        this.aiService = aiService;
        this.repositoryRepo = repositoryRepo;
    }

    @Async
    public void analyzeRepositoryAsync(Long repositoryId) {
        try {
            ConnectedRepository repo = repositoryRepo.findById(repositoryId).orElseThrow();
            
            // External call performed without holding open a database transaction
            String analysisJson = aiService.analyzeRepository(repo.getRepositoryUrl(), repo.getBranch());
            
            saveAnalysisResult(repositoryId, analysisJson, "COMPLETED");
        } catch (Exception e) {
            e.printStackTrace();
            saveAnalysisResult(repositoryId, null, "FAILED");
        }
    }

    @Transactional
    public void saveAnalysisResult(Long repositoryId, String analysisJson, String status) {
        repositoryRepo.findById(repositoryId).ifPresent(repo -> {
            if (analysisJson != null) {
                repo.setLatestAnalysisJson(analysisJson);
            }
            repo.setLastAnalysisStatus(status);
            repositoryRepo.save(repo);
        });
    }
}
