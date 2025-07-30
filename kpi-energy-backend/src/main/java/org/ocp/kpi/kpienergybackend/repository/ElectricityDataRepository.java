package org.ocp.kpi.kpienergybackend.repository;

import jakarta.transaction.Transactional;
import org.ocp.kpi.kpienergybackend.dto.ElectricitySummaryDto;
import org.ocp.kpi.kpienergybackend.entity.ElectricityData;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ElectricityDataRepository extends JpaRepository<ElectricityData, Long> {
    Optional<ElectricityData> findByYearAndMonth(int year, int month);

    @Query("SELECT new org.ocp.kpi.kpienergybackend.dto.ElectricitySummaryDto(" +
            "e.year, e.month, " +
            "e.network60kvPeak, e.network60kvPowerFactor, " +
            "e.network60kvActiveEnergy, " +
            "e.network22kvPeak, e.network22kvPowerFactor, " +
            "e.network22kvActiveEnergy) " +
            "FROM ElectricityData e " +
            "WHERE e.year = :year AND e.month = :month")
    Optional<ElectricitySummaryDto> findSummaryByYearAndMonth(
            @Param("year") int year,
            @Param("month") int month);

    @Query("SELECT new org.ocp.kpi.kpienergybackend.dto.ElectricitySummaryDto(" +
            "e.year, e.month, " +
            "e.network60kvPeak, e.network60kvPowerFactor, " +
            "e.network60kvActiveEnergy, " +
            "e.network22kvPeak, e.network22kvPowerFactor, " +
            "e.network22kvActiveEnergy) " +
            "FROM ElectricityData e " +
            "WHERE e.year = :year")
    List<ElectricitySummaryDto> findAnnualSummary(@Param("year") int year);

    @Transactional
    void deleteByYearAndMonth(int year, int month);
}