package org.ocp.kpi.kpienergybackend.service;

import com.sendgrid.Method;
import com.sendgrid.Request;
import com.sendgrid.Response;
import com.sendgrid.SendGrid;
import com.sendgrid.helpers.mail.Mail;
import com.sendgrid.helpers.mail.objects.Content;
import com.sendgrid.helpers.mail.objects.Email;
import com.sendgrid.helpers.mail.objects.Personalization;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;

@Service
public class EmailService {
    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    @Value("${sendgrid.api.key}")
    private String sendGridApiKey;

    @Value("${sendgrid.sender.email}") // Doit être un email vérifié dans SendGrid
    private String senderEmail;

    @Value("${sendgrid.sender.name}") // Nouveau: Nom d'affichage
    private String senderName;

    @Value("${app.reset-password.url}")
    private String resetPasswordUrl;

    public void sendPasswordResetEmail(String toEmail, String resetToken) {
        // 1. Configuration de l'expéditeur avec nom d'affichage
        Email from = new Email(senderEmail, senderName);
        Email to = new Email(toEmail);
        String subject = "Réinitialisation de votre mot de passe EnergyTracker";

        // 2. Lien de réinitialisation
        String resetLink = resetPasswordUrl + "?token=" + resetToken;

        // 3. Contenu texte + HTML (améliore la délivrabilité)
        String textContent = "Bonjour,\n\n"
                + "Vous avez demandé une réinitialisation de mot de passe pour votre compte EnergyTracker.\n"
                + "Cliquez sur ce lien pour continuer : " + resetLink + "\n\n"
                + "Si vous n'avez pas fait cette demande, ignorez cet email.\n\n"
                + "Cordialement,\nL'équipe EnergyTracker";

        String htmlContent = "<!DOCTYPE html>"
                + "<html><body>"
                + "<p>Bonjour,</p>"
                + "<p>Vous avez demandé une réinitialisation de mot de passe pour votre compte EnergyTracker.</p>"
                + "<p><a href=\"" + resetLink + "\">Cliquez ici pour réinitialiser votre mot de passe</a></p>"
                + "<p>Si vous n'avez pas fait cette demande, ignorez cet email.</p>"
                + "<p>Cordialement,<br>L'équipe EnergyTracker</p>"
                + "</body></html>";

        Mail mail = new Mail();
        mail.setFrom(from);
        mail.setSubject(subject);
        mail.addContent(new Content("text/plain", textContent));
        mail.addContent(new Content("text/html", htmlContent));

        // 4. Personalisation pour améliorer la délivrabilité
        Personalization personalization = new Personalization();
        personalization.addTo(to);
        mail.addPersonalization(personalization);

        // 5. Configuration SendGrid
        SendGrid sg = new SendGrid(sendGridApiKey);
        Request request = new Request();

        try {
            request.setMethod(Method.POST);
            request.setEndpoint("mail/send");
            request.setBody(mail.build());

            // 6. Logs détaillés pour le débogage
            logger.info("Tentative d'envoi à: {}", toEmail);
            logger.debug("Contenu de l'email: {}", textContent);

            Response response = sg.api(request);

            logger.info("SendGrid Status Code: {}", response.getStatusCode());
            logger.debug("SendGrid Response Headers: {}", response.getHeaders());

            if (response.getStatusCode() >= 400) {
                logger.error("Erreur SendGrid - Code: {}, Body: {}",
                        response.getStatusCode(), response.getBody());
                throw new IOException("Erreur d'envoi: " + response.getBody());
            }

            logger.info("Email envoyé avec succès à {}", toEmail);
        } catch (IOException ex) {
            logger.error("Échec de l'envoi à {}: {}", toEmail, ex.getMessage());
            throw new RuntimeException("Échec de l'envoi de l'email. Veuillez réessayer.", ex);
        }
    }
}