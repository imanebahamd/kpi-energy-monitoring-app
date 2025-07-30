package org.ocp.kpi.kpienergybackend.controller;

import org.ocp.kpi.kpienergybackend.dto.UserDto;
import org.ocp.kpi.kpienergybackend.entity.Utilisateur;
import org.ocp.kpi.kpienergybackend.repository.UtilisateurRepository;
import org.ocp.kpi.kpienergybackend.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/users")
@PreAuthorize("hasRole('ADMIN')")
public class UserController {

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
}