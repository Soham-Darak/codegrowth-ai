package com.codegrowth.backend.repository;

import com.codegrowth.backend.entity.Enrollment;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {
    List<Enrollment> findAllByStudentIdOrderByEnrolledAtDesc(Long studentId);
    List<Enrollment> findAllByCourseIdOrderByEnrolledAtDesc(Long courseId);
    Optional<Enrollment> findByStudentIdAndCourseId(Long studentId, Long courseId);
}
