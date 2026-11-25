package com.portfolio.workflow.auth;

import jakarta.validation.Valid;
import java.net.URI;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService service;

    public AuthController(AuthService service) { this.service = service; }

    @PostMapping("/register")
    public ResponseEntity<AuthDtos.Response> register(@Valid @RequestBody AuthDtos.Register input) {
        return ResponseEntity.created(URI.create("/api/auth/me")).body(service.register(input));
    }

    @PostMapping("/login")
    public AuthDtos.Response login(@Valid @RequestBody AuthDtos.Login input) { return service.login(input); }
}
