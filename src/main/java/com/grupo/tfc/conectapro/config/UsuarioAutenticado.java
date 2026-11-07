package com.grupo.tfc.conectapro.config;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;
import java.util.UUID;

import static org.springframework.http.HttpStatus.UNAUTHORIZED;

public final class UsuarioAutenticado {

    private UsuarioAutenticado() {
    }

    public static UUID exigirUsuarioId() {
        return buscarUsuarioId()
                .orElseThrow(() -> new ResponseStatusException(UNAUTHORIZED, "Autenticação necessária. Faça login."));
    }

    public static Optional<UUID> buscarUsuarioId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return Optional.empty();
        }
        Object principal = authentication.getPrincipal();
        return principal instanceof UUID id ? Optional.of(id) : Optional.empty();
    }
}
