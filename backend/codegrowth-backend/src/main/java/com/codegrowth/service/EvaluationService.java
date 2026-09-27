package com.codegrowth.service;

import com.codegrowth.entity.Evaluation;
import com.codegrowth.entity.EvaluationStatus;
import com.codegrowth.entity.Submission;
import com.codegrowth.repository.EvaluationRepository;
import com.codegrowth.repository.SubmissionRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class EvaluationService {

    private final EvaluationRepository evaluationRepository;
    private final SubmissionRepository submissionRepository;

    public EvaluationService(
            EvaluationRepository evaluationRepository,
            SubmissionRepository submissionRepository) {

        this.evaluationRepository = evaluationRepository;
        this.submissionRepository = submissionRepository;
    }

    public Evaluation createEvaluation(
            Long submissionId) {

        Submission submission =
                submissionRepository.findById(submissionId)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Submission not found with id: "
                                                + submissionId
                                )
                        );

        if (evaluationRepository.existsBySubmissionId(
                submissionId)) {

            throw new IllegalArgumentException(
                    "An evaluation already exists for this submission"
            );
        }

        Evaluation evaluation = new Evaluation();

        evaluation.setSubmission(submission);
        evaluation.setStatus(EvaluationStatus.PENDING);

        return evaluationRepository.save(evaluation);
    }

    public List<Evaluation> getAllEvaluations() {

        return evaluationRepository.findAll();
    }

    public Optional<Evaluation> getEvaluationById(
            Long id) {

        return evaluationRepository.findById(id);
    }

    public Optional<Evaluation> getEvaluationBySubmission(
            Long submissionId) {

        return evaluationRepository
                .findBySubmissionId(submissionId);
    }

    public List<Evaluation> getEvaluationsByStatus(
            EvaluationStatus status) {

        return evaluationRepository.findByStatus(status);
    }

    public Evaluation updateEvaluationStatus(
            Long id,
            EvaluationStatus status) {

        Evaluation evaluation =
                evaluationRepository.findById(id)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Evaluation not found with id: "
                                                + id
                                )
                        );

        evaluation.setStatus(status);

        if (status == EvaluationStatus.COMPLETED) {

            evaluation.setCompletedAt(
                    LocalDateTime.now()
            );
        } else {

            evaluation.setCompletedAt(null);
        }

        return evaluationRepository.save(evaluation);
    }

    public Evaluation completeEvaluation(
            Long id,
            Double correctnessScore,
            Double codeQualityScore,
            Double complexityScore,
            Double testingScore,
            Double securityScore,
            Double documentationScore,
            String aiFeedback,
            String strengths,
            String weaknesses,
            String improvementSuggestions) {

        validateScore(correctnessScore, "Correctness");
        validateScore(codeQualityScore, "Code quality");
        validateScore(complexityScore, "Complexity");
        validateScore(testingScore, "Testing");
        validateScore(securityScore, "Security");
        validateScore(documentationScore, "Documentation");

        Evaluation evaluation =
                evaluationRepository.findById(id)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Evaluation not found with id: "
                                                + id
                                )
                        );

        double overallScore =
                (
                        correctnessScore
                                + codeQualityScore
                                + complexityScore
                                + testingScore
                                + securityScore
                                + documentationScore
                ) / 6.0;

        evaluation.setCorrectnessScore(
                correctnessScore
        );

        evaluation.setCodeQualityScore(
                codeQualityScore
        );

        evaluation.setComplexityScore(
                complexityScore
        );

        evaluation.setTestingScore(
                testingScore
        );

        evaluation.setSecurityScore(
                securityScore
        );

        evaluation.setDocumentationScore(
                documentationScore
        );

        evaluation.setOverallScore(
                Math.round(overallScore * 100.0) / 100.0
        );

        evaluation.setAiFeedback(aiFeedback);

        evaluation.setStrengths(strengths);

        evaluation.setWeaknesses(weaknesses);

        evaluation.setImprovementSuggestions(
                improvementSuggestions
        );

        evaluation.setStatus(
                EvaluationStatus.COMPLETED
        );

        evaluation.setCompletedAt(
                LocalDateTime.now()
        );

        return evaluationRepository.save(evaluation);
    }

    private void validateScore(
            Double score,
            String scoreName) {

        if (score == null) {

            throw new IllegalArgumentException(
                    scoreName + " score cannot be null"
            );
        }

        if (score < 0 || score > 100) {

            throw new IllegalArgumentException(
                    scoreName
                            + " score must be between 0 and 100"
            );
        }
    }

    public void deleteEvaluation(Long id) {

        if (!evaluationRepository.existsById(id)) {

            throw new IllegalArgumentException(
                    "Evaluation not found with id: " + id
            );
        }

        evaluationRepository.deleteById(id);
    }
}