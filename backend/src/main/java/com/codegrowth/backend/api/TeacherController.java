package com.codegrowth.backend.api;

import com.codegrowth.backend.entity.*;
import com.codegrowth.backend.repository.*;
import com.codegrowth.backend.service.AiService;
import java.time.Instant;
import java.util.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/teacher")
@PreAuthorize("hasRole('TEACHER')")
public class TeacherController {
    private final AppUserRepository users; private final TeacherProfileRepository profiles; private final CourseRepository courses;
    private final EnrollmentRepository enrollments; private final AssignmentRepository assignments; private final SubmissionRepository submissions; private final AnnouncementRepository announcements;
    private final AiService aiService; private final ConnectedRepositoryRepository connectedRepos;
    public TeacherController(AppUserRepository users, TeacherProfileRepository profiles, CourseRepository courses, EnrollmentRepository enrollments,
                             AssignmentRepository assignments, SubmissionRepository submissions, AnnouncementRepository announcements, AiService aiService, ConnectedRepositoryRepository connectedRepos) {
        this.users=users; this.profiles=profiles; this.courses=courses; this.enrollments=enrollments; this.assignments=assignments; this.submissions=submissions; this.announcements=announcements; this.aiService=aiService; this.connectedRepos=connectedRepos;
    }
    @GetMapping("/overview") public Map<String,Object> overview(Authentication a) { 
        AppUser u=user(a); 
        TeacherProfile p = profiles.findByUserId(u.getId()).orElseGet(() -> profiles.save(new TeacherProfile(u)));
        List<Course> c=courses.findAllByTeacherIdOrderByCreatedAtDesc(u.getId()); 
        int students=c.stream().map(x->enrollments.findAllByCourseIdOrderByEnrolledAtDesc(x.getId()).size()).reduce(0,Integer::sum); 
        int asg=c.stream().map(x->assignments.findAllByCourseIdOrderByCreatedAtDesc(x.getId()).size()).reduce(0,Integer::sum); 
        int subs=asg==0?0:(int)submissions.countByAssignmentCourseTeacherId(u.getId()); 
        Map<String, Object> map = new HashMap<>();
        map.put("profile", p);
        map.put("courses", c.size());
        map.put("students", students);
        map.put("assignments", asg);
        map.put("submissions", subs);
        return map; 
    }
    @GetMapping("/profile") public TeacherProfile profile(Authentication a){ AppUser u = user(a); return profiles.findByUserId(u.getId()).orElseGet(() -> profiles.save(new TeacherProfile(u))); }
    @PutMapping("/profile") public TeacherProfile updateProfile(Authentication a,@RequestBody Map<String,String>b){ AppUser u = user(a); TeacherProfile p=profiles.findByUserId(u.getId()).orElseGet(() -> new TeacherProfile(u)); p.update(b.get("department"),b.get("designation"),b.get("institution"),b.get("bio")); return profiles.save(p); }
    @GetMapping("/courses") public List<Course> courses(Authentication a){ return courses.findAllByTeacherIdOrderByCreatedAtDesc(user(a).getId()); }
    @PostMapping("/courses") public Course createCourse(Authentication a,@RequestBody Map<String,String>b){ return courses.save(new Course(b.getOrDefault("code","NEW"),b.getOrDefault("title","Untitled course"),b.get("description"),user(a))); }
    @PutMapping("/courses/{id}") public Course updateCourse(Authentication a,@PathVariable Long id,@RequestBody Map<String,String>b){ Course c=courses.findByIdAndTeacherId(id,user(a).getId()).orElseThrow(); c.update(b.getOrDefault("code",c.getCode()),b.getOrDefault("title",c.getTitle()),b.getOrDefault("description",c.getDescription())); return courses.save(c); }
    @DeleteMapping("/courses/{id}") public ResponseEntity<Void> deleteCourse(Authentication a,@PathVariable Long id){ courses.delete(courses.findByIdAndTeacherId(id,user(a).getId()).orElseThrow()); return ResponseEntity.noContent().build(); }
    @GetMapping("/courses/{courseId}/students") public List<Enrollment> students(Authentication a,@PathVariable Long courseId){ courses.findByIdAndTeacherId(courseId,user(a).getId()).orElseThrow(); return enrollments.findAllByCourseIdOrderByEnrolledAtDesc(courseId); }
    @GetMapping("/courses/{courseId}/assignments") public List<Assignment> assignments(Authentication a,@PathVariable Long courseId){ courses.findByIdAndTeacherId(courseId,user(a).getId()).orElseThrow(); return assignments.findAllByCourseIdOrderByCreatedAtDesc(courseId); }
    @PostMapping("/courses/{courseId}/assignments") public Assignment createAssignment(Authentication a,@PathVariable Long courseId,@RequestBody Map<String,Object>b){ 
        Course c=courses.findByIdAndTeacherId(courseId,user(a).getId()).orElseThrow(); 
        Instant due=parseInstant(b.get("dueAt")); 
        java.util.List<String> reqs = b.containsKey("requirements") && b.get("requirements") instanceof java.util.List ? (java.util.List<String>)b.get("requirements") : java.util.List.of(); 
        return assignments.save(new Assignment(c,user(a),b.getOrDefault("title","Untitled assignment").toString(),b.get("description")!=null?b.get("description").toString():null,due,reqs)); 
    }
    @PutMapping("/assignments/{id}") public Assignment updateAssignment(Authentication a,@PathVariable Long id,@RequestBody Map<String,Object>b){ 
        Assignment x=assignments.findByIdAndTeacherId(id,user(a).getId()).orElseThrow(); 
        Instant due=b.containsKey("dueAt") ? parseInstant(b.get("dueAt")) : x.getDueAt(); 
        java.util.List<String> reqs = b.containsKey("requirements") && b.get("requirements") instanceof java.util.List ? (java.util.List<String>)b.get("requirements") : x.getRequirements(); 
        x.update(b.getOrDefault("title",x.getTitle()).toString(),b.getOrDefault("description",x.getDescription()).toString(),due,reqs); 
        return assignments.save(x); 
    }
    @DeleteMapping("/assignments/{id}") public ResponseEntity<Void> deleteAssignment(Authentication a,@PathVariable Long id){ assignments.delete(assignments.findByIdAndTeacherId(id,user(a).getId()).orElseThrow()); return ResponseEntity.noContent().build(); }
    @GetMapping("/assignments/{id}/submissions") public List<Submission> assignmentSubmissions(Authentication a,@PathVariable Long id){ assignments.findByIdAndTeacherId(id,user(a).getId()).orElseThrow(); return submissions.findAllByAssignmentIdOrderBySubmittedAtDesc(id); }
    @PatchMapping("/submissions/{id}/grade") public Submission grade(Authentication a,@PathVariable Long id,@RequestBody Map<String,Object>b){ Submission s=submissions.findById(id).orElseThrow(); assignments.findByIdAndTeacherId(s.getAssignment().getId(),user(a).getId()).orElseThrow(); Double score=b.get("score")==null?null:Double.valueOf(b.get("score").toString()); s.grade(score,b.get("feedback")==null?null:b.get("feedback").toString()); return submissions.save(s); }
    @PostMapping(value = "/submissions/{id}/authenticity", produces = "application/json") public ResponseEntity<String> checkAuthenticity(Authentication a,@PathVariable Long id){ 
        Submission s=submissions.findById(id).orElseThrow(); 
        assignments.findByIdAndTeacherId(s.getAssignment().getId(),user(a).getId()).orElseThrow(); 
        if(!s.getContent().startsWith("http")){ 
            return ResponseEntity.badRequest().body("{\"error\":\"Submission must be a GitHub URL\"}"); 
        } 
        return ResponseEntity.ok(aiService.analyzeAuthenticity(s.getContent())); 
    }
    @GetMapping("/announcements") public List<Announcement> announcements(Authentication a){ return announcements.findAllByTeacherIdOrderByCreatedAtDesc(user(a).getId()); }
    @PostMapping("/courses/{courseId}/announcements") public Announcement announcement(Authentication a,@PathVariable Long courseId,@RequestBody Map<String,String>b){ Course c=courses.findByIdAndTeacherId(courseId,user(a).getId()).orElseThrow(); return announcements.save(new Announcement(c,user(a),b.getOrDefault("title","Announcement"),b.getOrDefault("message",""))); }
    @GetMapping("/all-repos") public List<ConnectedRepository> allRepos(Authentication a) { return connectedRepos.findAll(); }
    
    private static Instant parseInstant(Object val) {
        if (val == null) return null;
        String text = val.toString().trim();
        if (text.isBlank()) return null;
        try { return Instant.parse(text); }
        catch (Exception e) {
            try { return java.time.LocalDate.parse(text).atStartOfDay(java.time.ZoneOffset.UTC).toInstant(); }
            catch (Exception e2) { return null; }
        }
    }

    private AppUser user(Authentication a){ return users.findByEmailIgnoreCase(a.getName()).orElseThrow(); }
}
