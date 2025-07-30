package org.ocp.kpi.kpienergybackend.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.ocp.kpi.kpienergybackend.entity.AuditLog;
import org.ocp.kpi.kpienergybackend.entity.Utilisateur;
import org.ocp.kpi.kpienergybackend.repository.AuditLogRepository;
import org.ocp.kpi.kpienergybackend.repository.UtilisateurRepository;
import org.ocp.kpi.kpienergybackend.security.CustomUserDetails;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuditService {
    private final AuditLogRepository auditLogRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final ObjectMapper objectMapper;

    public void logAction(String action, String tableName, Long recordId,
                          String oldValues, String newValues) {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return;
        }

        CustomUserDetails userDetails = (CustomUserDetails) auth.getPrincipal();
        Utilisateur currentUser = utilisateurRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        HttpServletRequest request =
                ((ServletRequestAttributes) RequestContextHolder.currentRequestAttributes())
                        .getRequest();

        try {
            AuditLog log = AuditLog.builder()
                    .user(currentUser)
                    .action(action)
                    .tableName(tableName)
                    .recordId(recordId)
                    .oldValues(oldValues != null ? objectMapper.readTree(oldValues) : null)
                    .newValues(newValues != null ? objectMapper.readTree(newValues) : null)
                    .actionTimestamp(LocalDateTime.now())
                    .ipAddress(request.getRemoteAddr())
                    .build();

            auditLogRepository.save(log);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Erreur de conversion JSON", e);
        }
    }
}