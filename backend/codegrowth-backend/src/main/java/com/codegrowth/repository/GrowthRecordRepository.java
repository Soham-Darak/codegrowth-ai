package com.codegrowth.repository;

import com.codegrowth.entity.GrowthRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GrowthRecordRepository
        extends JpaRepository<GrowthRecord, Long> {

    List<GrowthRecord> findByStudentId(
            Long studentId
    );

    List<GrowthRecord> findByCompetencyId(
            Long competencyId
    );

    List<GrowthRecord>
    findByStudentIdAndCompetencyId(
            Long studentId,
            Long competencyId
    );

    List<GrowthRecord>
    findByAssessmentId(
            Long assessmentId
    );
}