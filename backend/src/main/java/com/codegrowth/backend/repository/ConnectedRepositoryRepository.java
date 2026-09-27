package com.codegrowth.backend.repository;

import com.codegrowth.backend.entity.ConnectedRepository;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ConnectedRepositoryRepository extends JpaRepository<ConnectedRepository, Long> {
    List<ConnectedRepository> findAllByStudentIdOrderByConnectedAtDesc(Long studentId);
}
