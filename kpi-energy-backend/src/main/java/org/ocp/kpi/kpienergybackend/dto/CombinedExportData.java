package org.ocp.kpi.kpienergybackend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CombinedExportData {
    private int year;
    private int month;
    private double electricity60KV;
    private double electricity22KV;
    private double waterF3bis;
    private double waterF3;
    private double waterSE2;
    private double waterSE3bis;
}