package org.ocp.kpi.kpienergybackend.service;

import lombok.RequiredArgsConstructor;
import org.ocp.kpi.kpienergybackend.dto.ChatbotRequest;
import org.ocp.kpi.kpienergybackend.dto.ChatbotResponse;
import org.ocp.kpi.kpienergybackend.entity.Anomaly;
import org.ocp.kpi.kpienergybackend.entity.AuditLog;
import org.ocp.kpi.kpienergybackend.entity.Utilisateur;
import org.ocp.kpi.kpienergybackend.repository.*;
import org.ocp.kpi.kpienergybackend.security.JwtTokenProvider;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatbotService {

    private final RestTemplate restTemplate;
    private final JwtTokenProvider tokenProvider;
    private final UtilisateurRepository utilisateurRepository;
    private final AnomalyRepository anomalyRepository;
    private final ElectricityDataRepository electricityRepo;
    private final WaterDataRepository waterRepo;
    private final AuditLogRepository auditLogRepository;
    private final PermissionService permissionService;

    private final String FLASK_SERVICE_URL = "http://localhost:5000/api";

    public ChatbotResponse processMessage(ChatbotRequest request, String authHeader) {
        try {
            // Extraire l'utilisateur du token
            String token = authHeader.substring(7);
            String username = tokenProvider.getUsernameFromJWT(token);
            Utilisateur user = utilisateurRepository.findByEmail(username)
                    .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

            boolean isAdmin = user.getRole().equals("ADMIN");

            // Appeler le service Flask
            Map<String, Object> flaskRequest = new HashMap<>();
            flaskRequest.put("sender", request.getSessionId());
            flaskRequest.put("message", request.getMessage());

            if (request.getContext() != null) {
                flaskRequest.put("context", request.getContext());
            }

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(flaskRequest, headers);

            ResponseEntity<Map> flaskResponse = restTemplate.postForEntity(
                    FLASK_SERVICE_URL + "/webhook/rest/webhook",
                    entity,
                    Map.class
            );

            // Traiter la réponse de Flask
            return processFlaskResponse(flaskResponse.getBody(), user, isAdmin);

        } catch (Exception e) {
            return createErrorResponse("Erreur lors du traitement du message: " + e.getMessage());
        }
    }

    private ChatbotResponse processFlaskResponse(Map<String, Object> flaskResponse,
                                                 Utilisateur user, boolean isAdmin) {

        // Extraire l'intention de la réponse Flask
        String intent = extractIntent(flaskResponse);

        switch (intent) {
            case "ask_anomalies_today":
                return handleAnomaliesToday(user, isAdmin);

            case "ask_water_anomalies":
                return handleWaterAnomalies(flaskResponse, user, isAdmin);

            case "ask_critical_anomalies":
                return handleCriticalAnomalies(flaskResponse, user, isAdmin);

            case "ask_user_activity":
                return handleUserActivity(flaskResponse, user, isAdmin);

            case "ask_data_modifications":
                return handleDataModifications(flaskResponse, user, isAdmin);

            case "ask_consumption_data":
                return handleConsumptionData(flaskResponse, user, isAdmin);

            case "ask_comparison":
                return handleComparison(flaskResponse, user, isAdmin);

            default:
                return handleDefaultResponse(flaskResponse);
        }
    }

    private ChatbotResponse handleAnomaliesToday(Utilisateur user, boolean isAdmin) {
        if (!permissionService.canAccessAnomalyDetails(user)) {
            return createErrorResponse("Désolé, seuls les administrateurs peuvent accéder aux informations sur les anomalies.");
        }

        LocalDate today = LocalDate.now();
        List<Anomaly> anomalies = anomalyRepository.findTodayAnomalies(today);

        Map<String, Object> data = new HashMap<>();
        data.put("anomalies", anomalies);
        data.put("count", anomalies.size());
        data.put("date", today.toString());

        return createDataResponse("Anomalies détectées aujourd'hui:", data);
    }

    private ChatbotResponse handleWaterAnomalies(Map<String, Object> flaskResponse,
                                                 Utilisateur user, boolean isAdmin) {
        if (!permissionService.canAccessAnomalyDetails(user)) {
            return createErrorResponse("Désolé, seuls les administrateurs peuvent accéder aux informations sur les anomalies.");
        }

        Map<String, Object> entities = extractEntities(flaskResponse);
        Integer month = (Integer) entities.get("month");
        Integer year = (Integer) entities.get("year");

        List<Anomaly> anomalies = anomalyRepository.findWaterAnomalies(month, year);

        Map<String, Object> data = new HashMap<>();
        data.put("anomalies", anomalies);
        data.put("count", anomalies.size());
        data.put("type", "WATER");
        if (month != null) data.put("month", month);
        if (year != null) data.put("year", year);

        return createDataResponse("Anomalies d'eau:", data);
    }

    private ChatbotResponse handleCriticalAnomalies(Map<String, Object> flaskResponse,
                                                    Utilisateur user, boolean isAdmin) {
        if (!permissionService.canAccessAnomalyDetails(user)) {
            return createErrorResponse("Désolé, seuls les administrateurs peuvent accéder aux informations sur les anomalies critiques.");
        }

        Map<String, Object> entities = extractEntities(flaskResponse);
        String period = (String) entities.getOrDefault("period", "week");

        LocalDateTime startDate = calculateStartDate(period);
        List<Anomaly> anomalies = anomalyRepository.findCriticalAnomaliesSince(startDate);

        Map<String, Object> data = new HashMap<>();
        data.put("anomalies", anomalies);
        data.put("count", anomalies.size());
        data.put("period", period);
        data.put("startDate", startDate.toString());

        return createDataResponse("Anomalies critiques:", data);
    }

    private ChatbotResponse handleUserActivity(Map<String, Object> flaskResponse,
                                               Utilisateur user, boolean isAdmin) {
        if (!permissionService.canAccessUserData(user, "user_activity")) {
            return createErrorResponse("Désolé, seuls les administrateurs peuvent accéder aux informations sur l'activité des utilisateurs.");
        }

        Map<String, Object> entities = extractEntities(flaskResponse);
        String period = (String) entities.getOrDefault("period", "month");

        LocalDateTime startDate = calculateStartDate(period);
        List<Object[]> userActivity = auditLogRepository.findUserActivity(startDate);

        // Convertir en liste de maps pour une meilleure sérialisation JSON
        List<Map<String, Object>> activityList = userActivity.stream()
                .map(activity -> {
                    Map<String, Object> activityMap = new HashMap<>();
                    activityMap.put("email", activity[0]);
                    activityMap.put("actionCount", activity[1]);
                    activityMap.put("lastAction", activity[2]);
                    return activityMap;
                })
                .collect(Collectors.toList());

        Map<String, Object> data = new HashMap<>();
        data.put("activity", activityList);
        data.put("period", period);
        data.put("startDate", startDate.toString());

        return createDataResponse("Activité des utilisateurs:", data);
    }

    private ChatbotResponse handleDataModifications(Map<String, Object> flaskResponse,
                                                    Utilisateur user, boolean isAdmin) {
        if (!permissionService.canAccessAuditLogs(user)) {
            return createErrorResponse("Désolé, seuls les administrateurs peuvent accéder aux historiques de modifications.");
        }

        Map<String, Object> entities = extractEntities(flaskResponse);
        String dataType = (String) entities.getOrDefault("data_type", "electricity");
        Integer days = (Integer) entities.getOrDefault("days", 7);

        LocalDateTime since = LocalDateTime.now().minusDays(days);
        List<AuditLog> modifications = auditLogRepository.findRecentModifications(dataType, since);

        Map<String, Object> data = new HashMap<>();
        data.put("modifications", modifications);
        data.put("dataType", dataType);
        data.put("days", days);
        data.put("since", since.toString());

        return createDataResponse("Dernières modifications:", data);
    }

    private ChatbotResponse handleConsumptionData(Map<String, Object> flaskResponse,
                                                  Utilisateur user, boolean isAdmin) {
        Map<String, Object> entities = extractEntities(flaskResponse);
        Integer month = (Integer) entities.get("month");
        Integer year = (Integer) entities.get("year");

        // Implémentez la logique pour récupérer les données de consommation
        Map<String, Object> consumptionData = getConsumptionData(month, year);

        return createDataResponse("Données de consommation:", consumptionData);
    }

    private ChatbotResponse handleComparison(Map<String, Object> flaskResponse,
                                             Utilisateur user, boolean isAdmin) {
        Map<String, Object> entities = extractEntities(flaskResponse);
        Integer year1 = (Integer) entities.get("year1");
        Integer year2 = (Integer) entities.get("year2");

        // Implémentez la logique de comparaison
        Map<String, Object> comparisonData = getComparisonData(year1, year2);

        return createDataResponse("Comparaison des données:", comparisonData);
    }

    private ChatbotResponse handleDefaultResponse(Map<String, Object> flaskResponse) {
        // Extraire la réponse textuelle de Flask
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> responses = (List<Map<String, Object>>) flaskResponse.get("responses");
        if (responses != null && !responses.isEmpty()) {
            String textResponse = (String) responses.get(0).get("text");
            return createTextResponse(textResponse != null ? textResponse : "Je n'ai pas compris votre demande.");
        }
        return createTextResponse("Je n'ai pas compris votre demande.");
    }

    // Méthodes helper
    private String extractIntent(Map<String, Object> flaskResponse) {
        // Implémentation pour extraire l'intention de la réponse Flask
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> responses = (List<Map<String, Object>>) flaskResponse.get("responses");
        if (responses != null && !responses.isEmpty()) {
            @SuppressWarnings("unchecked")
            Map<String, Object> response = responses.get(0);
            @SuppressWarnings("unchecked")
            Map<String, Object> metadata = (Map<String, Object>) response.get("metadata");
            if (metadata != null) {
                return (String) metadata.get("intent");
            }
        }
        return "default_intent";
    }

    private Map<String, Object> extractEntities(Map<String, Object> flaskResponse) {
        Map<String, Object> entities = new HashMap<>();

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> responses = (List<Map<String, Object>>) flaskResponse.get("responses");
        if (responses != null && !responses.isEmpty()) {
            @SuppressWarnings("unchecked")
            Map<String, Object> response = responses.get(0);
            @SuppressWarnings("unchecked")
            Map<String, Object> metadata = (Map<String, Object>) response.get("metadata");

            if (metadata != null) {
                @SuppressWarnings("unchecked")
                Map<String, Object> extractedEntities = (Map<String, Object>) metadata.get("entities");
                if (extractedEntities != null) {
                    entities.putAll(extractedEntities);
                }
            }
        }

        return entities;
    }

    private LocalDateTime calculateStartDate(String period) {
        if (period == null) {
            return LocalDateTime.now().minusMonths(1);
        }

        switch (period.toLowerCase()) {
            case "today":
                return LocalDateTime.now().withHour(0).withMinute(0).withSecond(0);
            case "yesterday":
                return LocalDateTime.now().minusDays(1).withHour(0).withMinute(0).withSecond(0);
            case "week":
                return LocalDateTime.now().minusWeeks(1);
            case "month":
                return LocalDateTime.now().minusMonths(1);
            default:
                return LocalDateTime.now().minusMonths(1);
        }
    }

    private Map<String, Object> getConsumptionData(Integer month, Integer year) {
        // Implémentez la logique pour récupérer les données de consommation
        Map<String, Object> data = new HashMap<>();
        // Exemple de données factices
        data.put("totalConsumption", 15000);
        data.put("averageConsumption", 1250);
        data.put("month", month);
        data.put("year", year);
        return data;
    }

    private Map<String, Object> getComparisonData(Integer year1, Integer year2) {
        // Implémentez la logique de comparaison
        Map<String, Object> data = new HashMap<>();
        // Exemple de données factices
        data.put("year1", year1);
        data.put("year2", year2);
        data.put("consumptionYear1", 12000);
        data.put("consumptionYear2", 15000);
        data.put("difference", 3000);
        data.put("percentageChange", 25.0);
        return data;
    }

    private ChatbotResponse createDataResponse(String message, Map<String, Object> data) {
        ChatbotResponse response = new ChatbotResponse();
        response.setResponse(message);
        response.setData(data);
        response.setType("data");
        return response;
    }

    private ChatbotResponse createTextResponse(String message) {
        ChatbotResponse response = new ChatbotResponse();
        response.setResponse(message);
        response.setType("text");
        return response;
    }

    private ChatbotResponse createErrorResponse(String errorMessage) {
        ChatbotResponse response = new ChatbotResponse();
        response.setResponse(errorMessage);
        response.setType("error");
        return response;
    }
}