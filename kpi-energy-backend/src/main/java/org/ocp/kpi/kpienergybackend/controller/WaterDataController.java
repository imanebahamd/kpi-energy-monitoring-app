package org.ocp.kpi.kpienergybackend.controller;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.ocp.kpi.kpienergybackend.dto.WaterDataDto;
import org.ocp.kpi.kpienergybackend.entity.WaterData;
import org.ocp.kpi.kpienergybackend.service.WaterDataService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/water")
@RequiredArgsConstructor
public class WaterDataController {

    private final WaterDataService waterService;

    @PostMapping
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<WaterData> saveData(@RequestBody WaterDataDto dto) {
        WaterData saved = waterService.saveWaterData(dto);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/{year}/{month}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<WaterData> getData(
            @PathVariable int year,
            @PathVariable int month
    ) {
        Optional<WaterData> data = waterService.getDataByYearAndMonth(year, month);
        return data.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }


    @GetMapping("/monthly/{year}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<List<WaterData>> getMonthlyDataForYear(@PathVariable int year) {
        List<WaterData> data = waterService.getMonthlyDataForYear(year);
        return ResponseEntity.ok(data);
    }

    @GetMapping("/annual/{startYear}/{endYear}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<List<WaterData>> getAnnualData(@PathVariable int startYear, @PathVariable int endYear) {
        List<WaterData> data = waterService.getAnnualData(startYear, endYear);
        return ResponseEntity.ok(data);
    }

    @DeleteMapping("/{year}/{month}")
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public ResponseEntity<Void> deleteData(
            @PathVariable int year,
            @PathVariable int month
    ) {
        waterService.deleteData(year, month);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{year}/{month}/edit")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<WaterDataDto> getDataForEdit(
            @PathVariable int year,
            @PathVariable int month
    ) {
        Optional<WaterData> data = waterService.getDataByYearAndMonth(year, month);
        return data.map(d -> ResponseEntity.ok(convertToDto(d)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    private WaterDataDto convertToDto(WaterData data) {
        WaterDataDto dto = new WaterDataDto();
        dto.setYear(data.getYear());
        dto.setMonth(data.getMonth());
        dto.setF3bis(data.getF3bis());
        dto.setF3(data.getF3());
        dto.setSe2(data.getSe2());
        dto.setSe3bis(data.getSe3bis());
        return dto;
    }


}