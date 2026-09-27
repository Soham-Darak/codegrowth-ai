package com.codegrowth.backend.dto;

public record AuthResponse(
        Long userId,
        String name,
        String email,
        String role,
        String token,
        String avatarUrl,
        String provider
) {
}
