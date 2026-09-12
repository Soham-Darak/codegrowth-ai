package com.codegrowth.controller;

import com.codegrowth.entity.GrowthRecord;
import com.codegrowth.service.GrowthRecordService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/growth-records")
public class GrowthRecordController {

    private final GrowthRecordService growthRecordService;

    public GrowthRecordController(
            GrowthRecordService growthRecordService) {

        this.growthRecordService =
                growthRecordService;
    }

    @PostMapping
    public ResponseEntity<GrowthRecord>
    createGrowthRecord(
            @RequestParam Long assessmentId) {

        try {

            GrowthRecord record =
                    growthRecordService
                            .createGrowthRecord(
                                    assessmentId
                            );

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(record);

        } catch (IllegalArgumentException exception) {

            return ResponseEntity
                    .badRequest()
                    .build();
        }
    }

    @GetMapping
    public ResponseEntity<List<GrowthRecord>>
    getAllGrowthRecords() {

        return ResponseEntity.ok(
                growthRecordService
                        .getAllGrowthRecords()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<GrowthRecord>
    getGrowthRecordById(
            @PathVariable Long id) {

        return growthRecordService
                .getGrowthRecordById(id)
                .map(ResponseEntity::ok)
                .orElse(
                        ResponseEntity
                                .notFound()
                                .build()
                );
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<GrowthRecord>>
    getGrowthRecordsByStudent(
            @PathVariable Long studentId) {

        return ResponseEntity.ok(
                growthRecordService
                        .getGrowthRecordsByStudent(
                                studentId
                        )
        );
    }

    @GetMapping("/competency/{competencyId}")
    public ResponseEntity<List<GrowthRecord>>
    getGrowthRecordsByCompetency(
            @PathVariable Long competencyId) {

        return ResponseEntity.ok(
                growthRecordService
                        .getGrowthRecordsByCompetency(
                                competencyId
                        )
        );
    }

    @GetMapping(
            "/student/{studentId}/competency/{competencyId}"
    )
    public ResponseEntity<List<GrowthRecord>>
    getGrowthRecordsByStudentAndCompetency(
            @PathVariable Long studentId,
            @PathVariable Long competencyId) {

        return ResponseEntity.ok(
                growthRecordService
                        .getGrowthRecordsByStudentAndCompetency(
                                studentId,
                                competencyId
                        )
        );
    }

    @GetMapping("/assessment/{assessmentId}")
    public ResponseEntity<List<GrowthRecord>>
    getGrowthRecordsByAssessment(
            @PathVariable Long assessmentId) {

        return ResponseEntity.ok(
                growthRecordService
                        .getGrowthRecordsByAssessment(
                                assessmentId
                        )
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void>
    deleteGrowthRecord(
            @PathVariable Long id) {

        try {

            growthRecordService
                    .deleteGrowthRecord(id);

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