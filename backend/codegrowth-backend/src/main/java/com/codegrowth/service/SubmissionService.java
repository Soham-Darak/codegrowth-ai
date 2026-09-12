package com.codegrowth.service;

import com.codegrowth.entity.Assignment;
import com.codegrowth.entity.Submission;
import com.codegrowth.entity.SubmissionStatus;
import com.codegrowth.entity.User;
import com.codegrowth.entity.UserRole;
import com.codegrowth.repository.AssignmentRepository;
import com.codegrowth.repository.SubmissionRepository;
import com.codegrowth.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class SubmissionService {

    private final SubmissionRepository submissionRepository;
    private final UserRepository userRepository;
    private final AssignmentRepository assignmentRepository;

    public SubmissionService(
            SubmissionRepository submissionRepository,
            UserRepository userRepository,
            AssignmentRepository assignmentRepository) {

        this.submissionRepository = submissionRepository;
        this.userRepository = userRepository;
        this.assignmentRepository = assignmentRepository;
    }


    // ==============================
    // Create Submission
    // ==============================

    public Submission createSubmission(
            Long studentId,
            Long assignmentId,
            Submission submission) {

        User student = userRepository.findById(studentId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Student not found with id: " + studentId
                        )
                );

        if (student.getRole() != UserRole.STUDENT) {
            throw new IllegalArgumentException(
                    "Only users with STUDENT role can submit assignments"
            );
        }

        Assignment assignment =
                assignmentRepository.findById(assignmentId)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Assignment not found with id: "
                                                + assignmentId
                                )
                        );

        if (submissionRepository
                .existsByStudentIdAndAssignmentId(
                        studentId,
                        assignmentId)) {

            throw new IllegalArgumentException(
                    "Student has already submitted this assignment"
            );
        }

        submission.setStudent(student);
        submission.setAssignment(assignment);

        LocalDateTime submissionTime = LocalDateTime.now();

        submission.setStatus(
                submissionTime.isAfter(assignment.getDeadline())
                        ? SubmissionStatus.LATE
                        : SubmissionStatus.SUBMITTED
        );

        return submissionRepository.save(submission);
    }


    // ==============================
    // Get All Submissions
    // ==============================

    public List<Submission> getAllSubmissions() {

        return submissionRepository.findAll();
    }


    // ==============================
    // Get Submission By ID
    // ==============================

    public Optional<Submission> getSubmissionById(Long id) {

        return submissionRepository.findById(id);
    }


    // ==============================
    // Get Student Submissions
    // ==============================

    public List<Submission> getSubmissionsByStudent(
            Long studentId) {

        return submissionRepository.findByStudentId(studentId);
    }


    // ==============================
    // Get Assignment Submissions
    // ==============================

    public List<Submission> getSubmissionsByAssignment(
            Long assignmentId) {

        return submissionRepository.findByAssignmentId(
                assignmentId
        );
    }


    // ==============================
    // Update Submission Status
    // ==============================

    public Submission updateSubmissionStatus(
            Long id,
            SubmissionStatus status) {

        Submission submission =
                submissionRepository.findById(id)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Submission not found with id: "
                                                + id
                                )
                        );

        submission.setStatus(status);

        if (status == SubmissionStatus.EVALUATED) {

            submission.setEvaluatedAt(
                    LocalDateTime.now()
            );

        } else {

            submission.setEvaluatedAt(null);
        }

        return submissionRepository.save(submission);
    }


    // ==============================
    // Evaluate Submission
    // ==============================

    public Submission evaluateSubmission(
            Long id,
            Double score,
            String aiFeedback) {

        if (score == null) {
            throw new IllegalArgumentException(
                    "Score cannot be null"
            );
        }

        if (score < 0 || score > 100) {
            throw new IllegalArgumentException(
                    "Score must be between 0 and 100"
            );
        }

        Submission submission =
                submissionRepository.findById(id)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Submission not found with id: "
                                                + id
                                )
                        );

        submission.setScore(score);
        submission.setAiFeedback(aiFeedback);
        submission.setStatus(
                SubmissionStatus.EVALUATED
        );
        submission.setEvaluatedAt(
                LocalDateTime.now()
        );

        return submissionRepository.save(submission);
    }


    // ==============================
    // Delete Submission
    // ==============================

    public void deleteSubmission(Long id) {

        if (!submissionRepository.existsById(id)) {

            throw new IllegalArgumentException(
                    "Submission not found with id: " + id
            );
        }

        submissionRepository.deleteById(id);
    }
}