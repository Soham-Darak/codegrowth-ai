package com.codegrowth.backend.repository;

import com.codegrowth.backend.entity.AiGeneration;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AiGenerationRepository extends JpaRepository<AiGeneration, Long> {
    List<AiGeneration> findAllByOrderByCreatedAtDesc();
}
