package com.codegrowth.backend.service;

import com.codegrowth.backend.dto.AuthResponse;
import com.codegrowth.backend.dto.LoginRequest;
import com.codegrowth.backend.dto.RegisterRequest;
import com.codegrowth.backend.entity.AppUser;
import com.codegrowth.backend.entity.Role;
import com.codegrowth.backend.repository.AppUserRepository;
import com.codegrowth.backend.repository.StudentProfileRepository;
import com.codegrowth.backend.repository.TeacherProfileRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    private final AppUserRepository userRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final TeacherProfileRepository teacherProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(AppUserRepository userRepository,
                       StudentProfileRepository studentProfileRepository,
                       TeacherProfileRepository teacherProfileRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService) {
        this.userRepository = userRepository;
        this.studentProfileRepository = studentProfileRepository;
        this.teacherProfileRepository = teacherProfileRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public AuthResponse register(RegisterRequest request) {
        String email = request.email().trim().toLowerCase();
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new IllegalArgumentException("Email is already registered");
        }

        Role role = request.role() == null ? Role.STUDENT : request.role();
        if (role == Role.ADMIN) {
            throw new IllegalArgumentException("Admin accounts must be created by an existing administrator");
        }

        AppUser user = userRepository.save(new AppUser(
                request.name().trim(), email,
                passwordEncoder.encode(request.password()), role));

        if (role == Role.STUDENT) {
            studentProfileRepository.save(new com.codegrowth.backend.entity.StudentProfile(user));
        } else if (role == Role.TEACHER) {
            teacherProfileRepository.save(new com.codegrowth.backend.entity.TeacherProfile(user));
        }
        return toResponse(user);
    }

    public AuthResponse login(LoginRequest request) {
        String email = request.email().trim().toLowerCase();
        AppUser user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));
        if (!user.isEnabled() || !passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new IllegalArgumentException("Invalid email or password");
        }
        return toResponse(user);
    }

    public AuthResponse me(String email) {
        return toResponse(userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new IllegalArgumentException("Authenticated user not found")));
    }

    private AuthResponse toResponse(AppUser user) {
        return new AuthResponse(user.getId(), user.getName(), user.getEmail(),
                user.getRole().name(), jwtService.generateToken(user.getId(), user.getEmail(), user.getRole()));
    }
}
