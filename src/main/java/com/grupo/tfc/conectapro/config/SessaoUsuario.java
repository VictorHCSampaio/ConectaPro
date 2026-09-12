package com.grupo.tfc.conectapro.config;

import jakarta.servlet.http.HttpSession;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

import static org.springframework.http.HttpStatus.UNAUTHORIZED;

public final class SessaoUsuario {

    public static final String ATRIBUTO = "usuario";

    private SessaoUsuario() {
    }

    public static UUID exigirUsuarioId(HttpSession session) {
        Object usuarioId = session == null ? null : session.getAttribute(ATRIBUTO);
        if (usuarioId instanceof UUID id) {
            return id;
        }
        throw new ResponseStatusException(UNAUTHORIZED, "Sessão expirada. Entre novamente.");
    }
}
