package com.codegrowth.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class CodeGrowthApplication {
    public static void main(String[] args) {
        SpringApplication.run(CodeGrowthApplication.class, args);
    }
}
