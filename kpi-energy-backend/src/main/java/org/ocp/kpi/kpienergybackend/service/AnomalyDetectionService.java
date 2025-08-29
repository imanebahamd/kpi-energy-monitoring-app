package org.ocp.kpi.kpienergybackend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.ocp.kpi.kpienergybackend.entity.Anomaly;
import org.ocp.kpi.kpienergybackend.entity.ElectricityData;
import org.ocp.kpi.kpienergybackend.entity.WaterData;
import org.ocp.kpi.kpienergybackend.repository.AnomalyRepository;
import org.ocp.kpi.kpienergybackend.repository.ElectricityDataRepository;
import org.ocp.kpi.kpienergybackend.repository.WaterDataRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AnomalyDetectionService {
    private final ElectricityDataRepository electricityRepo;
    private final WaterDataRepository waterRepo;
    private final AnomalyRepository anomalyRepo;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    // URL du service Python ML (à configurer dans application.properties)
    private final String mlServiceUrl = "http://localhost:5000";

    /**
     * Scanner toutes les données pour détecter les anomalies
     */
    @Scheduled(cron = "0 0 2 * * ?") // Exécution quotidienne à 2h du matin
    public void scanAllDataForAnomalies() {
        scanElectricityData();
        scanWaterData();
    }

    /**
     * Scanner les données électriques
     */
    public void scanElectricityData() {
        List<ElectricityData> allData = electricityRepo.findAll();

        for (ElectricityData data : allData) {
            // Préparer les données pour le modèle ML
            Map<String, Object> mlInput = new HashMap<>();
            mlInput.put("data_type", "electricity");
            mlInput.put("year", data.getYear());
            mlInput.put("month", data.getMonth());
            mlInput.put("network60kv_active_energy", data.getNetwork60kvActiveEnergy());
            mlInput.put("network60kv_reactive_energy", data.getNetwork60kvReactiveEnergy());
            mlInput.put("network60kv_peak", data.getNetwork60kvPeak());
            mlInput.put("network22kv_active_energy", data.getNetwork22kvActiveEnergy());
            mlInput.put("network22kv_reactive_energy", data.getNetwork22kvReactiveEnergy());
            mlInput.put("network22kv_peak", data.getNetwork22kvPeak());
            mlInput.put("network60kv_power_factor", data.getNetwork60kvPowerFactor());
            mlInput.put("network22kv_power_factor", data.getNetwork22kvPowerFactor());

            try {
                // Appeler le service ML
                Map<String, Object> response = restTemplate.postForObject(
                        mlServiceUrl + "/detect-anomaly",
                        mlInput,
                        Map.class
                );

                if (response != null && (Boolean) response.get("is_anomaly")) {
                    saveAnomaly("ELECTRICITY", data.getId(), data.getYear(), data.getMonth(),
                            response, "Détection automatique");
                }
            } catch (Exception e) {
                // Log l'erreur mais continue
                System.err.println("Erreur lors de la détection d'anomalie: " + e.getMessage());
            }
        }
    }

    /**
     * Scanner les données d'eau
     */
    public void scanWaterData() {
        List<WaterData> allData = waterRepo.findAll();

        for (WaterData data : allData) {
            Map<String, Object> mlInput = new HashMap<>();
            mlInput.put("data_type", "water");
            mlInput.put("year", data.getYear());
            mlInput.put("month", data.getMonth());
            mlInput.put("f3bis", data.getF3bis());
            mlInput.put("f3", data.getF3());
            mlInput.put("se2", data.getSe2());
            mlInput.put("se3bis", data.getSe3bis());

            try {
                Map<String, Object> response = restTemplate.postForObject(
                        mlServiceUrl + "/detect-anomaly",
                        mlInput,
                        Map.class
                );

                if (response != null && (Boolean) response.get("is_anomaly")) {
                    saveAnomaly("WATER", data.getId(), data.getYear(), data.getMonth(),
                            response, "Détection automatique");
                }
            } catch (Exception e) {
                System.err.println("Erreur lors de la détection d'anomalie: " + e.getMessage());
            }
        }
    }

    /**
     * Vérifier une seule donnée (pour validation en temps réel)
     */
    public boolean checkSingleDataPoint(String dataType, Map<String, Object> data) {
        try {
            Map<String, Object> response = restTemplate.postForObject(
                    mlServiceUrl + "/detect-anomaly",
                    data,
                    Map.class
            );

            return response != null && (Boolean) response.get("is_anomaly");
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Sauvegarder une anomalie détectée
     */
    private void saveAnomaly(String sourceType, Long sourceId, int year, int month,
                             Map<String, Object> mlResponse, String detectedBy) {
        // Vérifier si une anomalie similaire existe déjà
        List<Anomaly> existingAnomalies = anomalyRepo.findBySourceTypeAndSourceId(sourceType, sourceId);
        if (!existingAnomalies.isEmpty()) {
            return; // Anomalie déjà enregistrée
        }

        Anomaly anomaly = new Anomaly();
        anomaly.setSourceType(sourceType);
        anomaly.setSourceId(sourceId);
        anomaly.setYear(year);
        anomaly.setMonth(month);
        anomaly.setSeverityScore((Double) mlResponse.get("anomaly_score"));
        anomaly.setAnomalyType((String) mlResponse.get("anomaly_type"));

        // Générer une description basée sur le type d'anomalie
        String description = generateAnomalyDescription(sourceType, mlResponse);
        anomaly.setDescription(description);

        anomalyRepo.save(anomaly);
    }

    /**
     * Générer une description d'anomalie
     */
    private String generateAnomalyDescription(String sourceType, Map<String, Object> mlResponse) {
        String anomalyType = (String) mlResponse.get("anomaly_type");
        Double score = (Double) mlResponse.get("anomaly_score");

        switch (anomalyType) {
            case "DATA_ENTRY_ERROR":
                return String.format("Erreur de saisie suspectée (score: %.2f). " +
                        "Vérifiez les valeurs saisies.", score);
            case "CONSUMPTION_SPIKE":
                return String.format("Pic de consommation anormal détecté (score: %.2f). " +
                        "Vérifiez l'état des équipements.", score);
            case "WATER_LEAK":
                return String.format("Suspicion de fuite d'eau (score: %.2f). " +
                        "Inspection recommandée.", score);
            case "LOW_POWER_FACTOR":
                return String.format("Facteur de puissance anormalement bas (score: %.2f). " +
                        "Optimisation nécessaire.", score);
            case "PRODUCTION_ISSUE":
                return String.format("Problème de production détecté (score: %.2f). " +
                        "Vérification requise.", score);
            default:
                return String.format("Anomalie détectée (score: %.2f). Investigation recommandée.", score);
        }
    }

    /**
     * Marquer une anomalie comme résolue
     */
    public void resolveAnomaly(Long anomalyId, String resolvedBy, String resolutionNotes) {
        anomalyRepo.findById(anomalyId).ifPresent(anomaly -> {
            anomaly.setResolved(true);
            anomaly.setResolvedAt(LocalDateTime.now());
            anomaly.setResolvedBy(resolvedBy);
            if (resolutionNotes != null) {
                anomaly.setDescription(anomaly.getDescription() + " | Résolution: " + resolutionNotes);
            }
            anomalyRepo.save(anomaly);
        });
    }
}