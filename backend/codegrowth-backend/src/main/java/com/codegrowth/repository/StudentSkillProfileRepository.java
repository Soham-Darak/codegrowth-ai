package com.codegrowth.repository;

import com.codegrowth.entity.StudentSkillProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface StudentSkillProfileRepository
        extends JpaRepository<StudentSkillProfile, Long> {

    List<StudentSkillProfile> findByStudentId(
            Long studentId
    );

    List<StudentSkillProfile> findByCompetencyId(
            Long competencyId
    );

    Optional<StudentSkillProfile>
    findByStudentIdAndCompetencyId(
            Long studentId,
            Long competencyId
    );

    boolean existsByStudentIdAndCompetencyId(
            Long studentId,
            Long competencyId
    );
}