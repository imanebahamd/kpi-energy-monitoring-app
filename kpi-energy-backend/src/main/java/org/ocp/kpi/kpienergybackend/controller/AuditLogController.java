package org.ocp.kpi.kpienergybackend.controller;

import lombok.RequiredArgsConstructor;
import org.ocp.kpi.kpienergybackend.entity.AuditLog;
import org.ocp.kpi.kpienergybackend.repository.AuditLogRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

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

    @GetMapping("/user-activity")
    public ResponseEntity<Map<String, Object>> getUserActivity(
            @RequestParam(required = false) String period) {

        LocalDateTime startDate = calculateStartDate(period);
        List<Object[]> activity = auditLogRepository.findUserActivity(startDate);

        return ResponseEntity.ok(Map.of(
                "activity", activity,
                "period", period != null ? period : "month",
                "startDate", startDate.toString()
        ));
    }

    @GetMapping("/recent-modifications")
    public ResponseEntity<Map<String, Object>> getRecentModifications(
            @RequestParam String dataType,
            @RequestParam(required = false, defaultValue = "7") int days) {

        LocalDateTime since = LocalDateTime.now().minusDays(days);
        List<AuditLog> modifications = auditLogRepository.findRecentModifications(dataType, since);

        return ResponseEntity.ok(Map.of(
                "modifications", modifications,
                "dataType", dataType,
                "days", days
        ));
    }

    private LocalDateTime calculateStartDate(String period) {
        if (period == null) {
            return LocalDateTime.now().minusMonths(1);
        }

        switch (period.toLowerCase()) {
            case "today":
                return LocalDateTime.now().withHour(0).withMinute(0).withSecond(0);
            case "yesterday":
                return LocalDateTime.now().minusDays(1).withHour(0).withMinute(0).withSecond(0);
            case "week":
                return LocalDateTime.now().minusWeeks(1);
            case "month":
                return LocalDateTime.now().minusMonths(1);
            default:
                return LocalDateTime.now().minusMonths(1);
        }
    }
}