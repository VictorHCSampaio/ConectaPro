package com.grupo.tfc.conectapro.dto.auth;

import jakarta.validation.constraints.NotNull;

public record TotpVerificacaoRequest(@NotNull Integer code) {
}