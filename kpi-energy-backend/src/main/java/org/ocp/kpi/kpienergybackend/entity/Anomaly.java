package org.ocp.kpi.kpienergybackend.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
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

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @Column(nullable = false)
    private LocalDateTime detectedAt;

    private Boolean resolved = false;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime resolvedAt;

    private String resolvedBy;

    @PrePersist
    public void onCreate() {
        detectedAt = LocalDateTime.now();
    }
}