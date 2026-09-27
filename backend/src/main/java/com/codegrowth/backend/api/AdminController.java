package com.codegrowth.backend.api;

import com.codegrowth.backend.entity.*;
import com.codegrowth.backend.repository.*;
import com.codegrowth.backend.service.PlatformHealthService;
import java.util.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {
    private final AppUserRepository users; private final StudentProfileRepository studentProfiles; private final TeacherProfileRepository teacherProfiles;
    private final CourseRepository courses; private final EnrollmentRepository enrollments; private final AssignmentRepository assignments; private final SubmissionRepository submissions; private final AiGenerationRepository generations; private final PlatformHealthService health;
    public AdminController(AppUserRepository users, StudentProfileRepository studentProfiles, TeacherProfileRepository teacherProfiles, CourseRepository courses, EnrollmentRepository enrollments,
                           AssignmentRepository assignments, SubmissionRepository submissions, AiGenerationRepository generations, PlatformHealthService health) {
        this.users=users; this.studentProfiles=studentProfiles; this.teacherProfiles=teacherProfiles; this.courses=courses; this.enrollments=enrollments; this.assignments=assignments; this.submissions=submissions; this.generations=generations; this.health=health;
    }
    @GetMapping("/overview") public Map<String,Object> overview(){
        return Map.of("users",users.count(),"students",users.countByRole(Role.STUDENT),"teachers",users.countByRole(Role.TEACHER),"admins",users.countByRole(Role.ADMIN),"courses",courses.count(),"enrollments",enrollments.count(),"assignments",assignments.count(),"submissions",submissions.count(),"aiGenerations",generations.count());
    }
    @GetMapping("/users") public List<Map<String,Object>> users(){ return users.findAll().stream().map(u -> Map.<String,Object>of("id",u.getId(),"name",u.getName(),"email",u.getEmail(),"role",u.getRole().name(),"enabled",u.isEnabled())).toList(); }
    @PatchMapping("/users/{id}/role") public Map<String,Object> updateRole(Authentication auth,@PathVariable Long id,@RequestBody Map<String,String>b){
        AppUser target=users.findById(id).orElseThrow(); Role role=Role.valueOf(b.getOrDefault("role","STUDENT").toUpperCase());
        if(target.getEmail().equalsIgnoreCase(auth.getName()) && role != Role.ADMIN) throw new IllegalArgumentException("An administrator cannot remove their own admin role");
        target.setRole(role); users.save(target);
        if(role==Role.STUDENT && studentProfiles.findByUserId(target.getId()).isEmpty()) studentProfiles.save(new StudentProfile(target));
        if(role==Role.TEACHER && teacherProfiles.findByUserId(target.getId()).isEmpty()) teacherProfiles.save(new TeacherProfile(target));
        return Map.of("id",target.getId(),"role",target.getRole().name(),"enabled",target.isEnabled());
    }
    @PatchMapping("/users/{id}/status") public Map<String,Object> updateStatus(Authentication auth,@PathVariable Long id,@RequestBody Map<String,Object>b){
        AppUser target=users.findById(id).orElseThrow(); boolean enabled=Boolean.parseBoolean(String.valueOf(b.getOrDefault("enabled",true)));
        if(target.getEmail().equalsIgnoreCase(auth.getName()) && !enabled) throw new IllegalArgumentException("An administrator cannot disable their own account");
        target.setEnabled(enabled); users.save(target); return Map.of("id",target.getId(),"role",target.getRole().name(),"enabled",target.isEnabled());
    }
    @GetMapping("/courses") public List<Course> courses(){ return courses.findAll(); }
    @GetMapping("/analytics") public Map<String,Object> analytics(){ return Map.of("totalUsers",users.count(),"totalCourses",courses.count(),"totalEnrollments",enrollments.count(),"totalAssignments",assignments.count(),"totalSubmissions",submissions.count(),"totalAiGenerations",generations.count()); }
    @GetMapping("/system") public Map<String,String> system(){ return health.check(); }
}
