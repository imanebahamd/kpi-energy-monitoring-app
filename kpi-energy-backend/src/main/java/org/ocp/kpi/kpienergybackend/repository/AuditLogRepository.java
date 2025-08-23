package org.ocp.kpi.kpienergybackend.repository;

import org.ocp.kpi.kpienergybackend.entity.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

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



    @Query("SELECT u.email, COUNT(al), MAX(al.actionTimestamp) " +
            "FROM AuditLog al JOIN al.user u " +
            "WHERE al.actionTimestamp >= :startDate " +
            "GROUP BY u.email ORDER BY COUNT(al) DESC")
    List<Object[]> findUserActivity(@Param("startDate") LocalDateTime startDate);

    @Query("SELECT al FROM AuditLog al WHERE al.tableName = :dataType " +
            "AND al.actionTimestamp >= :since ORDER BY al.actionTimestamp DESC")
    List<AuditLog> findRecentModifications(@Param("dataType") String dataType,
                                           @Param("since") LocalDateTime since);
}