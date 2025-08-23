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

        // Récupère l'authentification actuelle
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        // Si pas d'authentification ou non authentifié, on ne log pas
        if (auth == null || !auth.isAuthenticated() || auth.getPrincipal() == null) {
            return;
        }

        // Gestion des différents types de principal
        Long userId = null;
        if (auth.getPrincipal() instanceof CustomUserDetails) {
            // Cas normal avec un utilisateur connecté
            CustomUserDetails userDetails = (CustomUserDetails) auth.getPrincipal();
            userId = userDetails.getId();
        } else if (auth.getPrincipal() instanceof String) {
            // Cas anonyme, on ne log pas
            return;
        }

        // Si on n'a pas pu récupérer un userId valide, on ne log pas
        if (userId == null) {
            return;
        }

        // Récupère l'utilisateur
        Utilisateur currentUser = utilisateurRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        // Récupère la requête HTTP
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