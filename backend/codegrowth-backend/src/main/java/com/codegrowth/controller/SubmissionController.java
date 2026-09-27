package com.codegrowth.controller;

import com.codegrowth.entity.Submission;
import com.codegrowth.entity.SubmissionStatus;
import com.codegrowth.service.SubmissionService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/submissions")
public class SubmissionController {

    private final SubmissionService submissionService;

    public SubmissionController(
            SubmissionService submissionService) {

        this.submissionService = submissionService;
    }


    // ==============================
    // Create Submission
    // ==============================

    @PostMapping
    public ResponseEntity<Submission> createSubmission(
            @RequestParam Long studentId,
            @RequestParam Long assignmentId,
            @RequestBody Submission submission) {

        try {

            Submission createdSubmission =
                    submissionService.createSubmission(
                            studentId,
                            assignmentId,
                            submission
                    );

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(createdSubmission);

        } catch (IllegalArgumentException exception) {

            return ResponseEntity
                    .badRequest()
                    .build();
        }
    }


    // ==============================
    // Get All Submissions
    // ==============================

    @GetMapping
    public ResponseEntity<List<Submission>>
    getAllSubmissions() {

        return ResponseEntity.ok(
                submissionService.getAllSubmissions()
        );
    }


    // ==============================
    // Get Submission By ID
    // ==============================

    @GetMapping("/{id}")
    public ResponseEntity<Submission>
    getSubmissionById(
            @PathVariable Long id) {

        return submissionService
                .getSubmissionById(id)
                .map(ResponseEntity::ok)
                .orElse(
                        ResponseEntity
                                .notFound()
                                .build()
                );
    }


    // ==============================
    // Get Student Submissions
    // ==============================

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<Submission>>
    getSubmissionsByStudent(
            @PathVariable Long studentId) {

        return ResponseEntity.ok(
                submissionService
                        .getSubmissionsByStudent(studentId)
        );
    }


    // ==============================
    // Get Assignment Submissions
    // ==============================

    @GetMapping("/assignment/{assignmentId}")
    public ResponseEntity<List<Submission>>
    getSubmissionsByAssignment(
            @PathVariable Long assignmentId) {

        return ResponseEntity.ok(
                submissionService
                        .getSubmissionsByAssignment(
                                assignmentId
                        )
        );
    }


    // ==============================
    // Update Status
    // ==============================

    @PatchMapping("/{id}/status")
    public ResponseEntity<Submission>
    updateSubmissionStatus(
            @PathVariable Long id,
            @RequestParam SubmissionStatus status) {

        try {

            Submission updatedSubmission =
                    submissionService
                            .updateSubmissionStatus(
                                    id,
                                    status
                            );

            return ResponseEntity.ok(
                    updatedSubmission
            );

        } catch (IllegalArgumentException exception) {

            return ResponseEntity
                    .notFound()
                    .build();
        }
    }


    // ==============================
    // Evaluate Submission
    // ==============================

    @PatchMapping("/{id}/evaluate")
    public ResponseEntity<Submission>
    evaluateSubmission(
            @PathVariable Long id,
            @RequestParam Double score,
            @RequestParam(required = false)
            String aiFeedback) {

        try {

            Submission evaluatedSubmission =
                    submissionService.evaluateSubmission(
                            id,
                            score,
                            aiFeedback
                    );

            return ResponseEntity.ok(
                    evaluatedSubmission
            );

        } catch (IllegalArgumentException exception) {

            return ResponseEntity
                    .badRequest()
                    .build();
        }
    }


    // ==============================
    // Delete Submission
    // ==============================

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSubmission(
            @PathVariable Long id) {

        try {

            submissionService.deleteSubmission(id);

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