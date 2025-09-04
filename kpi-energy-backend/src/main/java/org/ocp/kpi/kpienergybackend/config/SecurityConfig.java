package org.ocp.kpi.kpienergybackend.config;

import lombok.RequiredArgsConstructor;
import org.ocp.kpi.kpienergybackend.security.CustomUserDetailsService;
import org.ocp.kpi.kpienergybackend.security.JwtTokenProvider;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {
    private final JwtAuthenticationEntryPoint unauthorizedHandler;
    private final JwtTokenProvider tokenProvider;
    private final CustomUserDetailsService customUserDetailsService;


    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(AbstractHttpConfigurer::disable)
                .exceptionHandling(exception -> exception
                        .authenticationEntryPoint(unauthorizedHandler)
                )
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/api/auth/password/forgot").permitAll()
                        .requestMatchers("/api/auth/password/reset").permitAll()
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        // Endpoints des anomalies
                        .requestMatchers(HttpMethod.GET, "/api/anomalies").hasAnyRole("USER", "ADMIN") // Lecture pour tous les utilisateurs authentifiés
                        .requestMatchers(HttpMethod.GET, "/api/anomalies/stats").hasAnyRole("USER", "ADMIN") // Stats pour tous
                        .requestMatchers(HttpMethod.GET, "/api/anomalies/critical").hasRole("ADMIN") // Anomalies critiques réservées aux admin
                        .requestMatchers(HttpMethod.POST, "/api/anomalies/scan-now").hasRole("ADMIN") // Scan manuel réservé aux admin
                        .requestMatchers(HttpMethod.POST, "/api/anomalies/*/resolve").hasRole("ADMIN") // Résolution réservée aux admin
                        .requestMatchers(HttpMethod.POST, "/api/anomalies/validate-data").hasAnyRole("USER", "ADMIN")
                        .requestMatchers("/api/electricity/**").hasAnyRole("USER", "ADMIN")
                        .requestMatchers("/api/water/**").hasAnyRole("USER", "ADMIN")
                        .requestMatchers(
                                "/api/reports/**"
                        ).hasAnyRole("USER", "ADMIN")
                        .requestMatchers("/api/admin/audit/**").hasRole("ADMIN")
                        .requestMatchers("/api/user/**").hasAnyRole("USER", "ADMIN")
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthFilter(), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:4200"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setExposedHeaders(Arrays.asList("Content-Disposition"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public JwtAuthFilter jwtAuthFilter() {
        return new JwtAuthFilter(tokenProvider, customUserDetailsService); // Utilisation du service injecté
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}