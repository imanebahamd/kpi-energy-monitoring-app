package org.ocp.kpi.kpienergybackend.service;

import lombok.RequiredArgsConstructor;
import org.ocp.kpi.kpienergybackend.dto.LoginRequest;
import org.ocp.kpi.kpienergybackend.dto.LoginResponse;
import org.ocp.kpi.kpienergybackend.entity.Utilisateur;
import org.ocp.kpi.kpienergybackend.repository.UtilisateurRepository;
import org.ocp.kpi.kpienergybackend.security.CustomUserDetails;
import org.ocp.kpi.kpienergybackend.security.JwtTokenProvider;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final AuthenticationManager authenticationManager;
    private final UtilisateurRepository utilisateurRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    public LoginResponse authenticateUser(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getEmail(),
                        loginRequest.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();

        String jwt = tokenProvider.generateToken(authentication);

        return new LoginResponse(
                jwt,
                "Bearer",
                userDetails.getId(),
                userDetails.getUsername(),
                userDetails.getAuthorities().iterator().next().getAuthority(),
                userDetails.getNomComplet()
        );

    }
}