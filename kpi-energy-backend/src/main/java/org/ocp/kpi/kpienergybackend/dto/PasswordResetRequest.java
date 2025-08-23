package org.ocp.kpi.kpienergybackend.dto;

import lombok.Getter;
import lombok.Setter;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;

@Setter
@Getter
public class PasswordResetRequest {
    // Getters et setters
    @NotBlank
    private String token;
    @NotBlank
    @Size(min = 6, max = 20)
    private String newPassword;

}