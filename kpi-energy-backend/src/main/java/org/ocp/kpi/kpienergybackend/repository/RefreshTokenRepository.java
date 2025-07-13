package org.ocp.kpi.kpienergybackend.repository;

import org.ocp.kpi.kpienergybackend.entity.RefreshToken;
import org.ocp.kpi.kpienergybackend.entity.Utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    Optional<RefreshToken> findByToken(String token);
    Optional<RefreshToken> findByUtilisateur(Utilisateur utilisateur);
    void deleteByUtilisateur(Utilisateur utilisateur);
}