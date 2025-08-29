package org.ocp.kpi.kpienergybackend.controller;

import org.ocp.kpi.kpienergybackend.dto.ForgotPasswordRequest;
import org.ocp.kpi.kpienergybackend.dto.PasswordResetRequest;
import org.ocp.kpi.kpienergybackend.entity.Utilisateur;
import org.ocp.kpi.kpienergybackend.service.AuthService;
import org.ocp.kpi.kpienergybackend.service.EmailService;
import org.ocp.kpi.kpienergybackend.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.mail.MailException;
import javax.validation.Valid;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.ocp.kpi.kpienergybackend.security.CustomUserDetailsService.logger;

@RestController
@RequestMapping("/api/auth/password")
public class PasswordResetController {
    private static final Logger logger = LoggerFactory.getLogger(PasswordResetController.class);

    private final UserService userService;
    private final EmailService emailService;
    private final AuthService authService;

    public PasswordResetController(UserService userService,
                                   EmailService emailService,
                                   AuthService authService) {
        this.userService = userService;
        this.emailService = emailService;
        this.authService = authService;
    }

    @PostMapping("/forgot")
    public ResponseEntity<Map<String, String>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        try {
            logger.info("Demande de réinitialisation pour l'email: {}", request.getEmail());

            Optional<Utilisateur> userOpt = userService.findByEmail(request.getEmail());

            if (userOpt.isEmpty()) {
                logger.info("Email non trouvé: {}", request.getEmail());
                return ResponseEntity.ok()
                        .body(Map.of("message", "Cet email ne correspond à aucun compte existant"));
            }

            Utilisateur user = userOpt.get();
            String token = UUID.randomUUID().toString();
            user.setResetToken(token);
            user.setResetTokenExpiry(LocalDateTime.now().plusHours(24));
            userService.updateUser(user);

            logger.info("Envoi d'email à: {}", user.getEmail());
            emailService.sendPasswordResetEmail(user.getEmail(), token);

            return ResponseEntity.ok()
                    .body(Map.of("message", "Un email de réinitialisation a été envoyé à l'adresse fournie"));

        } catch (Exception e) {
            logger.error("Erreur inattendue dans forgotPassword", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Une erreur s'est produite lors de l'envoi de l'email"));
        }
    }



    @PostMapping("/reset")
    public ResponseEntity<?> resetPassword(@RequestBody PasswordResetRequest request) {
        return userService.findByResetToken(request.getToken())
                .filter(user -> user.getResetTokenExpiry().isAfter(LocalDateTime.now()))
                .map(user -> {
                    user.setMotDePasse(authService.encodePassword(request.getNewPassword()));
                    user.setResetToken(null);
                    user.setResetTokenExpiry(null);
                    userService.updateUser(user);
                    return ResponseEntity.ok("Mot de passe réinitialisé");
                })
                .orElse(ResponseEntity.badRequest().body("Token invalide ou expiré"));
    }
}