package com.codegrowth.backend.service;

import com.codegrowth.backend.dto.AuthResponse;
import com.codegrowth.backend.dto.LoginRequest;
import com.codegrowth.backend.dto.RegisterRequest;
import com.codegrowth.backend.entity.AppUser;
import com.codegrowth.backend.entity.Role;
import com.codegrowth.backend.repository.AppUserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    private final AppUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(
            AppUserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public AuthResponse register(RegisterRequest request) {
        String email = request.email().trim().toLowerCase();
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new IllegalArgumentException("Email is already registered");
        }

        Role role = request.role() == null ? Role.STUDENT : request.role();

        AppUser user = userRepository.save(
                new AppUser(
                        request.name().trim(),
                        email,
                        passwordEncoder.encode(request.password()),
                        role));

        return toResponse(user);
    }

    public AuthResponse login(LoginRequest request) {
        String email = request.email().trim().toLowerCase();
        AppUser user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new IllegalArgumentException("Invalid email or password");
        }

        return toResponse(user);
    }

    private AuthResponse toResponse(AppUser user) {
        return new AuthResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole().name(),
                jwtService.generateToken(user.getId(), user.getEmail(), user.getRole()));
    }
}
