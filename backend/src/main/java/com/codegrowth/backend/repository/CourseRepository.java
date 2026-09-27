package com.codegrowth.backend.repository;

import com.codegrowth.backend.entity.Course;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CourseRepository extends JpaRepository<Course, Long> {
    List<Course> findAllByTeacherIdOrderByCreatedAtDesc(Long teacherId);
    Optional<Course> findByIdAndTeacherId(Long id, Long teacherId);
}
