package com.codegrowth.controller;

import com.codegrowth.entity.CompetencyLevel;
import com.codegrowth.entity.StudentSkillProfile;
import com.codegrowth.service.StudentSkillProfileService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/skill-profiles")
public class StudentSkillProfileController {

    private final StudentSkillProfileService
            profileService;

    public StudentSkillProfileController(
            StudentSkillProfileService profileService) {

        this.profileService = profileService;
    }

    @PostMapping
    public ResponseEntity<StudentSkillProfile>
    createProfile(
            @RequestParam Long studentId,
            @RequestParam Long competencyId) {

        try {

            StudentSkillProfile profile =
                    profileService.createProfile(
                            studentId,
                            competencyId
                    );

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(profile);

        } catch (IllegalArgumentException exception) {

            return ResponseEntity
                    .badRequest()
                    .build();
        }
    }

    @GetMapping
    public ResponseEntity<List<StudentSkillProfile>>
    getAllProfiles() {

        return ResponseEntity.ok(
                profileService.getAllProfiles()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<StudentSkillProfile>
    getProfileById(
            @PathVariable Long id) {

        return profileService
                .getProfileById(id)
                .map(ResponseEntity::ok)
                .orElse(
                        ResponseEntity
                                .notFound()
                                .build()
                );
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<StudentSkillProfile>>
    getProfilesByStudent(
            @PathVariable Long studentId) {

        return ResponseEntity.ok(
                profileService
                        .getProfilesByStudent(
                                studentId
                        )
        );
    }

    @GetMapping("/competency/{competencyId}")
    public ResponseEntity<List<StudentSkillProfile>>
    getProfilesByCompetency(
            @PathVariable Long competencyId) {

        return ResponseEntity.ok(
                profileService
                        .getProfilesByCompetency(
                                competencyId
                        )
        );
    }

    @GetMapping(
            "/student/{studentId}/competency/{competencyId}"
    )
    public ResponseEntity<StudentSkillProfile>
    getProfile(
            @PathVariable Long studentId,
            @PathVariable Long competencyId) {

        return profileService
                .getProfile(
                        studentId,
                        competencyId
                )
                .map(ResponseEntity::ok)
                .orElse(
                        ResponseEntity
                                .notFound()
                                .build()
                );
    }

    @PatchMapping("/{id}/update")
    public ResponseEntity<StudentSkillProfile>
    updateProfile(
            @PathVariable Long id,
            @RequestParam Double score,
            @RequestParam CompetencyLevel level) {

        try {

            StudentSkillProfile profile =
                    profileService.updateProfile(
                            id,
                            score,
                            level
                    );

            return ResponseEntity.ok(profile);

        } catch (IllegalArgumentException exception) {

            return ResponseEntity
                    .badRequest()
                    .build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void>
    deleteProfile(
            @PathVariable Long id) {

        try {

            profileService.deleteProfile(id);

            return ResponseEntity
                    .noContent()
                    .build();

        } catch (IllegalArgumentException exception) {

            return ResponseEntity
                    .notFound()
                    .build();
        }
    }
}