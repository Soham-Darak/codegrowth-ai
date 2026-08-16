package com.codegrowth.backend.repository;

import com.codegrowth.backend.entity.Assignment;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AssignmentRepository extends JpaRepository<Assignment, Long> {
    List<Assignment> findAllByCourseIdOrderByCreatedAtDesc(Long courseId);
    List<Assignment> findAllByTeacherIdOrderByCreatedAtDesc(Long teacherId);
    Optional<Assignment> findByIdAndTeacherId(Long id, Long teacherId);
}
