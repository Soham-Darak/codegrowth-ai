package com.codegrowth.repository;

import com.codegrowth.entity.Assignment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AssignmentRepository extends JpaRepository<Assignment, Long> {

    List<Assignment> findByCourseId(Long courseId);

    Optional<Assignment> findByCourseIdAndTitle(
            Long courseId,
            String title
    );

    boolean existsByCourseIdAndTitle(
            Long courseId,
            String title
    );
}