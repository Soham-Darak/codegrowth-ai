package com.codegrowth.backend.api;

import com.codegrowth.backend.entity.*;
import com.codegrowth.backend.repository.*;
import com.codegrowth.backend.service.AiEvaluationService;
import java.time.Instant;
import java.util.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/student")
@PreAuthorize("hasRole('STUDENT')")
public class StudentController {
    private final AppUserRepository users; private final StudentProfileRepository profiles; private final CourseRepository courses;
    private final EnrollmentRepository enrollments; private final AssignmentRepository assignments; private final SubmissionRepository submissions; private final LearningGoalRepository goals; private final AnnouncementRepository announcements;
    private final AiEvaluationService aiEvaluationService;
    private final ConnectedRepositoryRepository connectedRepos;
    private final com.codegrowth.backend.service.RepositoryAnalysisService repositoryAnalysisService;

    public StudentController(AppUserRepository users, StudentProfileRepository profiles, CourseRepository courses, EnrollmentRepository enrollments,
                             AssignmentRepository assignments, SubmissionRepository submissions, LearningGoalRepository goals, AnnouncementRepository announcements,
                             AiEvaluationService aiEvaluationService, ConnectedRepositoryRepository connectedRepos, com.codegrowth.backend.service.RepositoryAnalysisService repositoryAnalysisService) {
        this.users = users; this.profiles = profiles; this.courses = courses; this.enrollments = enrollments; this.assignments = assignments; this.submissions = submissions; this.goals = goals; this.announcements = announcements;
        this.aiEvaluationService = aiEvaluationService;
        this.connectedRepos = connectedRepos;
        this.repositoryAnalysisService = repositoryAnalysisService;
    }
    @GetMapping("/overview") public ResponseEntity<Map<String,Object>> overview(Authentication auth) {
        AppUser u = user(auth); 
        StudentProfile p = profiles.findByUserId(u.getId()).orElseGet(() -> profiles.save(new StudentProfile(u)));
        List<Enrollment> e = enrollments.findAllByStudentIdOrderByEnrolledAtDesc(u.getId());
        Map<String, Object> map = new HashMap<>();
        map.put("profile", p);
        map.put("courses", e.size());
        map.put("assignments", e.stream().map(x -> assignments.findAllByCourseIdOrderByCreatedAtDesc(x.getCourse().getId()).size()).reduce(0, Integer::sum));
        map.put("submissions", submissions.findAllByStudentIdOrderBySubmittedAtDesc(u.getId()).size());
        map.put("goals", goals.findAllByStudentIdOrderByCreatedAtDesc(u.getId()).size());
        return ResponseEntity.ok(map);
    }
    @GetMapping("/profile") public StudentProfile profile(Authentication a) { AppUser u = user(a); return profiles.findByUserId(u.getId()).orElseGet(() -> profiles.save(new StudentProfile(u))); }
    @PutMapping("/profile") public StudentProfile updateProfile(Authentication a, @RequestBody Map<String,String> b) { AppUser u = user(a); StudentProfile p = profiles.findByUserId(u.getId()).orElseGet(() -> new StudentProfile(u)); p.update(b.get("university"), b.get("branch"), b.get("academicYear"), b.get("targetRole"), b.get("bio")); return profiles.save(p); }
    @GetMapping("/courses") public List<Course> courses() { return courses.findAll(); }
    @GetMapping("/courses/enrolled") public List<Enrollment> enrolled(Authentication a) { return enrollments.findAllByStudentIdOrderByEnrolledAtDesc(user(a).getId()); }
    @PostMapping("/courses/{courseId}/enroll") public Enrollment enroll(Authentication a, @PathVariable Long courseId) { AppUser u = user(a); Course c = courses.findById(courseId).orElseThrow(); return enrollments.findByStudentIdAndCourseId(u.getId(), courseId).orElseGet(() -> enrollments.save(new Enrollment(u, c))); }
    @PatchMapping("/courses/{courseId}/progress") public Enrollment progress(Authentication a,@PathVariable Long courseId,@RequestBody Map<String,Object>b){ Enrollment e=enrollments.findByStudentIdAndCourseId(user(a).getId(),courseId).orElseThrow(); e.setProgress(Integer.parseInt(String.valueOf(b.getOrDefault("progress", e.getProgress())))); return enrollments.save(e); }
    @GetMapping("/announcements") public List<Announcement> announcements(Authentication a){ return enrollments.findAllByStudentIdOrderByEnrolledAtDesc(user(a).getId()).stream().flatMap(e -> announcements.findAllByCourseIdOrderByCreatedAtDesc(e.getCourse().getId()).stream()).toList(); }
    @GetMapping("/assignments") public List<Assignment> assignments(Authentication a) { return enrollments.findAllByStudentIdOrderByEnrolledAtDesc(user(a).getId()).stream().flatMap(e -> assignments.findAllByCourseIdOrderByCreatedAtDesc(e.getCourse().getId()).stream()).toList(); }
    @PostMapping("/assignments/{assignmentId}/submit") public Submission submit(Authentication a, @PathVariable Long assignmentId, @RequestBody Map<String,String> body) {
        AppUser u = user(a); Assignment x = assignments.findById(assignmentId).orElseThrow();
        enrollments.findByStudentIdAndCourseId(u.getId(), x.getCourse().getId()).orElseThrow(() -> new IllegalArgumentException("Enroll in the course before submitting"));
        String newContent = body.getOrDefault("content", "").trim();
        Submission s = submissions.findByAssignmentIdAndStudentId(assignmentId, u.getId())
                .map(existing -> {
                    existing.updateContent(newContent);
                    return existing;
                })
                .orElseGet(() -> new Submission(x, u, newContent));
        boolean isNew = s.getId() == null;
        s = submissions.save(s);
        
        if (isNew || Boolean.parseBoolean(body.getOrDefault("forceEvaluate", "false"))) {
            aiEvaluationService.evaluateSubmissionAsync(s.getId(), true);
        }
        
        return s;
    }
    @GetMapping("/submissions") public List<Submission> submissions(Authentication a) { return submissions.findAllByStudentIdOrderBySubmittedAtDesc(user(a).getId()); }
    
