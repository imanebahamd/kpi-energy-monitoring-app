package org.ocp.kpi.kpienergybackend.controller;

import org.ocp.kpi.kpienergybackend.dto.LoginRequest;
import org.ocp.kpi.kpienergybackend.dto.LoginResponse;
import org.ocp.kpi.kpienergybackend.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> authenticateUser(@RequestBody LoginRequest loginRequest) {
        return ResponseEntity.ok(authService.authenticateUser(loginRequest));
    }
}