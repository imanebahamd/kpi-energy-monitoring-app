package org.ocp.kpi.kpienergybackend.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "app")
@Data
public class AppConfig {
    private ResetPassword resetPassword = new ResetPassword();
    private Rasa rasa = new Rasa();
    private Chatbot chatbot = new Chatbot();

    @Data
    public static class ResetPassword {
        private int expiration = 24;
    }

    @Data
    public static class Rasa {
        private String serviceUrl = "http://localhost:5005";
        private String actionsUrl = "http://localhost:5055";
    }

    @Data
    public static class Chatbot {
        private int sessionTimeout = 3600;
        private int maxHistory = 50;
    }
}