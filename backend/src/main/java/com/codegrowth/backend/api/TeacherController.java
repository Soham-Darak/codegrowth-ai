package com.codegrowth.backend.api;

import com.codegrowth.backend.entity.Announcement;
import com.codegrowth.backend.entity.AppUser;
import com.codegrowth.backend.entity.Assignment;
import com.codegrowth.backend.entity.ConnectedRepository;
import com.codegrowth.backend.entity.Course;
import com.codegrowth.backend.entity.Enrollment;
import com.codegrowth.backend.entity.Submission;
import com.codegrowth.backend.entity.TeacherProfile;
import com.codegrowth.backend.repository.AnnouncementRepository;
import com.codegrowth.backend.repository.AppUserRepository;
import com.codegrowth.backend.repository.AssignmentRepository;
import com.codegrowth.backend.repository.ConnectedRepositoryRepository;
import com.codegrowth.backend.repository.CourseRepository;
import com.codegrowth.backend.repository.EnrollmentRepository;
import com.codegrowth.backend.repository.SubmissionRepository;
import com.codegrowth.backend.repository.TeacherProfileRepository;
import com.codegrowth.backend.service.AiService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@RestController
@RequestMapping("/api/teacher")
@PreAuthorize("hasRole('TEACHER')")
public class TeacherController {
    private final AppUserRepository users;
    private final TeacherProfileRepository profiles;
    private final CourseRepository courses;
    private final EnrollmentRepository enrollments;
    private final AssignmentRepository assignments;
    private final SubmissionRepository submissions;
    private final AnnouncementRepository announcements;
    private final AiService aiService;
    private final ConnectedRepositoryRepository connectedRepos;

    public TeacherController(
            AppUserRepository users,
            TeacherProfileRepository profiles,
            CourseRepository courses,
            EnrollmentRepository enrollments,
            AssignmentRepository assignments,
            SubmissionRepository submissions,
            AnnouncementRepository announcements,
            AiService aiService,
            ConnectedRepositoryRepository connectedRepos) {
        this.users = users;
        this.profiles = profiles;
        this.courses = courses;
        this.enrollments = enrollments;
        this.assignments = assignments;
        this.submissions = submissions;
        this.announcements = announcements;
        this.aiService = aiService;
        this.connectedRepos = connectedRepos;
    }

    @GetMapping("/overview")
    public Map<String, Object> overview(Authentication authentication) {
        AppUser currentUser = user(authentication);
        TeacherProfile profile = profiles.findByUserId(currentUser.getId())
                .orElseGet(() -> profiles.save(new TeacherProfile(currentUser)));
        List<Course> teacherCourses = courses.findAllByTeacherIdOrderByCreatedAtDesc(currentUser.getId());
        int studentsCount = teacherCourses.stream()
                .map(c -> enrollments.findAllByCourseIdOrderByEnrolledAtDesc(c.getId()).size())
                .reduce(0, Integer::sum);
        int assignmentsCount = teacherCourses.stream()
                .map(c -> assignments.findAllByCourseIdOrderByCreatedAtDesc(c.getId()).size())
                .reduce(0, Integer::sum);
        int submissionsCount = assignmentsCount == 0 ? 0 : (int) submissions.countByAssignmentCourseTeacherId(currentUser.getId());

        Map<String, Object> response = new HashMap<>();
        response.put("profile", profile);
        response.put("courses", teacherCourses.size());
        response.put("students", studentsCount);
        response.put("assignments", assignmentsCount);
        response.put("submissions", submissionsCount);
        return response;
    }

    @GetMapping("/profile")
    public TeacherProfile profile(Authentication authentication) {
        AppUser currentUser = user(authentication);
        return profiles.findByUserId(currentUser.getId())
                .orElseGet(() -> profiles.save(new TeacherProfile(currentUser)));
    }

    @PutMapping("/profile")
    public TeacherProfile updateProfile(Authentication authentication, @RequestBody Map<String, String> body) {
        AppUser currentUser = user(authentication);
        TeacherProfile profile = profiles.findByUserId(currentUser.getId())
                .orElseGet(() -> new TeacherProfile(currentUser));
        profile.update(
                body.get("department"),
                body.get("designation"),
                body.get("institution"),
                body.get("bio")
        );
        return profiles.save(profile);
    }

    @GetMapping("/courses")
    public List<Course> courses(Authentication authentication) {
        return courses.findAllByTeacherIdOrderByCreatedAtDesc(user(authentication).getId());
    }

    @PostMapping("/courses")
    public Course createCourse(Authentication authentication, @RequestBody Map<String, String> body) {
        return courses.save(new Course(
                body.getOrDefault("code", "NEW"),
                body.getOrDefault("title", "Untitled course"),
                body.get("description"),
                user(authentication)
        ));
    }

    @PutMapping("/courses/{id}")
    public Course updateCourse(
            Authentication authentication,
            @PathVariable("id") Long id,
            @RequestBody Map<String, String> body) {
        Course course = courses.findByIdAndTeacherId(id, user(authentication).getId()).orElseThrow();
        course.update(
                body.getOrDefault("code", course.getCode()),
                body.getOrDefault("title", course.getTitle()),
                body.getOrDefault("description", course.getDescription())
        );
        return courses.save(course);
    }

