package org.ocp.kpi.kpienergybackend.controller;

import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.ocp.kpi.kpienergybackend.service.ExportService;
import org.springframework.http.HttpHeaders;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@RestController
@RequestMapping("/api/reports/export")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200", exposedHeaders = HttpHeaders.CONTENT_DISPOSITION)
public class ExportController {

    private final ExportService exportService;

    private String generateFileName(String prefix, String extension, Integer year, Integer month) {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
        if (year != null && month != null) {
            return String.format("%s_%d_%d_%s.%s", prefix, year, month, timestamp, extension);
        } else if (year != null) {
            return String.format("%s_%d_%s.%s", prefix, year, timestamp, extension);
        }
        return String.format("%s_%s.%s", prefix, timestamp, extension);
    }

    @GetMapping("/electricity/csv")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public void exportElectricityToCSV(
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month,
            HttpServletResponse response) throws IOException {

        response.setContentType("text/csv");
        response.setHeader(HttpHeaders.CONTENT_DISPOSITION,
                "attachment; filename=" + generateFileName("electricity", "csv", year, month));

        exportService.exportElectricityToCSV(year, month, response);
    }

    @GetMapping("/water/csv")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public void exportWaterToCSV(
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month,
            HttpServletResponse response) throws IOException {

        response.setContentType("text/csv");
        response.setHeader(HttpHeaders.CONTENT_DISPOSITION,
                "attachment; filename=" + generateFileName("water", "csv", year, month));

        exportService.exportWaterToCSV(year, month, response);
    }

    @GetMapping("/combined/csv")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public void exportCombinedToCSV(
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month,
            HttpServletResponse response) throws IOException {

        response.setContentType("text/csv");
        response.setHeader(HttpHeaders.CONTENT_DISPOSITION,
                "attachment; filename=" + generateFileName("combined", "csv", year, month));

        exportService.exportCombinedToCSV(year, month, response);
    }
}