package com.grupo.tfc.conectapro.dto.auth;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.grupo.tfc.conectapro.model.TipoUsuario;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record LoginResponse(
        String status,
        String message,
        String token,
        String nomeCompleto,
        TipoUsuario tipo,
        Boolean isAdmin
) {
    public static LoginResponse totpRequired(String preAuthToken) {
        return new LoginResponse("TOTP_REQUIRED", "Senha validada. Envie o código 2FA.", preAuthToken, null, null, null);
    }

    public static LoginResponse authenticated(String token, String nomeCompleto, TipoUsuario tipo, boolean isAdmin) {
        return new LoginResponse("AUTHENTICATED", "Autenticação concluída com sucesso.", token, nomeCompleto, tipo, isAdmin);
    }
}
