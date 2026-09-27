package com.codegrowth.service;

import com.codegrowth.entity.Competency;
import com.codegrowth.entity.CompetencyLevel;
import com.codegrowth.entity.User;
import com.codegrowth.entity.UserRole;
import com.codegrowth.entity.GrowthStatus;
import com.codegrowth.entity.StudentSkillProfile;
import com.codegrowth.repository.CompetencyRepository;
import com.codegrowth.repository.StudentSkillProfileRepository;
import com.codegrowth.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class StudentSkillProfileService {

    private final StudentSkillProfileRepository
            profileRepository;

    private final UserRepository userRepository;

    private final CompetencyRepository competencyRepository;

    public StudentSkillProfileService(
            StudentSkillProfileRepository profileRepository,
            UserRepository userRepository,
            CompetencyRepository competencyRepository) {

        this.profileRepository = profileRepository;
        this.userRepository = userRepository;
        this.competencyRepository = competencyRepository;
    }

    /*
     * Creates a skill profile for a student and competency.
     */
    public StudentSkillProfile createProfile(
            Long studentId,
            Long competencyId) {

        User student =
                userRepository.findById(studentId)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Student not found with id: "
                                                + studentId
                                )
                        );

        if (student.getRole() != UserRole.STUDENT) {

            throw new IllegalArgumentException(
                    "Skill profiles can only be created "
                            + "for STUDENT users"
            );
        }

        Competency competency =
                competencyRepository.findById(competencyId)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Competency not found with id: "
                                                + competencyId
                                )
                        );

        if (profileRepository
                .existsByStudentIdAndCompetencyId(
                        studentId,
                        competencyId)) {

            throw new IllegalArgumentException(
                    "A skill profile already exists "
                            + "for this student and competency"
            );
        }

        StudentSkillProfile profile =
                new StudentSkillProfile();

        profile.setStudent(student);
        profile.setCompetency(competency);

        return profileRepository.save(profile);
    }

    public List<StudentSkillProfile>
    getAllProfiles() {

        return profileRepository.findAll();
    }

    public Optional<StudentSkillProfile>
    getProfileById(Long id) {

        return profileRepository.findById(id);
    }

    public List<StudentSkillProfile>
    getProfilesByStudent(Long studentId) {

        return profileRepository.findByStudentId(
                studentId
        );
    }

    public List<StudentSkillProfile>
    getProfilesByCompetency(Long competencyId) {

        return profileRepository.findByCompetencyId(
                competencyId
        );
    }

    public Optional<StudentSkillProfile>
    getProfile(
            Long studentId,
            Long competencyId) {

        return profileRepository
                .findByStudentIdAndCompetencyId(
                        studentId,
                        competencyId
                );
    }

    /*
     * Updates a profile after a new competency assessment.
     */
    public StudentSkillProfile updateProfile(
            Long profileId,
            Double newScore,
            CompetencyLevel newLevel) {

        validateScore(newScore);

        StudentSkillProfile profile =
                profileRepository.findById(profileId)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Skill profile not found with id: "
                                                + profileId
                                )
                        );

        Double previousScore =
                profile.getCurrentScore();

        /*
         * Move current score into previous score.
         */
        profile.setPreviousScore(previousScore);

        /*
         * Set new score.
         */
        profile.setCurrentScore(newScore);

        /*
         * Update level.
         */
        profile.setCurrentLevel(newLevel);

        /*
         * Update assessment count.
         */
        profile.setAssessmentCount(
                profile.getAssessmentCount() + 1
        );

        /*
         * Update highest score.
         */
        if (newScore > profile.getHighestScore()) {

            profile.setHighestScore(newScore);
        }

        /*
         * Update lowest score.
         */
        if (profile.getAssessmentCount() == 1
                || newScore < profile.getLowestScore()) {

            profile.setLowestScore(newScore);
        }

        /*
         * Determine growth direction.
         */
        if (profile.getAssessmentCount() <= 1) {

            profile.setGrowthStatus(
                    GrowthStatus.INSUFFICIENT_DATA
            );

        } else if (newScore > previousScore) {

            profile.setGrowthStatus(
                    GrowthStatus.IMPROVING
            );

        } else if (newScore < previousScore) {

            profile.setGrowthStatus(
                    GrowthStatus.DECLINING
            );

        } else {

            profile.setGrowthStatus(
                    GrowthStatus.STABLE
            );
        }

        profile.setLastAssessedAt(
                java.time.LocalDateTime.now()
        );

        return profileRepository.save(profile);
    }

    private void validateScore(Double score) {

        if (score == null) {

            throw new IllegalArgumentException(
                    "Score cannot be null"
            );
        }

        if (score < 0 || score > 100) {

            throw new IllegalArgumentException(
                    "Score must be between 0 and 100"
            );
        }
    }

    public void deleteProfile(Long id) {

        if (!profileRepository.existsById(id)) {

            throw new IllegalArgumentException(
                    "Skill profile not found with id: "
                            + id
            );
        }

        profileRepository.deleteById(id);
    }
}