package com.codegrowth.service;

import com.codegrowth.entity.Course;
import com.codegrowth.entity.Enrollment;
import com.codegrowth.entity.User;
import com.codegrowth.entity.UserRole;
import com.codegrowth.repository.CourseRepository;
import com.codegrowth.repository.EnrollmentRepository;
import com.codegrowth.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class EnrollmentService {

    private final EnrollmentRepository enrollmentRepository;
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;

    public EnrollmentService(
            EnrollmentRepository enrollmentRepository,
            UserRepository userRepository,
            CourseRepository courseRepository) {

        this.enrollmentRepository = enrollmentRepository;
        this.userRepository = userRepository;
        this.courseRepository = courseRepository;
    }

    public Enrollment createEnrollment(
            Long studentId,
            Long courseId) {

        User student = userRepository.findById(studentId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Student not found with id: " + studentId
                        )
                );

        if (student.getRole() != UserRole.STUDENT) {
            throw new IllegalArgumentException(
                    "Only users with STUDENT role can enroll in a course"
            );
        }

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Course not found with id: " + courseId
                        )
                );

        if (enrollmentRepository.existsByStudentIdAndCourseId(
                studentId,
                courseId)) {

            throw new IllegalArgumentException(
                    "Student is already enrolled in this course"
            );
        }

        Enrollment enrollment = new Enrollment();

        enrollment.setStudent(student);
        enrollment.setCourse(course);

        return enrollmentRepository.save(enrollment);
    }

    public List<Enrollment> getAllEnrollments() {
        return enrollmentRepository.findAll();
    }

    public Optional<Enrollment> getEnrollmentById(Long id) {
        return enrollmentRepository.findById(id);
    }

    public List<Enrollment> getEnrollmentsByStudent(
            Long studentId) {

        return enrollmentRepository.findByStudentId(studentId);
    }

    public List<Enrollment> getEnrollmentsByCourse(
            Long courseId) {

        return enrollmentRepository.findByCourseId(courseId);
    }

    public Enrollment updateEnrollmentStatus(
            Long id,
            com.codegrowth.entity.EnrollmentStatus status) {

        Enrollment enrollment =
                enrollmentRepository.findById(id)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Enrollment not found with id: " + id
                                )
                        );

        enrollment.setStatus(status);

        if (status == com.codegrowth.entity.EnrollmentStatus.COMPLETED) {
            enrollment.setCompletedAt(
                    java.time.LocalDateTime.now()
            );
        } else {
            enrollment.setCompletedAt(null);
        }

        return enrollmentRepository.save(enrollment);
    }

    public void deleteEnrollment(Long id) {

        if (!enrollmentRepository.existsById(id)) {
            throw new IllegalArgumentException(
                    "Enrollment not found with id: " + id
            );
        }

        enrollmentRepository.deleteById(id);
    }
}