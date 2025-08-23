package org.ocp.kpi.kpienergybackend.service;

import lombok.RequiredArgsConstructor;
import org.ocp.kpi.kpienergybackend.dto.LoginRequest;
import org.ocp.kpi.kpienergybackend.dto.LoginResponse;
import org.ocp.kpi.kpienergybackend.entity.Utilisateur;
import org.ocp.kpi.kpienergybackend.repository.UtilisateurRepository;
import org.ocp.kpi.kpienergybackend.security.CustomUserDetails;
import org.ocp.kpi.kpienergybackend.security.JwtTokenProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;


@Service
@RequiredArgsConstructor
public class AuthService {
    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final PasswordEncoder passwordEncoder; // Ajoutez ceci
    private final UtilisateurRepository utilisateurRepository; // Ajoutez ceci

    public LoginResponse authenticateUser(LoginRequest loginRequest) {
        try {
            logger.debug("Tentative de connexion pour: {}", loginRequest.getEmail());

            // 1. Recherche de l'utilisateur
            Optional<Utilisateur> userOpt = utilisateurRepository.findByEmail(loginRequest.getEmail());
            logger.debug("Utilisateur trouvé dans la base: {}", userOpt.isPresent());

            if (userOpt.isEmpty()) {
                logger.error("Aucun utilisateur trouvé pour email: {}", loginRequest.getEmail());
                // Liste tous les utilisateurs en base pour debug
                List<Utilisateur> allUsers = utilisateurRepository.findAll();
                logger.debug("Tous les utilisateurs en base: {}", allUsers);
                throw new BadCredentialsException("Email ou mot de passe incorrect");
            }

            Utilisateur utilisateur = userOpt.get();
            logger.debug("Utilisateur trouvé: {}", utilisateur);
            logger.debug("Mot de passe stocké (encodé): {}", utilisateur.getMotDePasse());

            // 2. Vérification manuelle du mot de passe
            boolean passwordMatch = passwordEncoder.matches(
                    loginRequest.getPassword(),
                    utilisateur.getMotDePasse()
            );

            logger.debug("Correspondance du mot de passe: {}", passwordMatch);

            if (!passwordMatch) {
                throw new BadCredentialsException("Email ou mot de passe incorrect");
            }

            // Si le mot de passe est bon, procédez avec l'authenticationManager
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getEmail(),
                            loginRequest.getPassword()
                    )
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();

            String jwt = tokenProvider.generateToken(authentication);

            logger.info("Connexion réussie pour l'utilisateur: {}", userDetails.getUsername());

            return new LoginResponse(
                    jwt,
                    "Bearer",
                    userDetails.getId(),
                    userDetails.getUsername(),
                    userDetails.getAuthorities().iterator().next().getAuthority(),
                    userDetails.getNomComplet()
            );
        } catch (Exception e) {
            logger.error("Échec de l'authentification pour l'email: {}", loginRequest.getEmail(), e);
            throw new BadCredentialsException("Email ou mot de passe incorrect");
        }
    }

    public String encodePassword(String password) {
        return passwordEncoder.encode(password);
    }
}