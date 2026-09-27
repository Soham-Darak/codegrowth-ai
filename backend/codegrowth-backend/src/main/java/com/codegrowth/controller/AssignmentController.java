package com.codegrowth.controller;

import com.codegrowth.entity.Assignment;
import com.codegrowth.entity.AssignmentStatus;
import com.codegrowth.service.AssignmentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/assignments")
public class AssignmentController {

    private final AssignmentService assignmentService;

    public AssignmentController(
            AssignmentService assignmentService) {

        this.assignmentService = assignmentService;
    }

    @PostMapping
    public ResponseEntity<Assignment> createAssignment(
            @RequestParam Long courseId,
            @RequestBody Assignment assignment) {

        try {
            Assignment createdAssignment =
                    assignmentService.createAssignment(
                            courseId,
                            assignment
                    );

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(createdAssignment);

        } catch (IllegalArgumentException exception) {

            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping
    public ResponseEntity<List<Assignment>>
    getAllAssignments() {

        return ResponseEntity.ok(
                assignmentService.getAllAssignments()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<Assignment> getAssignmentById(
            @PathVariable Long id) {

        return assignmentService
                .getAssignmentById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<Assignment>>
    getAssignmentsByCourse(
            @PathVariable Long courseId) {

        return ResponseEntity.ok(
                assignmentService
                        .getAssignmentsByCourse(courseId)
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<Assignment> updateAssignment(
            @PathVariable Long id,
            @RequestBody Assignment assignment) {

        try {
            Assignment updatedAssignment =
                    assignmentService.updateAssignment(
                            id,
                            assignment
                    );

            return ResponseEntity.ok(updatedAssignment);

        } catch (IllegalArgumentException exception) {

            return ResponseEntity.badRequest().build();
        }
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Assignment>
    updateAssignmentStatus(
            @PathVariable Long id,
            @RequestParam AssignmentStatus status) {

        try {
            Assignment updatedAssignment =
                    assignmentService.updateAssignmentStatus(
                            id,
                            status
                    );

            return ResponseEntity.ok(updatedAssignment);

        } catch (IllegalArgumentException exception) {

            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAssignment(
            @PathVariable Long id) {

        try {
            assignmentService.deleteAssignment(id);

            return ResponseEntity.noContent().build();

        } catch (IllegalArgumentException exception) {

            return ResponseEntity.notFound().build();
        }
    }
}