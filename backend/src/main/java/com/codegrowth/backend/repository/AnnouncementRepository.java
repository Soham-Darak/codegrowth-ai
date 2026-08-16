package com.codegrowth.backend.repository;

import com.codegrowth.backend.entity.Announcement;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {
    List<Announcement> findAllByCourseIdOrderByCreatedAtDesc(Long courseId);
    List<Announcement> findAllByTeacherIdOrderByCreatedAtDesc(Long teacherId);
}
