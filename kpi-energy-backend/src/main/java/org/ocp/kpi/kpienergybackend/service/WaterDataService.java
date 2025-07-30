package org.ocp.kpi.kpienergybackend.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.ocp.kpi.kpienergybackend.dto.WaterDataDto;
import org.ocp.kpi.kpienergybackend.entity.Utilisateur;
import org.ocp.kpi.kpienergybackend.entity.WaterData;
import org.ocp.kpi.kpienergybackend.repository.UtilisateurRepository;
import org.ocp.kpi.kpienergybackend.repository.WaterDataRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class WaterDataService {
    private final WaterDataRepository waterRepo;
    private final UtilisateurRepository utilisateurRepo;
    private final AuditService auditService;
    private final ObjectMapper objectMapper;

    @Transactional
    public WaterData saveWaterData(WaterDataDto dto) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Utilisateur currentUser = utilisateurRepo.findByEmail(auth.getName()).orElse(null);

        Optional<WaterData> existingData = waterRepo.findByYearAndMonth(dto.getYear(), dto.getMonth());

        WaterData data;
        if (existingData.isPresent()) {
            // Mise à jour de l'entrée existante
            data = existingData.get();
            data.setF3bis(dto.getF3bis());
            data.setF3(dto.getF3());
            data.setSe2(dto.getSe2());
            data.setSe3bis(dto.getSe3bis());
            data.setUpdatedAt(LocalDateTime.now());
        } else {
            // Création d'une nouvelle entrée
            data = WaterData.builder()
                    .year(dto.getYear())
                    .month(dto.getMonth())
                    .f3bis(dto.getF3bis())
                    .f3(dto.getF3())
                    .se2(dto.getSe2())
                    .se3bis(dto.getSe3bis())
                    .createdBy(currentUser)
                    .build();
        }

        WaterData saved = waterRepo.save(data);

        // Audit logging
        try {
            if (existingData.isPresent()) {
                auditService.logAction("UPDATE", "water_data", saved.getId(),
                        objectMapper.writeValueAsString(existingData.get()),
                        objectMapper.writeValueAsString(saved));
            } else {
                auditService.logAction("CREATE", "water_data", saved.getId(),
                        null,
                        objectMapper.writeValueAsString(saved));
            }
        } catch (JsonProcessingException e) {
            e.printStackTrace();
        }

        return saved;
    }

    public Optional<WaterData> getDataByYearAndMonth(int year, int month) {
        return waterRepo.findByYearAndMonth(year, month);
    }

    public List<WaterData> getMonthlyDataForYear(int year) {
        return waterRepo.findByYearOrderByMonthAsc(year);
    }

    public List<WaterData> getAnnualData(int startYear, int endYear) {
        return waterRepo.findByYearBetweenOrderByYearAscMonthAsc(startYear, endYear);
    }


    @Transactional
    public void deleteData(int year, int month) {
        Optional<WaterData> data = waterRepo.findByYearAndMonth(year, month);
        if (data.isPresent()) {
            waterRepo.delete(data.get());
            try {
                auditService.logAction("DELETE", "water_data", data.get().getId(),
                        objectMapper.writeValueAsString(data.get()),
                        null);
            } catch (JsonProcessingException e) {
                e.printStackTrace();
            }
        }
    }
}