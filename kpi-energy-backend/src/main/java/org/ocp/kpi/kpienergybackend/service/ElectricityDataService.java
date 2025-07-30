package org.ocp.kpi.kpienergybackend.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.ocp.kpi.kpienergybackend.dto.ElectricityDataDto;
import org.ocp.kpi.kpienergybackend.dto.ElectricitySummaryDto;
import org.ocp.kpi.kpienergybackend.entity.ElectricityData;
import org.ocp.kpi.kpienergybackend.entity.Utilisateur;
import org.ocp.kpi.kpienergybackend.repository.ElectricityDataRepository;
import org.ocp.kpi.kpienergybackend.repository.UtilisateurRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ElectricityDataService {
    private final ElectricityDataRepository electricityRepo;
    private final UtilisateurRepository utilisateurRepo;
    private final AuditService auditService;
    private final ObjectMapper objectMapper;

    private static final double COSPHI_LIMIT_60KV = 0.9;
    private static final double COSPHI_LIMIT_22KV = 0.8;

    public ElectricityData saveElectricityData(ElectricityDataDto dto) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Utilisateur currentUser = utilisateurRepo.findByEmail(auth.getName()).orElse(null);

        Optional<ElectricityData> existingDataOpt = electricityRepo.findByYearAndMonth(dto.getYear(), dto.getMonth());

        ElectricityData data;
        if (existingDataOpt.isPresent()) {
            data = existingDataOpt.get();
            data.setNetwork60kvActiveEnergy(dto.getNetwork60kvActiveEnergy());
            data.setNetwork60kvReactiveEnergy(dto.getNetwork60kvReactiveEnergy());
            data.setNetwork60kvPeak(dto.getNetwork60kvPeak());
            data.setNetwork22kvActiveEnergy(dto.getNetwork22kvActiveEnergy());
            data.setNetwork22kvReactiveEnergy(dto.getNetwork22kvReactiveEnergy());
            data.setNetwork22kvPeak(dto.getNetwork22kvPeak());
            data.setUpdatedAt(LocalDateTime.now());
        } else {
            data = ElectricityData.builder()
                    .year(dto.getYear())
                    .month(dto.getMonth())
                    .network60kvActiveEnergy(dto.getNetwork60kvActiveEnergy())
                    .network60kvReactiveEnergy(dto.getNetwork60kvReactiveEnergy())
                    .network60kvPeak(dto.getNetwork60kvPeak())
                    .network22kvActiveEnergy(dto.getNetwork22kvActiveEnergy())
                    .network22kvReactiveEnergy(dto.getNetwork22kvReactiveEnergy())
                    .network22kvPeak(dto.getNetwork22kvPeak())
                    .createdBy(currentUser)
                    .build();
        }

        ElectricityData saved = electricityRepo.save(data);

        // Audit logging
        try {
            if (existingDataOpt.isPresent()) {
                auditService.logAction("UPDATE", "electricity_data", saved.getId(),
                        objectMapper.writeValueAsString(existingDataOpt.get()),
                        objectMapper.writeValueAsString(saved));
            } else {
                auditService.logAction("CREATE", "electricity_data", saved.getId(),
                        null,
                        objectMapper.writeValueAsString(saved));
            }
        } catch (JsonProcessingException e) {
            e.printStackTrace();
        }

        return saved;
    }

    public Optional<ElectricityData> getDataByYearAndMonth(int year, int month) {
        return electricityRepo.findByYearAndMonth(year, month);
    }

    public Optional<ElectricitySummaryDto> getMonthlySummary(int year, int month) {
        return electricityRepo.findSummaryByYearAndMonth(year, month);
    }

    public List<ElectricitySummaryDto> getAnnualSummary(int year) {
        return electricityRepo.findAnnualSummary(year);
    }

    public Map<String, Double> getLimits() {
        return Map.of(
                "cosphi60kvMin", COSPHI_LIMIT_60KV,
                "cosphi60kvMax", 1.0,
                "cosphi22kvMin", COSPHI_LIMIT_22KV,
                "cosphi22kvMax", 1.0
        );
    }

    @Transactional
    public void deleteData(int year, int month) {
        Optional<ElectricityData> data = electricityRepo.findByYearAndMonth(year, month);
        if (data.isPresent()) {
            electricityRepo.delete(data.get());
            try {
                auditService.logAction("DELETE", "electricity_data", data.get().getId(),
                        objectMapper.writeValueAsString(data.get()),
                        null);
            } catch (JsonProcessingException e) {
                // Log l'erreur mais continue
                e.printStackTrace();
            }
        }
    }


}