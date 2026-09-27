package com.codegrowth.backend.repository;

import com.codegrowth.backend.entity.AiEvaluation;
import com.codegrowth.backend.entity.Submission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AiEvaluationRepository extends JpaRepository<AiEvaluation, Long> {
    Optional<AiEvaluation> findBySubmission(Submission submission);
    Optional<AiEvaluation> findBySubmissionId(Long submissionId);
}
