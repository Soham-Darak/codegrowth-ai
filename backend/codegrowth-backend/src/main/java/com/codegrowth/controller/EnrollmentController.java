package com.codegrowth.controller;

import com.codegrowth.entity.Enrollment;
import com.codegrowth.entity.EnrollmentStatus;
import com.codegrowth.service.EnrollmentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/enrollments")
public class EnrollmentController {

    private final EnrollmentService enrollmentService;

    public EnrollmentController(
            EnrollmentService enrollmentService) {

        this.enrollmentService = enrollmentService;
    }

    @PostMapping
    public ResponseEntity<Enrollment> createEnrollment(
            @RequestParam Long studentId,
            @RequestParam Long courseId) {

        try {
            Enrollment enrollment =
                    enrollmentService.createEnrollment(
                            studentId,
                            courseId
                    );

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(enrollment);

        } catch (IllegalArgumentException exception) {

            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping
    public ResponseEntity<List<Enrollment>> getAllEnrollments() {

        return ResponseEntity.ok(
                enrollmentService.getAllEnrollments()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<Enrollment> getEnrollmentById(
            @PathVariable Long id) {

        return enrollmentService.getEnrollmentById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<Enrollment>>
    getEnrollmentsByStudent(
            @PathVariable Long studentId) {

        return ResponseEntity.ok(
                enrollmentService
                        .getEnrollmentsByStudent(studentId)
        );
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<Enrollment>>
    getEnrollmentsByCourse(
            @PathVariable Long courseId) {

        return ResponseEntity.ok(
                enrollmentService
                        .getEnrollmentsByCourse(courseId)
        );
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Enrollment> updateStatus(
            @PathVariable Long id,
            @RequestParam EnrollmentStatus status) {

        try {
            Enrollment updatedEnrollment =
                    enrollmentService.updateEnrollmentStatus(
                            id,
                            status
                    );

            return ResponseEntity.ok(updatedEnrollment);

        } catch (IllegalArgumentException exception) {

            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEnrollment(
            @PathVariable Long id) {

        try {
            enrollmentService.deleteEnrollment(id);

            return ResponseEntity.noContent().build();

        } catch (IllegalArgumentException exception) {

            return ResponseEntity.notFound().build();
        }
    }
}