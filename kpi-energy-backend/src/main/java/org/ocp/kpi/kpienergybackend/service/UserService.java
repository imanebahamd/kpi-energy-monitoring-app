package org.ocp.kpi.kpienergybackend.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.ocp.kpi.kpienergybackend.entity.Utilisateur;
import org.ocp.kpi.kpienergybackend.repository.UtilisateurRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UtilisateurRepository utilisateurRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditService auditService;
    private final ObjectMapper objectMapper;

    public Utilisateur createUser(Utilisateur utilisateur) {
        utilisateur.setId(null);
        utilisateur.setMotDePasse(encodePassword(utilisateur.getMotDePasse()));

        Utilisateur saved = utilisateurRepository.save(utilisateur);

        // Audit logging
        try {
            auditService.logAction("CREATE", "utilisateur", saved.getId(),
                    null,
                    objectMapper.writeValueAsString(saved));
        } catch (JsonProcessingException e) {
            e.printStackTrace();
        }

        return saved;
    }

    public String encodePassword(String password) {
        return passwordEncoder.encode(password);
    }

    public List<Utilisateur> findAllUsers() {
        return utilisateurRepository.findAll();
    }

    public Optional<Utilisateur> findUserById(Long id) {
        return utilisateurRepository.findById(id);
    }

    public Utilisateur updateUser(Utilisateur utilisateur) {
        Optional<Utilisateur> existingUser = utilisateurRepository.findById(utilisateur.getId());
        Utilisateur saved = utilisateurRepository.save(utilisateur);

        // Audit logging
        try {
            if (existingUser.isPresent()) {
                auditService.logAction("UPDATE", "utilisateur", saved.getId(),
                        objectMapper.writeValueAsString(existingUser.get()),
                        objectMapper.writeValueAsString(saved));
            }
        } catch (JsonProcessingException e) {
            e.printStackTrace();
        }

        return saved;
    }

    public void deleteUser(Long id) {
        Optional<Utilisateur> existingUser = utilisateurRepository.findById(id);
        if (existingUser.isPresent()) {
            // Audit logging before deletion
            try {
                auditService.logAction("DELETE", "utilisateur", id,
                        objectMapper.writeValueAsString(existingUser.get()),
                        null);
            } catch (JsonProcessingException e) {
                e.printStackTrace();
            }

            utilisateurRepository.deleteById(id);
        }
    }

    public Utilisateur toggleUserStatus(Long id) {
        Utilisateur user = utilisateurRepository.findById(id).orElseThrow();
        user.setActif(!user.getActif());

        Utilisateur saved = utilisateurRepository.save(user);

        // Audit logging
        try {
            auditService.logAction("UPDATE_STATUS", "utilisateur", saved.getId(),
                    String.valueOf(!saved.getActif()),
                    String.valueOf(saved.getActif()));
        } catch (Exception e) {
            e.printStackTrace();
        }

        return saved;
    }
}