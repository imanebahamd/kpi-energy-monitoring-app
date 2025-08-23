package org.ocp.kpi.kpienergybackend.controller;

import org.ocp.kpi.kpienergybackend.dto.ChangePasswordDto;
import org.ocp.kpi.kpienergybackend.dto.UserDto;
import org.ocp.kpi.kpienergybackend.entity.Utilisateur;
import org.ocp.kpi.kpienergybackend.repository.UtilisateurRepository;
import org.ocp.kpi.kpienergybackend.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import lombok.extern.slf4j.Slf4j;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import jakarta.validation.Valid;


@RestController
@RequestMapping("/api/admin/users")
@PreAuthorize("hasRole('ADMIN')")
public class UserController {
    private static final Logger log = LoggerFactory.getLogger(UserController.class);
    private final UserService userService;
    private final UtilisateurRepository utilisateurRepository;

    public UserController(UserService userService, UtilisateurRepository utilisateurRepository) {
        this.userService = userService;
        this.utilisateurRepository = utilisateurRepository;
    }

    @GetMapping
    public List<UserDto> getAllUsers() {
        return utilisateurRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @PostMapping
    public ResponseEntity<UserDto> createUser(@RequestBody Utilisateur utilisateur) {
        Utilisateur createdUser = userService.createUser(utilisateur);
        return ResponseEntity.ok(convertToDto(createdUser));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserDto> updateUser(@PathVariable Long id, @RequestBody Utilisateur utilisateur) {
        return utilisateurRepository.findById(id)
                .map(existingUser -> {
                    existingUser.setNomComplet(utilisateur.getNomComplet());
                    existingUser.setEmail(utilisateur.getEmail());
                    existingUser.setRole(utilisateur.getRole());
                    existingUser.setActif(utilisateur.getActif());
                    existingUser.setTelephone(utilisateur.getTelephone());
                    existingUser.setDepartement(utilisateur.getDepartement());
                    existingUser.setFonction(utilisateur.getFonction());

                    if (utilisateur.getMotDePasse() != null && !utilisateur.getMotDePasse().isEmpty()) {
                        existingUser.setMotDePasse(userService.encodePassword(utilisateur.getMotDePasse()));
                    }

                    Utilisateur updatedUser = utilisateurRepository.save(existingUser);
                    return ResponseEntity.ok(convertToDto(updatedUser));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        utilisateurRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/toggle-status")
    public ResponseEntity<UserDto> toggleUserStatus(@PathVariable Long id) {
        return utilisateurRepository.findById(id)
                .map(user -> {
                    user.setActif(!user.getActif());
                    utilisateurRepository.save(user);
                    return ResponseEntity.ok(convertToDto(user));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    private UserDto convertToDto(Utilisateur utilisateur) {
        UserDto dto = new UserDto();
        dto.setId(utilisateur.getId());
        dto.setNomComplet(utilisateur.getNomComplet());
        dto.setEmail(utilisateur.getEmail());
        dto.setRole(utilisateur.getRole());
        dto.setActif(utilisateur.getActif());
        dto.setTelephone(utilisateur.getTelephone());
        dto.setDepartement(utilisateur.getDepartement());
        dto.setFonction(utilisateur.getFonction());
        return dto;
    }

    @PostMapping("/{id}/change-password")
    public ResponseEntity<?> changePassword(
            @PathVariable Long id,
            @Valid @RequestBody ChangePasswordDto changePasswordDto,
            BindingResult bindingResult) {

        log.info("Change password request received for user {}: {}", id, changePasswordDto);

        // Validation explicite
        if (bindingResult.hasErrors()) {
            Map<String, String> errors = new HashMap<>();
            bindingResult.getFieldErrors().forEach(error ->
                    errors.put(error.getField(), error.getDefaultMessage()));
            return ResponseEntity.badRequest().body(errors);
        }

        if (!changePasswordDto.getNewPassword().equals(changePasswordDto.getConfirmPassword())) {
            return ResponseEntity.badRequest().body("Les nouveaux mots de passe ne correspondent pas");
        }

        try {
            boolean success = userService.changePassword(id, changePasswordDto);
            if (!success) {
                return ResponseEntity.badRequest().body("Mot de passe actuel incorrect");
            }
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("Error changing password for user {}", id, e);
            return ResponseEntity.internalServerError().body("Erreur interne du serveur");
        }
    }
}