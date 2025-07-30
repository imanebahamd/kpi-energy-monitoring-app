package org.ocp.kpi.kpienergybackend.repository;

import org.ocp.kpi.kpienergybackend.entity.WaterData;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface WaterDataRepository extends JpaRepository<WaterData, Long> {
    Optional<WaterData> findByYearAndMonth(int year, int month);

    List<WaterData> findByYearOrderByMonthAsc(int year);
    List<WaterData> findByYearBetweenOrderByYearAscMonthAsc(int startYear, int endYear);
}