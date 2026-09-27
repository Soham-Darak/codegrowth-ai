package com.codegrowth.controller;

import com.codegrowth.entity.CompetencyAssessment;
import com.codegrowth.entity.CompetencyAssessmentStatus;
import com.codegrowth.entity.CompetencyLevel;
import com.codegrowth.service.CompetencyAssessmentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/competency-assessments")
public class CompetencyAssessmentController {

    private final CompetencyAssessmentService
            assessmentService;

    public CompetencyAssessmentController(
            CompetencyAssessmentService assessmentService) {

        this.assessmentService =
                assessmentService;
    }

    @PostMapping
    public ResponseEntity<CompetencyAssessment>
    createAssessment(
            @RequestParam Long evaluationId,
            @RequestParam Long competencyId) {

        try {

            CompetencyAssessment assessment =
                    assessmentService.createAssessment(
                            evaluationId,
                            competencyId
                    );

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(assessment);

        } catch (IllegalArgumentException exception) {

            return ResponseEntity
                    .badRequest()
                    .build();
        }
    }

    @GetMapping
    public ResponseEntity<List<CompetencyAssessment>>
    getAllAssessments() {

        return ResponseEntity.ok(
                assessmentService.getAllAssessments()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<CompetencyAssessment>
    getAssessmentById(
            @PathVariable Long id) {

        return assessmentService
                .getAssessmentById(id)
                .map(ResponseEntity::ok)
                .orElse(
                        ResponseEntity
                                .notFound()
                                .build()
                );
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<CompetencyAssessment>>
    getAssessmentsByStudent(
            @PathVariable Long studentId) {

        return ResponseEntity.ok(
                assessmentService
                        .getAssessmentsByStudent(
                                studentId
                        )
        );
    }

    @GetMapping("/competency/{competencyId}")
    public ResponseEntity<List<CompetencyAssessment>>
    getAssessmentsByCompetency(
            @PathVariable Long competencyId) {

        return ResponseEntity.ok(
                assessmentService
                        .getAssessmentsByCompetency(
                                competencyId
                        )
        );
    }

    @GetMapping("/evaluation/{evaluationId}")
    public ResponseEntity<List<CompetencyAssessment>>
    getAssessmentsByEvaluation(
            @PathVariable Long evaluationId) {

        return ResponseEntity.ok(
                assessmentService
                        .getAssessmentsByEvaluation(
                                evaluationId
                        )
        );
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<CompetencyAssessment>>
    getAssessmentsByStatus(
            @PathVariable
            CompetencyAssessmentStatus status) {

        return ResponseEntity.ok(
                assessmentService
                        .getAssessmentsByStatus(status)
        );
    }

    @PatchMapping("/{id}/assess")
    public ResponseEntity<CompetencyAssessment>
    assessCompetency(
            @PathVariable Long id,
            @RequestParam Double score,
            @RequestParam CompetencyLevel level,
            @RequestParam(required = false)
            String evidence,
            @RequestParam(required = false)
            String improvementSuggestion) {

        try {

            CompetencyAssessment assessment =
                    assessmentService.assessCompetency(
                            id,
                            score,
                            level,
                            evidence,
                            improvementSuggestion
                    );

            return ResponseEntity.ok(assessment);

        } catch (IllegalArgumentException exception) {

            return ResponseEntity
                    .badRequest()
                    .build();
        }
    }

    @PatchMapping("/{id}/verify")
    public ResponseEntity<CompetencyAssessment>
    verifyAssessment(
            @PathVariable Long id) {

        try {

            CompetencyAssessment assessment =
                    assessmentService.verifyAssessment(id);

            return ResponseEntity.ok(assessment);

        } catch (IllegalArgumentException exception) {

            return ResponseEntity
                    .badRequest()
                    .build();
        }
    }

    @PatchMapping("/{id}/reject")
    public ResponseEntity<CompetencyAssessment>
    rejectAssessment(
            @PathVariable Long id) {

        try {

            CompetencyAssessment assessment =
                    assessmentService.rejectAssessment(id);

            return ResponseEntity.ok(assessment);

        } catch (IllegalArgumentException exception) {

            return ResponseEntity
                    .notFound()
                    .build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void>
    deleteAssessment(
            @PathVariable Long id) {

        try {

            assessmentService.deleteAssessment(id);

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