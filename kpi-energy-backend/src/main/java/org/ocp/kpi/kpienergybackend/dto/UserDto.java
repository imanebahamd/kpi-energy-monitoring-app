package org.ocp.kpi.kpienergybackend.dto;

import io.micrometer.common.lang.Nullable;
import lombok.Data;

@Data
public class UserDto {
    @Nullable
    private Long id;
    private String nomComplet;
    private String email;
    private String role;
    private Boolean actif;
    private String telephone;
    private String departement;
    private String fonction;
}