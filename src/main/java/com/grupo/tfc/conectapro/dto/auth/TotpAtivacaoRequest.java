package com.grupo.tfc.conectapro.dto.auth;

import jakarta.validation.constraints.NotNull;

public record TotpAtivacaoRequest(@NotNull Integer totpCode) {
}