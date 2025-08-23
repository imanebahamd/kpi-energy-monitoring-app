package org.ocp.kpi.kpienergybackend.repository;

import org.ocp.kpi.kpienergybackend.entity.Anomaly;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AnomalyRepository extends JpaRepository<Anomaly, Long> {

    // Méthodes existantes
    List<Anomaly> findByResolvedFalseOrderByDetectedAtDesc();

    @Query("SELECT a FROM Anomaly a WHERE a.severityScore > :minScore AND a.resolved = false")
    List<Anomaly> findCriticalAnomalies(@Param("minScore") double minScore);

    Long countByResolvedFalse();

    // Méthodes pour le chatbot
    @Query("SELECT a FROM Anomaly a WHERE DATE(a.detectedAt) = :date")
    List<Anomaly> findByDetectedAtDate(@Param("date") LocalDate date);

    @Query("SELECT a FROM Anomaly a WHERE a.sourceType = 'WATER' " +
            "AND (:month IS NULL OR a.month = :month) " +
            "AND (:year IS NULL OR a.year = :year)")
    List<Anomaly> findWaterAnomalies(@Param("month") Integer month, @Param("year") Integer year);

    @Query("SELECT a FROM Anomaly a WHERE a.severityScore > 0.7 AND a.resolved = false " +
            "AND a.detectedAt >= :since")
    List<Anomaly> findCriticalAnomaliesSince(@Param("since") LocalDateTime since);

    // Méthodes pour les statistiques
    @Query("SELECT COUNT(a) FROM Anomaly a WHERE a.detectedAt >= :startDate AND a.resolved = false")
    Long countByDetectedAtAfterAndResolvedFalse(@Param("startDate") LocalDateTime startDate);

    @Query("SELECT COUNT(a) FROM Anomaly a WHERE a.severityScore > :minScore AND a.detectedAt >= :startDate")
    Long countBySeverityScoreGreaterThanAndDetectedAtAfter(
            @Param("minScore") double minScore,
            @Param("startDate") LocalDateTime startDate);

    // NOUVELLE MÉTHODE POUR AnomalyDetectionService
    List<Anomaly> findBySourceTypeAndSourceId(String sourceType, Long sourceId);

    @Query("SELECT a FROM Anomaly a WHERE DATE(a.detectedAt) = :date")
    List<Anomaly> findTodayAnomalies(@Param("date") LocalDate date);
}