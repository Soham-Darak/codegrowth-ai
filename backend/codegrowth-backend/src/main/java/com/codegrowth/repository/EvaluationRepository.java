package com.codegrowth.repository;

import com.codegrowth.entity.Evaluation;
import com.codegrowth.entity.EvaluationStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EvaluationRepository
        extends JpaRepository<Evaluation, Long> {

    Optional<Evaluation> findBySubmissionId(
            Long submissionId
    );

    boolean existsBySubmissionId(
            Long submissionId
    );

    List<Evaluation> findByStatus(
            EvaluationStatus status
    );
}