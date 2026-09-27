package com.codegrowth.service;

import com.codegrowth.entity.Course;
import com.codegrowth.repository.CourseRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CourseService {

    private final CourseRepository courseRepository;

    public CourseService(CourseRepository courseRepository) {
        this.courseRepository = courseRepository;
    }

    public Course createCourse(Course course) {

        if (courseRepository.existsByCourseCode(course.getCourseCode())) {
            throw new IllegalArgumentException(
                    "A course with this course code already exists"
            );
        }

        return courseRepository.save(course);
    }

    public List<Course> getAllCourses() {
        return courseRepository.findAll();
    }

    public Optional<Course> getCourseById(Long id) {
        return courseRepository.findById(id);
    }

    public Optional<Course> getCourseByCode(String courseCode) {
        return courseRepository.findByCourseCode(courseCode);
    }

    public Course updateCourse(Long id, Course updatedCourse) {

        Course existingCourse = courseRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Course not found with id: " + id
                        )
                );

        if (!existingCourse.getCourseCode()
                .equals(updatedCourse.getCourseCode())
                && courseRepository.existsByCourseCode(
                updatedCourse.getCourseCode())) {

            throw new IllegalArgumentException(
                    "A course with this course code already exists"
            );
        }

        existingCourse.setCourseCode(
                updatedCourse.getCourseCode()
        );

        existingCourse.setName(
                updatedCourse.getName()
        );

        existingCourse.setDescription(
                updatedCourse.getDescription()
        );

        existingCourse.setTeacher(
                updatedCourse.getTeacher()
        );

        existingCourse.setStatus(
                updatedCourse.getStatus()
        );

        return courseRepository.save(existingCourse);
    }

    public void deleteCourse(Long id) {

        if (!courseRepository.existsById(id)) {
            throw new IllegalArgumentException(
                    "Course not found with id: " + id
            );
        }

        courseRepository.deleteById(id);
    }
}