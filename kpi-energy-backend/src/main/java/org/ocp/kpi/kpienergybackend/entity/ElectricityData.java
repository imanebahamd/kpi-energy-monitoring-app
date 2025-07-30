package org.ocp.kpi.kpienergybackend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "electricity_data")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ElectricityData {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private int year;
    private int month;

    // 60KV Network
    @Column(name = "network60kv_active_energy", nullable = false)
    private double network60kvActiveEnergy; // KWh

    @Column(name = "network60kv_reactive_energy", nullable = false)
    private double network60kvReactiveEnergy; // KVARh

    @Column(name = "network60kv_power_factor", nullable = false)
    private double network60kvPowerFactor;

    @Column(name = "network60kv_peak", nullable = false)
    private double network60kvPeak; // KW

    // 22KV Network
    @Column(name = "network22kv_active_energy", nullable = false)
    private double network22kvActiveEnergy; // KWh

    @Column(name = "network22kv_reactive_energy", nullable = false)
    private double network22kvReactiveEnergy; // KVARh

    @Column(name = "network22kv_power_factor", nullable = false)
    private double network22kvPowerFactor;

    @Column(name = "network22kv_peak", nullable = false)
    private double network22kvPeak; // KW

    @Column(name = "total_active_energy", insertable = false, updatable = false)
    private Double totalActiveEnergy;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    public void onCreate() {
        createdAt = LocalDateTime.now();
        calculatePowerFactors();
    }

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PreUpdate
    public void onUpdate() {
        updatedAt = LocalDateTime.now();
        calculatePowerFactors();
    }

    private void calculatePowerFactors() {
        // Calculate power factor for 60KV
        if (network60kvActiveEnergy != 0) {
            double tanPhi = network60kvReactiveEnergy / network60kvActiveEnergy;
            this.network60kvPowerFactor = Math.cos(Math.atan(tanPhi));
        } else {
            this.network60kvPowerFactor = 0;
        }

        // Calculate power factor for 22KV
        if (network22kvActiveEnergy != 0) {
            double tanPhi = network22kvReactiveEnergy / network22kvActiveEnergy;
            this.network22kvPowerFactor = Math.cos(Math.atan(tanPhi));
        } else {
            this.network22kvPowerFactor = 0;
        }
    }

    @ManyToOne
    @JoinColumn(name = "created_by", referencedColumnName = "id")
    private Utilisateur createdBy;
}