package org.ocp.kpi.kpienergybackend.dto;

import lombok.Data;

@Data
public class WaterDataDto {
    private int year;
    private int month;
    private double f3bis;
    private double f3;
    private double se2;
    private double se3bis;
}