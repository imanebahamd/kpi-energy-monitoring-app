package org.ocp.kpi.kpienergybackend.controller;

import lombok.RequiredArgsConstructor;
import org.ocp.kpi.kpienergybackend.entity.Anomaly;
import org.ocp.kpi.kpienergybackend.service.AnomalyDetectionService;
import org.ocp.kpi.kpienergybackend.service.AnomalyService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/anomalies")
@RequiredArgsConstructor
public class AnomalyController {
    private final AnomalyService anomalyService;
    private final AnomalyDetectionService detectionService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<Anomaly> getAllAnomalies(@RequestParam(defaultValue = "false") boolean resolved) {
        return resolved ? anomalyService.getAllAnomalies() : anomalyService.getActiveAnomalies();
    }

    @GetMapping("/critical")
    @PreAuthorize("hasRole('ADMIN')")
    public List<Anomaly> getCriticalAnomalies() {
        return anomalyService.getCriticalAnomalies(0.7); // Seuil de sévérité
    }

    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN') or hasRole('USER')")
    public Map<String, Object> getAnomalyStats() {
        return anomalyService.getAnomalyStatistics();
    }

    @PostMapping("/{id}/resolve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> resolveAnomaly(
            @PathVariable Long id,
            @RequestBody Map<String, String> resolutionData) {

        String resolvedBy = resolutionData.get("resolvedBy");
        String notes = resolutionData.get("notes");

        anomalyService.resolveAnomaly(id, resolvedBy, notes);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/scan-now")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> triggerManualScan() {
        detectionService.scanAllDataForAnomalies();
        return ResponseEntity.ok("Scan des anomalies déclenché");
    }

    @PostMapping("/validate-data")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> validateDataPoint(
            @RequestBody Map<String, Object> data) {

        String dataType = (String) data.get("data_type");
        boolean isAnomaly = detectionService.checkSingleDataPoint(dataType, data);

        return ResponseEntity.ok(Map.of(
                "is_anomaly", isAnomaly,
                "message", isAnomaly ?
                        "Attention: Valeurs suspectes détectées. Vérifiez vos saisies." :
                        "Données valides"
        ));
    }
    @GetMapping("/today")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getTodayAnomalies() {
        LocalDate today = LocalDate.now();
        List<Anomaly> anomalies = anomalyService.getAnomaliesByDate(today);

        return ResponseEntity.ok(Map.of(
                "count", anomalies.size(),
                "anomalies", anomalies,
                "date", today.toString()
        ));
    }

    @GetMapping("/by-date")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getAnomaliesByDate(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        List<Anomaly> anomalies = anomalyService.getAnomaliesByDate(date);

        return ResponseEntity.ok(Map.of(
                "count", anomalies.size(),
                "anomalies", anomalies,
                "date", date.toString()
        ));
    }

    @GetMapping("/water")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getWaterAnomalies(
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year) {

        List<Anomaly> anomalies = anomalyService.getWaterAnomalies(month, year);

        return ResponseEntity.ok(Map.of(
                "count", anomalies.size(),
                "anomalies", anomalies,
                "type", "WATER"
        ));
    }
}