package org.ocp.kpi.kpienergybackend.dto;

import lombok.Data;

@Data
public class UserDto {
    private Long id;
    private String nomComplet;
    private String email;
    private String role;
}