package org.ocp.kpi.kpienergybackend.dto;

import lombok.Data;
import java.util.Map;


@Data
public class ChatbotResponse {
    private String response;
    private Map<String, Object> data;
    private String type;
    private Map<String, Object> context;
}