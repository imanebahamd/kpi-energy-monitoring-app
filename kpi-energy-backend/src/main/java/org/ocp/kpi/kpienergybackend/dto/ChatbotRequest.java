package org.ocp.kpi.kpienergybackend.dto;

import lombok.Data;
import java.util.Map;

@Data
public class ChatbotRequest {
    private String message;
    private String sessionId;
    private Map<String, Object> context;
}