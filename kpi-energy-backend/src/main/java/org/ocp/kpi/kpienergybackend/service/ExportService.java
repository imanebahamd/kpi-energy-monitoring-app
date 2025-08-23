package org.ocp.kpi.kpienergybackend.service;

import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.ocp.kpi.kpienergybackend.dto.CombinedExportData;
import org.ocp.kpi.kpienergybackend.dto.ElectricitySummaryDto;
import org.ocp.kpi.kpienergybackend.entity.WaterData;
import org.ocp.kpi.kpienergybackend.repository.ElectricityDataRepository;
import org.ocp.kpi.kpienergybackend.repository.WaterDataRepository;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ExportService {

    private final ElectricityDataRepository electricityRepo;
    private final WaterDataRepository waterRepo;

    public void exportElectricityToCSV(Integer year, Integer month, HttpServletResponse response) throws IOException {
        List<ElectricitySummaryDto> data = getElectricityData(year, month);

        response.setContentType("text/csv");
        response.setHeader("Content-Disposition", "attachment; filename=electricity_data.csv");

        // Write CSV header
        response.getWriter().println("Year,Month,60KV Peak,60KV Power Factor,60KV Consumption,22KV Peak,22KV Power Factor,22KV Consumption");

        // Write data
        for (ElectricitySummaryDto item : data) {
            response.getWriter().printf("%d,%d,%.2f,%.2f,%.2f,%.2f,%.2f,%.2f%n",
                    item.getYear(), item.getMonth(),
                    item.getNetwork60kvPeak(), item.getNetwork60kvPowerFactor(), item.getNetwork60kvConsumption(),
                    item.getNetwork22kvPeak(), item.getNetwork22kvPowerFactor(), item.getNetwork22kvConsumption());
        }
    }

    public void exportWaterToCSV(Integer year, Integer month, HttpServletResponse response) throws IOException {
        List<WaterData> data = getWaterData(year, month);

        response.setContentType("text/csv");
        response.setHeader("Content-Disposition", "attachment; filename=water_data.csv");

        // Write CSV header
        response.getWriter().println("Year,Month,F3bis,F3,SE2,SE3bis");

        // Write data
        for (WaterData item : data) {
            response.getWriter().printf("%d,%d,%.2f,%.2f,%.2f,%.2f%n",
                    item.getYear(), item.getMonth(),
                    item.getF3bis(), item.getF3(),
                    item.getSe2(), item.getSe3bis());
        }
    }

    public void exportCombinedToCSV(Integer year, Integer month, HttpServletResponse response) throws IOException {
        List<CombinedExportData> combinedData = getCombinedData(year, month);

        response.setContentType("text/csv");
        response.setHeader("Content-Disposition", "attachment; filename=combined_data.csv");

        // Write CSV header
        response.getWriter().println("Year,Month,60KV Consumption,22KV Consumption,Total Electricity,F3bis,F3,SE2,SE3bis,Total Water");

        // Write data
        for (CombinedExportData item : combinedData) {
            response.getWriter().printf("%d,%d,%.2f,%.2f,%.2f,%.2f,%.2f,%.2f,%.2f,%.2f%n",
                    item.getYear(), item.getMonth(),
                    item.getElectricity60KV(), item.getElectricity22KV(),
                    item.getElectricity60KV() + item.getElectricity22KV(),
                    item.getWaterF3bis(), item.getWaterF3(),
                    item.getWaterSE2(), item.getWaterSE3bis(),
                    item.getWaterF3bis() + item.getWaterF3() + item.getWaterSE2() + item.getWaterSE3bis());
        }
    }

    private List<ElectricitySummaryDto> getElectricityData(Integer year, Integer month) {
        if (year != null && month != null) {
            return electricityRepo.findAnnualSummary(year).stream()
                    .filter(d -> d.getMonth() == month)
                    .collect(Collectors.toList());
        } else if (year != null) {
            return electricityRepo.findAnnualSummary(year);
        } else {
            return electricityRepo.findAll().stream()
                    .map(d -> new ElectricitySummaryDto(
                            d.getYear(), d.getMonth(),
                            d.getNetwork60kvPeak(), calculatePowerFactor(d.getNetwork60kvActiveEnergy(), d.getNetwork60kvReactiveEnergy()),
                            d.getNetwork60kvActiveEnergy(),
                            d.getNetwork22kvPeak(), calculatePowerFactor(d.getNetwork22kvActiveEnergy(), d.getNetwork22kvReactiveEnergy()),
                            d.getNetwork22kvActiveEnergy()))
                    .collect(Collectors.toList());
        }
    }

    private List<WaterData> getWaterData(Integer year, Integer month) {
        if (year != null && month != null) {
            return waterRepo.findByYearAndMonth(year, month).stream().collect(Collectors.toList());
        } else if (year != null) {
            return waterRepo.findByYearOrderByMonthAsc(year);
        } else {
            return waterRepo.findAll();
        }
    }

    private List<CombinedExportData> getCombinedData(Integer year, Integer month) {
        List<ElectricitySummaryDto> electricityData = getElectricityData(year, month);
        List<WaterData> waterData = getWaterData(year, month);

        return electricityData.stream()
                .map(e -> {
                    WaterData water = waterData.stream()
                            .filter(w -> w.getYear() == e.getYear() && w.getMonth() == e.getMonth())
                            .findFirst()
                            .orElse(new WaterData());

                    return new CombinedExportData(
                            e.getYear(), e.getMonth(),
                            e.getNetwork60kvConsumption(), e.getNetwork22kvConsumption(),
                            water.getF3bis(), water.getF3(), water.getSe2(), water.getSe3bis()
                    );
                })
                .collect(Collectors.toList());
    }

    private double calculatePowerFactor(double activeEnergy, double reactiveEnergy) {
        double apparentEnergy = Math.sqrt(Math.pow(activeEnergy, 2) + Math.pow(reactiveEnergy, 2));
        return apparentEnergy > 0 ? activeEnergy / apparentEnergy : 0;
    }
}