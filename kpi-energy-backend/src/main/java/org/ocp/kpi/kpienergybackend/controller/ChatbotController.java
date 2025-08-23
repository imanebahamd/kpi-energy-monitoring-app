package org.ocp.kpi.kpienergybackend.controller;

import lombok.RequiredArgsConstructor;
import org.ocp.kpi.kpienergybackend.dto.ChatbotRequest;
import org.ocp.kpi.kpienergybackend.dto.ChatbotResponse;
import org.ocp.kpi.kpienergybackend.service.ChatbotService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chatbot")
@RequiredArgsConstructor
public class ChatbotController {

    private final ChatbotService chatbotService;

    @PostMapping("/message")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<ChatbotResponse> handleMessage(
            @RequestBody ChatbotRequest request,
            @RequestHeader("Authorization") String authHeader) {

        ChatbotResponse response = chatbotService.processMessage(request, authHeader);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/health")
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("Chatbot service is running");
    }
}