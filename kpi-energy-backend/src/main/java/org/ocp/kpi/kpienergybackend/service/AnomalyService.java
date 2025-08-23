package org.ocp.kpi.kpienergybackend.service;

import lombok.RequiredArgsConstructor;
import org.ocp.kpi.kpienergybackend.entity.Anomaly;
import org.ocp.kpi.kpienergybackend.repository.AnomalyRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AnomalyService {
    private final AnomalyRepository anomalyRepository;

    public List<Anomaly> getAllAnomalies() {
        return anomalyRepository.findAll();
    }

    public List<Anomaly> getActiveAnomalies() {
        return anomalyRepository.findByResolvedFalseOrderByDetectedAtDesc();
    }

    public List<Anomaly> getCriticalAnomalies(double minScore) {
        return anomalyRepository.findCriticalAnomalies(minScore);
    }

    public void resolveAnomaly(Long id, String resolvedBy, String notes) {
        anomalyRepository.findById(id).ifPresent(anomaly -> {
            anomaly.setResolved(true);
            anomaly.setResolvedBy(resolvedBy);
            if (notes != null) {
                anomaly.setDescription(anomaly.getDescription() + " | Résolution: " + notes);
            }
            anomalyRepository.save(anomaly);
        });
    }

    public Map<String, Object> getAnomalyStatistics() {
        Long totalActive = anomalyRepository.countByResolvedFalse();
        List<Anomaly> critical = getCriticalAnomalies(0.7);

        Map<String, Object> stats = new HashMap<>();
        stats.put("total_active_anomalies", totalActive);
        stats.put("critical_anomalies", critical.size());
        stats.put("last_detection", getLastAnomalyDate());

        return stats;
    }

    private String getLastAnomalyDate() {
        List<Anomaly> latest = anomalyRepository.findByResolvedFalseOrderByDetectedAtDesc();
        return latest.isEmpty() ? "Aucune" : latest.get(0).getDetectedAt().toString();
    }

    public List<Anomaly> getAnomaliesByDate(LocalDate date) {
        return anomalyRepository.findByDetectedAtDate(date);
    }

    public List<Anomaly> getWaterAnomalies(Integer month, Integer year) {
        return anomalyRepository.findWaterAnomalies(month, year);
    }

    public List<Anomaly> getCriticalAnomaliesSince(LocalDateTime since) {
        return anomalyRepository.findCriticalAnomaliesSince(since);
    }

    public Map<String, Object> getAnomalyStatisticsForPeriod(String period) {
        LocalDateTime startDate = calculateStartDate(period);
        Long total = anomalyRepository.countByDetectedAtAfterAndResolvedFalse(startDate);
        Long critical = anomalyRepository.countBySeverityScoreGreaterThanAndDetectedAtAfter(0.7, startDate);

        return Map.of(
                "total", total,
                "critical", critical,
                "period", period,
                "startDate", startDate.toString()
        );
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