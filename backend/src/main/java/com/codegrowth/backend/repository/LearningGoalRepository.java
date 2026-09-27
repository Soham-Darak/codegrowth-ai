package com.codegrowth.backend.repository;

import com.codegrowth.backend.entity.LearningGoal;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LearningGoalRepository extends JpaRepository<LearningGoal, Long> {
    List<LearningGoal> findAllByStudentIdOrderByCreatedAtDesc(Long studentId);
    Optional<LearningGoal> findByIdAndStudentId(Long id, Long studentId);
}
