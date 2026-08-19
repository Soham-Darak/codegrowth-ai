package com.codegrowth.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1")
public class HealthController {

    @GetMapping("/health")
    public Map<String, Object> health() {
        Map<String, Object> response = new LinkedHashMap<>();

        response.put("application", "CodeGrowth AI");
        response.put("status", "UP");
        response.put("message", "CodeGrowth AI backend is running");
        response.put("version", "1.0.0");

        return response;
    }
}