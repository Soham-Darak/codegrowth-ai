package com.codegrowth.service;

import com.codegrowth.entity.Assignment;
import com.codegrowth.entity.AssignmentStatus;
import com.codegrowth.entity.Course;
import com.codegrowth.repository.AssignmentRepository;
import com.codegrowth.repository.CourseRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class AssignmentService {

    private final AssignmentRepository assignmentRepository;
    private final CourseRepository courseRepository;

    public AssignmentService(
            AssignmentRepository assignmentRepository,
            CourseRepository courseRepository) {

        this.assignmentRepository = assignmentRepository;
        this.courseRepository = courseRepository;
    }

    public Assignment createAssignment(
            Long courseId,
            Assignment assignment) {

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Course not found with id: " + courseId
                        )
                );

        if (assignmentRepository.existsByCourseIdAndTitle(
                courseId,
                assignment.getTitle())) {

            throw new IllegalArgumentException(
                    "An assignment with this title already exists in this course"
            );
        }

        assignment.setCourse(course);

        return assignmentRepository.save(assignment);
    }

    public List<Assignment> getAllAssignments() {
        return assignmentRepository.findAll();
    }

    public Optional<Assignment> getAssignmentById(Long id) {
        return assignmentRepository.findById(id);
    }

    public List<Assignment> getAssignmentsByCourse(
            Long courseId) {

        return assignmentRepository.findByCourseId(courseId);
    }

    public Assignment updateAssignment(
            Long id,
            Assignment updatedAssignment) {

        Assignment existingAssignment =
                assignmentRepository.findById(id)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Assignment not found with id: " + id
                                )
                        );

        if (!existingAssignment.getTitle()
                .equals(updatedAssignment.getTitle())
                && assignmentRepository.existsByCourseIdAndTitle(
                existingAssignment.getCourse().getId(),
                updatedAssignment.getTitle())) {

            throw new IllegalArgumentException(
                    "An assignment with this title already exists in this course"
            );
        }

        existingAssignment.setTitle(
                updatedAssignment.getTitle()
        );

        existingAssignment.setDescription(
                updatedAssignment.getDescription()
        );

        existingAssignment.setDeadline(
                updatedAssignment.getDeadline()
        );

        existingAssignment.setStatus(
                updatedAssignment.getStatus()
        );

        return assignmentRepository.save(existingAssignment);
    }

    public Assignment updateAssignmentStatus(
            Long id,
            AssignmentStatus status) {

        Assignment assignment =
                assignmentRepository.findById(id)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Assignment not found with id: " + id
                                )
                        );

        assignment.setStatus(status);

        return assignmentRepository.save(assignment);
    }

    public void deleteAssignment(Long id) {

        if (!assignmentRepository.existsById(id)) {
            throw new IllegalArgumentException(
                    "Assignment not found with id: " + id
            );
        }

        assignmentRepository.deleteById(id);
    }
}