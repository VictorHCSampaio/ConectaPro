package com.grupo.tfc.conectapro.dto.auth;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest (
        @NotBlank
        @JsonAlias({"name"})
        String nome,
        @NotBlank
        @JsonAlias({"email"})
        String email,
        @NotBlank
        @JsonAlias({"senha"})
        @Size(min = 8, message = "Senha deve ter no minimo 8 caracteres")
        String password,

        @JsonAlias({"tipo"})
        String role
){
}
