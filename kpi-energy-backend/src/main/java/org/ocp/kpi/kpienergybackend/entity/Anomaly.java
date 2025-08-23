package org.ocp.kpi.kpienergybackend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "anomalies")
public class Anomaly {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String sourceType; // "ELECTRICITY" or "WATER"

    private Long sourceId; // ID de la donnée source

    @Column(nullable = false)
    private int year;

    @Column(nullable = false)
    private int month;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private String anomalyType; // "OUTLIER", "DATA_ENTRY_ERROR", "LEAK", etc.

    private Double severityScore; // 0-1

    @Column(nullable = false)
    private LocalDateTime detectedAt;

    private Boolean resolved = false;

    private LocalDateTime resolvedAt;

    private String resolvedBy;

    @PrePersist
    public void onCreate() {
        detectedAt = LocalDateTime.now();
    }
}