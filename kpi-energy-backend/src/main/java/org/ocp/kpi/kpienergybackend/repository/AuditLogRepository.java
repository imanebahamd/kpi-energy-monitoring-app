package org.ocp.kpi.kpienergybackend.repository;

import org.ocp.kpi.kpienergybackend.entity.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    Page<AuditLog> findAllByOrderByActionTimestampDesc(Pageable pageable);

    Page<AuditLog> findByActionContainingAndTableNameContainingAndUserEmailContainingAndActionTimestampBetweenOrderByActionTimestampDesc(
            String action,
            String tableName,
            String userEmail,
            LocalDateTime startDate,
            LocalDateTime endDate,
            Pageable pageable);
}