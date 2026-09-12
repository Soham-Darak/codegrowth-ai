package com.codegrowth.controller;

import com.codegrowth.entity.Evaluation;
import com.codegrowth.entity.EvaluationStatus;
import com.codegrowth.service.EvaluationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/evaluations")
public class EvaluationController {

    private final EvaluationService evaluationService;

    public EvaluationController(
            EvaluationService evaluationService) {

        this.evaluationService = evaluationService;
    }

    @PostMapping
    public ResponseEntity<Evaluation>
    createEvaluation(
            @RequestParam Long submissionId) {

        try {

            Evaluation evaluation =
                    evaluationService.createEvaluation(
                            submissionId
                    );

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(evaluation);

        } catch (IllegalArgumentException exception) {

            return ResponseEntity
                    .badRequest()
                    .build();
        }
    }

    @GetMapping
    public ResponseEntity<List<Evaluation>>
    getAllEvaluations() {

        return ResponseEntity.ok(
                evaluationService.getAllEvaluations()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<Evaluation>
    getEvaluationById(
            @PathVariable Long id) {

        return evaluationService
                .getEvaluationById(id)
                .map(ResponseEntity::ok)
                .orElse(
                        ResponseEntity
                                .notFound()
                                .build()
                );
    }

    @GetMapping("/submission/{submissionId}")
    public ResponseEntity<Evaluation>
    getEvaluationBySubmission(
            @PathVariable Long submissionId) {

        return evaluationService
                .getEvaluationBySubmission(
                        submissionId
                )
                .map(ResponseEntity::ok)
                .orElse(
                        ResponseEntity
                                .notFound()
                                .build()
                );
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<Evaluation>>
    getEvaluationsByStatus(
            @PathVariable EvaluationStatus status) {

        return ResponseEntity.ok(
                evaluationService
                        .getEvaluationsByStatus(status)
        );
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Evaluation>
    updateEvaluationStatus(
            @PathVariable Long id,
            @RequestParam EvaluationStatus status) {

        try {

            Evaluation evaluation =
                    evaluationService
                            .updateEvaluationStatus(
                                    id,
                                    status
                            );

            return ResponseEntity.ok(evaluation);

        } catch (IllegalArgumentException exception) {

            return ResponseEntity
                    .notFound()
                    .build();
        }
    }

    @PatchMapping("/{id}/complete")
    public ResponseEntity<Evaluation>
    completeEvaluation(
            @PathVariable Long id,
            @RequestParam Double correctnessScore,
            @RequestParam Double codeQualityScore,
            @RequestParam Double complexityScore,
            @RequestParam Double testingScore,
            @RequestParam Double securityScore,
            @RequestParam Double documentationScore,
            @RequestParam(required = false)
            String aiFeedback,
            @RequestParam(required = false)
            String strengths,
            @RequestParam(required = false)
            String weaknesses,
            @RequestParam(required = false)
            String improvementSuggestions) {

        try {

            Evaluation evaluation =
                    evaluationService.completeEvaluation(
                            id,
                            correctnessScore,
                            codeQualityScore,
                            complexityScore,
                            testingScore,
                            securityScore,
                            documentationScore,
                            aiFeedback,
                            strengths,
                            weaknesses,
                            improvementSuggestions
                    );

            return ResponseEntity.ok(evaluation);

        } catch (IllegalArgumentException exception) {

            return ResponseEntity
                    .badRequest()
                    .build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void>
    deleteEvaluation(
            @PathVariable Long id) {

        try {

            evaluationService.deleteEvaluation(id);

            return ResponseEntity
                    .noContent()
                    .build();

        } catch (IllegalArgumentException exception) {

            return ResponseEntity
                    .notFound()
                    .build();
        }
    }
}