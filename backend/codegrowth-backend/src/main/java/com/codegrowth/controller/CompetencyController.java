package com.codegrowth.controller;

import com.codegrowth.entity.Competency;
import com.codegrowth.entity.CompetencyLevel;
import com.codegrowth.service.CompetencyService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/competencies")
public class CompetencyController {

    private final CompetencyService competencyService;

    public CompetencyController(
            CompetencyService competencyService) {

        this.competencyService = competencyService;
    }

    @PostMapping
    public ResponseEntity<Competency> createCompetency(
            @RequestBody Competency competency) {

        try {

            Competency createdCompetency =
                    competencyService.createCompetency(
                            competency
                    );

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(createdCompetency);

        } catch (IllegalArgumentException exception) {

            return ResponseEntity
                    .badRequest()
                    .build();
        }
    }

    @GetMapping
    public ResponseEntity<List<Competency>>
    getAllCompetencies() {

        return ResponseEntity.ok(
                competencyService.getAllCompetencies()
        );
    }

    @GetMapping("/active")
    public ResponseEntity<List<Competency>>
    getActiveCompetencies() {

        return ResponseEntity.ok(
                competencyService.getActiveCompetencies()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<Competency>
    getCompetencyById(
            @PathVariable Long id) {

        return competencyService
                .getCompetencyById(id)
                .map(ResponseEntity::ok)
                .orElse(
                        ResponseEntity
                                .notFound()
                                .build()
                );
    }

    @GetMapping("/name/{name}")
    public ResponseEntity<Competency>
    getCompetencyByName(
            @PathVariable String name) {

        return competencyService
                .getCompetencyByName(name)
                .map(ResponseEntity::ok)
                .orElse(
                        ResponseEntity
                                .notFound()
                                .build()
                );
    }

    @GetMapping("/level/{level}")
    public ResponseEntity<List<Competency>>
    getCompetenciesByLevel(
            @PathVariable CompetencyLevel level) {

        return ResponseEntity.ok(
                competencyService
                        .getCompetenciesByLevel(level)
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<Competency>
    updateCompetency(
            @PathVariable Long id,
            @RequestBody Competency competency) {

        try {

            Competency updatedCompetency =
                    competencyService.updateCompetency(
                            id,
                            competency
                    );

            return ResponseEntity.ok(
                    updatedCompetency
            );

        } catch (IllegalArgumentException exception) {

            return ResponseEntity
                    .badRequest()
                    .build();
        }
    }

    @PatchMapping("/{id}/level")
    public ResponseEntity<Competency>
    updateCompetencyLevel(
            @PathVariable Long id,
            @RequestParam CompetencyLevel level) {

        try {

            Competency updatedCompetency =
                    competencyService.updateCompetencyLevel(
                            id,
                            level
                    );

            return ResponseEntity.ok(
                    updatedCompetency
            );

        } catch (IllegalArgumentException exception) {

            return ResponseEntity
                    .notFound()
                    .build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void>
    deleteCompetency(
            @PathVariable Long id) {

        try {

            competencyService.deleteCompetency(id);

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