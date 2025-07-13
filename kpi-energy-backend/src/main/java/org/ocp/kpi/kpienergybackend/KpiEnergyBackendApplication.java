package org.ocp.kpi.kpienergybackend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EnableJpaRepositories(basePackages = "org.ocp.kpi.kpienergybackend.repository")
@EntityScan(basePackages = "org.ocp.kpi.kpienergybackend.entity")
public class KpiEnergyBackendApplication {
    public static void main(String[] args) {
        SpringApplication.run(KpiEnergyBackendApplication.class, args);
    }
}