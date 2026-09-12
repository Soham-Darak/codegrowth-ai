package com.codegrowth.repository;

import com.codegrowth.entity.CompetencyAssessment;
import com.codegrowth.entity.CompetencyAssessmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CompetencyAssessmentRepository
        extends JpaRepository<CompetencyAssessment, Long> {

    List<CompetencyAssessment> findByStudentId(
            Long studentId
    );

    List<CompetencyAssessment> findByCompetencyId(
            Long competencyId
    );

    List<CompetencyAssessment> findByEvaluationId(
            Long evaluationId
    );

    Optional<CompetencyAssessment>
    findByEvaluationIdAndCompetencyId(
            Long evaluationId,
            Long competencyId
    );

    boolean existsByEvaluationIdAndCompetencyId(
            Long evaluationId,
            Long competencyId
    );

    List<CompetencyAssessment> findByStatus(
            CompetencyAssessmentStatus status
    );
}