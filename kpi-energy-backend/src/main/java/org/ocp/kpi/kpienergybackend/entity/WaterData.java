package org.ocp.kpi.kpienergybackend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "water_data")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WaterData {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private int year;
    private int month;

    private double f3bis;
    private double f3;
    private double se2;
    private double se3bis;

    @Column(name = "total_production", insertable = false, updatable = false)
    private Double totalProduction;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @ManyToOne
    @JoinColumn(name = "created_by", referencedColumnName = "id")
    private Utilisateur createdBy;

    @PrePersist
    public void onCreate() {
        createdAt = LocalDateTime.now();
    }

    @PreUpdate
    public void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}