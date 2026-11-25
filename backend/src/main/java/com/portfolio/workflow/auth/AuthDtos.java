package com.portfolio.workflow.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.Instant;
import java.util.UUID;

public final class AuthDtos {
    private AuthDtos() {}

    public record Register(
        @NotBlank @Size(max = 120) String name,
        @NotBlank @Email @Size(max = 320) String email,
        @NotBlank @Size(min = 8, max = 72) String password
    ) {}

    public record Login(
        @NotBlank @Email @Size(max = 320) String email,
        @NotBlank @Size(min = 8, max = 72) String password
    ) {}

    public record UserView(UUID id, String name, String email, Instant createdAt) {
        public static UserView from(UserEntity user) {
            return new UserView(user.getId(), user.getName(), user.getEmail(), user.getCreatedAt());
        }
    }

    public record Response(String token, UserView user) {}
}
