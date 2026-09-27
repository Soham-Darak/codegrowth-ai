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
    @Transactional
    public void analyzeRepositoryAsync(Long repositoryId) {
        try {
            ConnectedRepository repo = repositoryRepo.findById(repositoryId).orElseThrow();
            
            String analysisJson = aiService.analyzeRepository(repo.getRepositoryUrl(), repo.getBranch());
            
            repo.setLatestAnalysisJson(analysisJson);
            repo.setLastAnalysisStatus("COMPLETED");
            repositoryRepo.save(repo);
        } catch (Exception e) {
            e.printStackTrace();
            repositoryRepo.findById(repositoryId).ifPresent(repo -> {
                repo.setLastAnalysisStatus("FAILED");
                repositoryRepo.save(repo);
            });
        }
    }
}
