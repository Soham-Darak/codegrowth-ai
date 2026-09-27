package com.codegrowth.backend.repository;

import com.codegrowth.backend.entity.AiGeneration;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AiGenerationRepository extends JpaRepository<AiGeneration, Long> {
    List<AiGeneration> findAllByUserIdOrderByCreatedAtDesc(Long userId);
    Optional<AiGeneration> findByIdAndUserId(Long id, Long userId);
    boolean existsByIdAndUserId(Long id, Long userId);
    void deleteByIdAndUserId(Long id, Long userId);
}
