package org.ocp.kpi.kpienergybackend.repository;

import org.ocp.kpi.kpienergybackend.entity.Utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UtilisateurRepository extends JpaRepository<Utilisateur, Long> {
    Optional<Utilisateur> findByEmail(String email);
    Boolean existsByEmail(String email);
    Optional<Utilisateur> findByResetToken(String token);
}