    @DeleteMapping("/courses/{id}")
    public ResponseEntity<Void> deleteCourse(Authentication authentication, @PathVariable("id") Long id) {
        Course course = courses.findByIdAndTeacherId(id, user(authentication).getId()).orElseThrow();
        courses.delete(course);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/courses/{courseId}/students")
    public List<Enrollment> students(Authentication authentication, @PathVariable("courseId") Long courseId) {
        courses.findByIdAndTeacherId(courseId, user(authentication).getId()).orElseThrow();
        return enrollments.findAllByCourseIdOrderByEnrolledAtDesc(courseId);
    }

    @GetMapping("/courses/{courseId}/assignments")
    public List<Assignment> assignments(Authentication authentication, @PathVariable("courseId") Long courseId) {
        courses.findByIdAndTeacherId(courseId, user(authentication).getId()).orElseThrow();
        return assignments.findAllByCourseIdOrderByCreatedAtDesc(courseId);
    }

    @PostMapping("/courses/{courseId}/assignments")
    public Assignment createAssignment(
            Authentication authentication,
            @PathVariable("courseId") Long courseId,
            @RequestBody Map<String, Object> body) {
        Course course = courses.findByIdAndTeacherId(courseId, user(authentication).getId()).orElseThrow();
        Instant dueAt = parseInstant(body.get("dueAt"));
        List<String> requirements = extractRequirements(body.get("requirements"));
        String title = body.getOrDefault("title", "Untitled assignment").toString();
        String description = body.get("description") != null ? body.get("description").toString() : null;

        return assignments.save(new Assignment(course, user(authentication), title, description, dueAt, requirements));
    }

    @PutMapping("/assignments/{id}")
    public Assignment updateAssignment(
            Authentication authentication,
            @PathVariable("id") Long id,
            @RequestBody Map<String, Object> body) {
        Assignment assignment = assignments.findByIdAndTeacherId(id, user(authentication).getId()).orElseThrow();
        Instant dueAt = body.containsKey("dueAt") ? parseInstant(body.get("dueAt")) : assignment.getDueAt();
        List<String> requirements = body.containsKey("requirements")
                ? extractRequirements(body.get("requirements"))
                : assignment.getRequirements();
        String title = body.getOrDefault("title", assignment.getTitle()).toString();
        String description = body.getOrDefault("description", assignment.getDescription()).toString();

        assignment.update(title, description, dueAt, requirements);
        return assignments.save(assignment);
    }

    @DeleteMapping("/assignments/{id}")
    public ResponseEntity<Void> deleteAssignment(Authentication authentication, @PathVariable("id") Long id) {
        Assignment assignment = assignments.findByIdAndTeacherId(id, user(authentication).getId()).orElseThrow();
        assignments.delete(assignment);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/assignments/{id}/submissions")
    public List<Submission> assignmentSubmissions(Authentication authentication, @PathVariable("id") Long id) {
        assignments.findByIdAndTeacherId(id, user(authentication).getId()).orElseThrow();
        return submissions.findAllByAssignmentIdOrderBySubmittedAtDesc(id);
    }

    @PatchMapping("/submissions/{id}/grade")
    public Submission grade(
            Authentication authentication,
            @PathVariable("id") Long id,
            @RequestBody Map<String, Object> body) {
        Submission submission = submissions.findById(id).orElseThrow();
        assignments.findByIdAndTeacherId(submission.getAssignment().getId(), user(authentication).getId()).orElseThrow();
        Double score = body.get("score") == null ? null : Double.valueOf(body.get("score").toString());
        String feedback = body.get("feedback") == null ? null : body.get("feedback").toString();

        submission.grade(score, feedback);
        return submissions.save(submission);
    }

    @PostMapping(value = "/submissions/{id}/authenticity", produces = "application/json")
    public ResponseEntity<String> checkAuthenticity(Authentication authentication, @PathVariable("id") Long id) {
        Submission submission = submissions.findById(id).orElseThrow();
        assignments.findByIdAndTeacherId(submission.getAssignment().getId(), user(authentication).getId()).orElseThrow();
        if (!submission.getContent().startsWith("http")) {
            return ResponseEntity.badRequest().body("{\"error\":\"Submission must be a GitHub URL\"}");
        }
        return ResponseEntity.ok(aiService.analyzeAuthenticity(submission.getContent()));
    }

    @GetMapping("/announcements")
    public List<Announcement> announcements(Authentication authentication) {
        return announcements.findAllByTeacherIdOrderByCreatedAtDesc(user(authentication).getId());
    }

    @PostMapping("/courses/{courseId}/announcements")
    public Announcement createAnnouncement(
            Authentication authentication,
            @PathVariable("courseId") Long courseId,
            @RequestBody Map<String, String> body) {
        Course course = courses.findByIdAndTeacherId(courseId, user(authentication).getId()).orElseThrow();
        return announcements.save(new Announcement(
                course,
                user(authentication),
                body.getOrDefault("title", "Announcement"),
                body.getOrDefault("message", "")
        ));
    }

    @GetMapping("/all-repos")
    public List<ConnectedRepository> allRepos(Authentication authentication) {
        return connectedRepos.findAll();
    }

    private static List<String> extractRequirements(Object reqObj) {
        if (reqObj instanceof List<?> list) {
            return list.stream()
                    .filter(Objects::nonNull)
                    .map(Object::toString)
                    .toList();
        }
        return List.of();
    }

    private static Instant parseInstant(Object val) {
        if (val == null) {
            return null;
        }
        String text = val.toString().trim();
        if (text.isBlank()) {
            return null;
        }
        try {
            return Instant.parse(text);
        } catch (Exception e) {
            try {
                return LocalDate.parse(text).atStartOfDay(ZoneOffset.UTC).toInstant();
            } catch (Exception e2) {
                return null;
            }
        }
    }

    private AppUser user(Authentication authentication) {
        return users.findByEmailIgnoreCase(authentication.getName()).orElseThrow();
    }
}
