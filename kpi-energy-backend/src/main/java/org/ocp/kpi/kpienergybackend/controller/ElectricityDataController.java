package org.ocp.kpi.kpienergybackend.controller;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.ocp.kpi.kpienergybackend.dto.ElectricityDataDto;
import org.ocp.kpi.kpienergybackend.dto.ElectricitySummaryDto;
import org.ocp.kpi.kpienergybackend.entity.ElectricityData;
import org.ocp.kpi.kpienergybackend.service.ElectricityDataService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/electricity")
@RequiredArgsConstructor
public class ElectricityDataController {

    private final ElectricityDataService electricityService;

    @PostMapping
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<ElectricityData> saveData(@RequestBody ElectricityDataDto dto) {
        ElectricityData saved = electricityService.saveElectricityData(dto);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/{year}/{month}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<ElectricityData> getData(
            @PathVariable int year,
            @PathVariable int month
    ) {
        Optional<ElectricityData> data = electricityService.getDataByYearAndMonth(year, month);
        return data.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/summary/{year}/{month}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<ElectricitySummaryDto> getMonthlySummary(
            @PathVariable int year,
            @PathVariable int month) {
        Optional<ElectricitySummaryDto> summary = electricityService.getMonthlySummary(year, month);
        return summary.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/annual-summary/{year}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<List<ElectricitySummaryDto>> getAnnualSummary(
            @PathVariable int year) {
        List<ElectricitySummaryDto> summary = electricityService.getAnnualSummary(year);
        return ResponseEntity.ok(summary);
    }

    @GetMapping("/limits")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<Map<String, Double>> getLimits() {
        return ResponseEntity.ok(electricityService.getLimits());
    }

    @GetMapping("/{year}/{month}/edit")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<ElectricityDataDto> getDataForEdit(
            @PathVariable int year,
            @PathVariable int month
    ) {
        Optional<ElectricityData> data = electricityService.getDataByYearAndMonth(year, month);
        return data.map(d -> ResponseEntity.ok(convertToDto(d)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{year}/{month}")
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public ResponseEntity<Void> deleteData(
            @PathVariable int year,
            @PathVariable int month
    ) {
        electricityService.deleteData(year, month);
        return ResponseEntity.noContent().build();
    }

    private ElectricityDataDto convertToDto(ElectricityData data) {
        ElectricityDataDto dto = new ElectricityDataDto();
        dto.setYear(data.getYear());
        dto.setMonth(data.getMonth());
        dto.setNetwork60kvActiveEnergy(data.getNetwork60kvActiveEnergy());
        dto.setNetwork60kvReactiveEnergy(data.getNetwork60kvReactiveEnergy());
        dto.setNetwork60kvPeak(data.getNetwork60kvPeak());
        dto.setNetwork22kvActiveEnergy(data.getNetwork22kvActiveEnergy());
        dto.setNetwork22kvReactiveEnergy(data.getNetwork22kvReactiveEnergy());
        dto.setNetwork22kvPeak(data.getNetwork22kvPeak());
        return dto;
    }
}
