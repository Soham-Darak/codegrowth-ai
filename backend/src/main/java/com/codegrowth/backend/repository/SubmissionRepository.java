package com.codegrowth.backend.repository;

import com.codegrowth.backend.entity.Submission;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SubmissionRepository extends JpaRepository<Submission, Long> {
    List<Submission> findAllByStudentIdOrderBySubmittedAtDesc(Long studentId);
    List<Submission> findAllByAssignmentIdOrderBySubmittedAtDesc(Long assignmentId);
    Optional<Submission> findByAssignmentIdAndStudentId(Long assignmentId, Long studentId);
    long countByAssignmentCourseTeacherId(Long teacherId);
}
