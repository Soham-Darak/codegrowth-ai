package com.codegrowth.backend.service;

import com.codegrowth.backend.dto.EvaluationResponse;
import com.codegrowth.backend.entity.AiEvaluation;
import com.codegrowth.backend.entity.RequirementResult;
import com.codegrowth.backend.entity.Submission;
import com.codegrowth.backend.repository.AiEvaluationRepository;
import com.codegrowth.backend.repository.SubmissionRepository;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class AiEvaluationService {

    private final AiService aiService;
    private final AiEvaluationRepository evaluationRepository;
    private final SubmissionRepository submissionRepository;

    public AiEvaluationService(AiService aiService, AiEvaluationRepository evaluationRepository, SubmissionRepository submissionRepository) {
        this.aiService = aiService;
        this.evaluationRepository = evaluationRepository;
        this.submissionRepository = submissionRepository;
    }

    @Async
    public void evaluateSubmissionAsync(Long submissionId) {
        evaluateSubmissionAsync(submissionId, false);
    }

    @Async
    public void evaluateSubmissionAsync(Long submissionId, boolean force) {
        try {
            Submission submission = submissionRepository.findById(submissionId).orElseThrow();
            evaluateSubmission(submission, force);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
    
    public Optional<AiEvaluation> getEvaluation(Submission submission) {
        return evaluationRepository.findBySubmission(submission);
    }

    public AiEvaluation evaluateSubmission(Submission submission) {
        return evaluateSubmission(submission, false);
    }

    public AiEvaluation evaluateSubmission(Submission submission, boolean force) {
        // Prevent duplicate evaluations unless force is requested
        Optional<AiEvaluation> existing = evaluationRepository.findBySubmission(submission);
        if (existing.isPresent() && !force) {
            return existing.get();
        }

        // Perform external AI engine call OUTSIDE the database transaction
        // to prevent holding a database connection and exhausting HikariCP
        EvaluationResponse response = aiService.evaluateSubmission(submission);

        return persistEvaluation(submission.getId(), response);
    }

    @Transactional
    public AiEvaluation persistEvaluation(Long submissionId, EvaluationResponse response) {
        Submission submission = submissionRepository.findById(submissionId).orElseThrow();

        // If an existing evaluation exists, remove it first
        evaluationRepository.findBySubmission(submission).ifPresent(old -> {
            evaluationRepository.delete(old);
            evaluationRepository.flush();
        });

        AiEvaluation evaluation = new AiEvaluation(
                submission,
                response.correctness_score(),
                response.code_quality_score(),
                response.complexity_score(),
                response.testing_score(),
                response.security_score(),
                response.documentation_score(),
                response.overall_score(),
                response.feedback(),
                response.strengths(),
                response.weaknesses(),
                response.improvement_suggestions()
        );

        if (response.requirement_results() != null) {
            for (EvaluationResponse.RequirementResultDto reqResultDto : response.requirement_results()) {
                RequirementResult reqResult = new RequirementResult(
                        reqResultDto.requirement(),
                        reqResultDto.status(),
                        reqResultDto.score(),
                        reqResultDto.feedback(),
                        reqResultDto.evidence()
                );
                evaluation.addRequirementResult(reqResult);
            }
        }

        // Also update the submission score directly
        submission.grade(response.overall_score(), response.feedback());
        submissionRepository.save(submission);

        return evaluationRepository.save(evaluation);
    }
}