    @GetMapping("/submissions/{id}/evaluation") 
    public ResponseEntity<AiEvaluation> evaluation(Authentication a, @PathVariable Long id) {
        Submission s = submissions.findById(id).orElseThrow();
        if (!s.getStudent().getId().equals(user(a).getId())) return ResponseEntity.status(403).build();
        return aiEvaluationService.getEvaluation(s).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/goals") public List<LearningGoal> goals(Authentication a) { return goals.findAllByStudentIdOrderByCreatedAtDesc(user(a).getId()); }
    @PostMapping("/goals") public LearningGoal createGoal(Authentication a, @RequestBody Map<String,String> b) { Instant target = parseInstant(b.get("targetDate")); return goals.save(new LearningGoal(user(a), b.getOrDefault("title", "Untitled goal"), b.get("description"), target)); }
    @PutMapping("/goals/{id}") public LearningGoal updateGoal(Authentication a, @PathVariable Long id, @RequestBody Map<String,String> b) { LearningGoal g = goals.findByIdAndStudentId(id, user(a).getId()).orElseThrow(); Instant target = parseInstant(b.get("targetDate")); int progress = b.get("progress") == null ? g.getProgress() : Integer.parseInt(b.get("progress")); g.update(b.getOrDefault("title", g.getTitle()), b.getOrDefault("description", g.getDescription()), target, progress, b.getOrDefault("status", g.getStatus())); return goals.save(g); }

    @GetMapping("/repositories")
    public List<ConnectedRepository> getRepositories(Authentication auth) {
        return connectedRepos.findAllByStudentIdOrderByConnectedAtDesc(user(auth).getId());
    }

    @PostMapping("/repositories")
    public ConnectedRepository addRepository(Authentication auth, @RequestBody Map<String, String> body) {
        ConnectedRepository repo = new ConnectedRepository(user(auth), body.get("repositoryUrl"), body.get("branch"), body.getOrDefault("name", "My Repository"));
        repo = connectedRepos.save(repo);
        repositoryAnalysisService.analyzeRepositoryAsync(repo.getId());
        return repo;
    }

    @GetMapping("/repositories/{id}")
    public ConnectedRepository getRepository(Authentication auth, @PathVariable Long id) {
        ConnectedRepository repo = connectedRepos.findById(id).orElseThrow();
        if (!repo.getStudent().getId().equals(user(auth).getId())) throw new org.springframework.security.access.AccessDeniedException("Forbidden");
        return repo;
    }

    @DeleteMapping("/repositories/{id}")
    public void deleteRepository(Authentication auth, @PathVariable Long id) {
        ConnectedRepository repo = connectedRepos.findById(id).orElseThrow();
        if (!repo.getStudent().getId().equals(user(auth).getId())) throw new org.springframework.security.access.AccessDeniedException("Forbidden");
        connectedRepos.delete(repo);
    }
    
    private static Instant parseInstant(String text) {
        if (text == null || text.isBlank()) return null;
        try { return Instant.parse(text); }
        catch (Exception e) {
            try { return java.time.LocalDate.parse(text).atStartOfDay(java.time.ZoneOffset.UTC).toInstant(); }
            catch (Exception e2) { return null; }
        }
    }

    private AppUser user(Authentication a) { return users.findByEmailIgnoreCase(a.getName()).orElseThrow(); }
}
