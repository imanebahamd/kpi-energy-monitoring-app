package org.ocp.kpi.kpienergybackend.dto;

import lombok.Data;
import javax.validation.constraints.Min;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Max;


@Data
public class ElectricityDataDto {
    @NotNull(message = "L'année est obligatoire")
    @Min(value = 2000, message = "L'année doit être >= 2000")
    private int year;

    @NotNull(message = "Le mois est obligatoire")
    @Min(value = 1, message = "Le mois doit être entre 1 et 12")
    @Max(value = 12, message = "Le mois doit être entre 1 et 12")
    private int month;

    // 60KV Network
    @NotNull(message = "L'énergie active 60KV est obligatoire")
    @Min(value = 0, message = "L'énergie active doit être positive")
    private double network60kvActiveEnergy;

    @NotNull(message = "L'énergie réactive 60KV est obligatoire")
    @Min(value = 0, message = "L'énergie réactive doit être positive")
    private double network60kvReactiveEnergy;

    @NotNull(message = "La pointe 60KV est obligatoire")
    @Min(value = 0, message = "La pointe doit être positive")
    private double network60kvPeak;

    // 22KV Network
    @NotNull(message = "L'énergie active 22KV est obligatoire")
    @Min(value = 0, message = "L'énergie active doit être positive")
    private double network22kvActiveEnergy;

    @NotNull(message = "L'énergie réactive 22KV est obligatoire")
    @Min(value = 0, message = "L'énergie réactive doit être positive")
    private double network22kvReactiveEnergy;

    @NotNull(message = "La pointe 22KV est obligatoire")
    @Min(value = 0, message = "La pointe doit être positive")
    private double network22kvPeak;
}