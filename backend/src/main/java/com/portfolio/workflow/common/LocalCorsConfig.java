package com.portfolio.workflow.common;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class LocalCorsConfig {
    @Bean
    public WebMvcConfigurer corsConfigurer(@Value("${app.cors.allowed-origins:http://localhost:5173,http://127.0.0.1:5173}") String allowedOrigins) {
        String[] origins = java.util.Arrays.stream(allowedOrigins.split(","))
            .map(String::trim).filter(value -> !value.isBlank()).toArray(String[]::new);
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")
                    .allowedOrigins(origins)
                    .allowedMethods("GET", "POST", "PATCH", "OPTIONS")
                    .allowedHeaders("Authorization", "Content-Type")
                    .allowCredentials(false);
            }
        };
    }
}
