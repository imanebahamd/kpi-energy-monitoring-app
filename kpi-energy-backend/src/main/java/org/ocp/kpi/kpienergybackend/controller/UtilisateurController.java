package org.ocp.kpi.kpienergybackend.controller;

import org.ocp.kpi.kpienergybackend.entity.Utilisateur;
import org.ocp.kpi.kpienergybackend.repository.UtilisateurRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/utilisateurs")
public class UtilisateurController {

    private final UtilisateurRepository utilisateurRepository;
    //ajouter aussi
    private final PasswordEncoder passwordEncoder;

    public UtilisateurController(UtilisateurRepository utilisateurRepository , PasswordEncoder passwordEncoder) {
        this.utilisateurRepository = utilisateurRepository;
        this.passwordEncoder = passwordEncoder; // Ajoutez cette ligne

    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<Utilisateur> getAll() {
        return utilisateurRepository.findAll();
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Utilisateur create(@RequestBody Utilisateur utilisateur) {
        return utilisateurRepository.save(utilisateur);
    }

    // Endpoint spécial pour créer le premier admin (à désactiver après usage)
    @PostMapping("/create-first-admin")
    public ResponseEntity<String> createFirstAdmin() {
        // Vérifier si l'admin existe déjà
        if (utilisateurRepository.findByEmail("admin@kpi-energy.com").isPresent()) {
            return ResponseEntity.badRequest().body("L'admin existe déjà");
        }

        // Création de l'admin
        Utilisateur admin = new Utilisateur();
        admin.setNomComplet("Administrateur Système");
        admin.setEmail("admin@kpi-energy.com");
        admin.setMotDePasse(passwordEncoder.encode("Admin123@")); // Hash généré dynamiquement
        admin.setRole("ADMIN");
        admin.setActif(true);
        admin.setTelephone("+212611111111");
        admin.setDepartement("IT");
        admin.setFonction("Super Administrateur");

        utilisateurRepository.save(admin);

        return ResponseEntity.ok("Admin créé avec succès");
    }
}