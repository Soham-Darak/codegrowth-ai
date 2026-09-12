package com.codegrowth.repository;

import com.codegrowth.entity.Competency;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CompetencyRepository
        extends JpaRepository<Competency, Long> {

    Optional<Competency> findByName(String name);

    boolean existsByName(String name);

    List<Competency> findByActiveTrue();

    List<Competency> findByLevel(
            com.codegrowth.entity.CompetencyLevel level
    );
}