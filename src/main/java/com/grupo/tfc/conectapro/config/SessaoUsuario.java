package com.grupo.tfc.conectapro.config;

import jakarta.servlet.http.HttpSession;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;
import java.util.UUID;

import static org.springframework.http.HttpStatus.UNAUTHORIZED;

public final class SessaoUsuario {

    public static final String ATRIBUTO = "usuario";

    private SessaoUsuario() {
    }

    public static UUID exigirUsuarioId(HttpSession session) {
        return buscarUsuarioId(session)
                .orElseThrow(() -> new ResponseStatusException(UNAUTHORIZED, "Sessão expirada. Entre novamente."));
    }

    public static Optional<UUID> buscarUsuarioId(HttpSession session) {
        Object usuarioId = session == null ? null : session.getAttribute(ATRIBUTO);
        return usuarioId instanceof UUID id ? Optional.of(id) : Optional.empty();
    }
}
