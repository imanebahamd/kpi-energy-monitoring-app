package org.ocp.kpi.kpienergybackend.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class ElectricitySummaryDto {
    private int year;
    private int month;
    private double network60kvPeak;
    private double network60kvPowerFactor;
    private double network60kvConsumption; // Renommé depuis ActiveEnergy
    private double network22kvPeak;
    private double network22kvPowerFactor;
    private double network22kvConsumption; // Renommé depuis ActiveEnergy

    // Constructeur modifié
    public ElectricitySummaryDto(int year, int month,
                                 double network60kvPeak, double network60kvPowerFactor,
                                 double network60kvConsumption,
                                 double network22kvPeak, double network22kvPowerFactor,
                                 double network22kvConsumption) {
        this.year = year;
        this.month = month;
        this.network60kvPeak = network60kvPeak;
        this.network60kvPowerFactor = network60kvPowerFactor;
        this.network60kvConsumption = network60kvConsumption;
        this.network22kvPeak = network22kvPeak;
        this.network22kvPowerFactor = network22kvPowerFactor;
        this.network22kvConsumption = network22kvConsumption;
    }
}