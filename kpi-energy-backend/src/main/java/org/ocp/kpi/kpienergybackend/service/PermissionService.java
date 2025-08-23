package org.ocp.kpi.kpienergybackend.service;

import org.ocp.kpi.kpienergybackend.entity.Utilisateur;
import org.springframework.stereotype.Service;

@Service
public class PermissionService {

    public boolean canAccessUserData(Utilisateur currentUser, String requestedResource) {
        if (currentUser.getRole().equals("ADMIN")) {
            return true;
        }

        // Les USER ne peuvent accéder qu'à leurs propres données
        switch (requestedResource) {
            case "user_activity":
            case "audit_logs":
            case "user_stats":
                return false; // Réservé aux ADMIN
            default:
                return true;
        }
    }

    public boolean canAccessAnomalyDetails(Utilisateur currentUser) {
        return currentUser.getRole().equals("ADMIN");
    }

    public boolean canAccessAuditLogs(Utilisateur currentUser) {
        return currentUser.getRole().equals("ADMIN");
    }

    public boolean canAccessUserManagement(Utilisateur currentUser) {
        return currentUser.getRole().equals("ADMIN");
    }
}