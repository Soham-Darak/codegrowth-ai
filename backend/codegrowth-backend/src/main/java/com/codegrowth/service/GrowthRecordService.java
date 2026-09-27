package com.codegrowth.service;

import com.codegrowth.entity.CompetencyAssessment;
import com.codegrowth.entity.GrowthRecord;
import com.codegrowth.entity.GrowthStatus;
import com.codegrowth.entity.StudentSkillProfile;
import com.codegrowth.repository.CompetencyAssessmentRepository;
import com.codegrowth.repository.GrowthRecordRepository;
import com.codegrowth.repository.StudentSkillProfileRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class GrowthRecordService {

    private final GrowthRecordRepository growthRecordRepository;

    private final CompetencyAssessmentRepository
            assessmentRepository;

    private final StudentSkillProfileRepository
            profileRepository;

    public GrowthRecordService(
            GrowthRecordRepository growthRecordRepository,
            CompetencyAssessmentRepository assessmentRepository,
            StudentSkillProfileRepository profileRepository) {

        this.growthRecordRepository =
                growthRecordRepository;

        this.assessmentRepository =
                assessmentRepository;

        this.profileRepository =
                profileRepository;
    }

    /*
     * Creates a historical growth record from
     * a competency assessment.
     */
    public GrowthRecord createGrowthRecord(
            Long assessmentId) {

        CompetencyAssessment assessment =
                assessmentRepository.findById(
                                assessmentId
                        )
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Competency assessment "
                                                + "not found with id: "
                                                + assessmentId
                                )
                        );

        Long studentId =
                assessment.getStudent().getId();

        Long competencyId =
                assessment.getCompetency().getId();

        StudentSkillProfile profile =
                profileRepository
                        .findByStudentIdAndCompetencyId(
                                studentId,
                                competencyId
                        )
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Student skill profile "
                                                + "not found"
                                )
                        );

        Double previousScore =
                profile.getCurrentScore();

        Double newScore =
                assessment.getScore();

        double scoreChange =
                newScore - previousScore;

        GrowthStatus growthStatus;

        if (profile.getAssessmentCount() == 0) {

            growthStatus =
                    GrowthStatus.INSUFFICIENT_DATA;

        } else if (scoreChange > 0) {

            growthStatus =
                    GrowthStatus.IMPROVING;

        } else if (scoreChange < 0) {

            growthStatus =
                    GrowthStatus.DECLINING;

        } else {

            growthStatus =
                    GrowthStatus.STABLE;
        }

        GrowthRecord record =
                new GrowthRecord();

        record.setStudent(
                assessment.getStudent()
        );

        record.setCompetency(
                assessment.getCompetency()
        );

        record.setAssessment(assessment);

        record.setPreviousScore(
                previousScore
        );

        record.setNewScore(
                newScore
        );

        record.setScoreChange(
                Math.round(scoreChange * 100.0) / 100.0
        );

        record.setPreviousLevel(
                profile.getCurrentLevel()
        );

        record.setNewLevel(
                assessment.getAssessedLevel()
        );

        record.setGrowthStatus(
                growthStatus
        );

        record.setGrowthExplanation(
                assessment.getEvidence()
        );

        return growthRecordRepository.save(record);
    }

    public List<GrowthRecord>
    getAllGrowthRecords() {

        return growthRecordRepository.findAll();
    }

    public Optional<GrowthRecord>
    getGrowthRecordById(Long id) {

        return growthRecordRepository.findById(id);
    }

    public List<GrowthRecord>
    getGrowthRecordsByStudent(
            Long studentId) {

        return growthRecordRepository
                .findByStudentId(studentId);
    }

    public List<GrowthRecord>
    getGrowthRecordsByCompetency(
            Long competencyId) {

        return growthRecordRepository
                .findByCompetencyId(competencyId);
    }

    public List<GrowthRecord>
    getGrowthRecordsByStudentAndCompetency(
            Long studentId,
            Long competencyId) {

        return growthRecordRepository
                .findByStudentIdAndCompetencyId(
                        studentId,
                        competencyId
                );
    }

    public List<GrowthRecord>
    getGrowthRecordsByAssessment(
            Long assessmentId) {

        return growthRecordRepository
                .findByAssessmentId(assessmentId);
    }

    public void deleteGrowthRecord(Long id) {

        if (!growthRecordRepository.existsById(id)) {

            throw new IllegalArgumentException(
                    "Growth record not found with id: "
                            + id
            );
        }

        growthRecordRepository.deleteById(id);
    }
}