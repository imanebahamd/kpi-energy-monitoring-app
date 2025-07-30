package org.ocp.kpi.kpienergybackend.controller;

import lombok.RequiredArgsConstructor;
import org.ocp.kpi.kpienergybackend.entity.AuditLog;
import org.ocp.kpi.kpienergybackend.repository.AuditLogRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/admin/audit")
@RequiredArgsConstructor
public class AuditLogController {
    private final AuditLogRepository auditLogRepository;

    @GetMapping
    public Page<AuditLog> getAuditLogs(Pageable pageable) {
        return auditLogRepository.findAllByOrderByActionTimestampDesc(pageable);
    }

    @GetMapping("/search")
    public Page<AuditLog> searchAuditLogs(
            @RequestParam(required = false) String action,
            @RequestParam(required = false) String tableName,
            @RequestParam(required = false) String userEmail,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            Pageable pageable) {

        LocalDateTime defaultStart = startDate != null ? startDate : LocalDateTime.now().minusYears(1);
        LocalDateTime defaultEnd = endDate != null ? endDate : LocalDateTime.now().plusDays(1);

        return auditLogRepository.findByActionContainingAndTableNameContainingAndUserEmailContainingAndActionTimestampBetweenOrderByActionTimestampDesc(
                action != null ? action : "",
                tableName != null ? tableName : "",
                userEmail != null ? userEmail : "",
                defaultStart,
                defaultEnd,
                pageable);
    }
}