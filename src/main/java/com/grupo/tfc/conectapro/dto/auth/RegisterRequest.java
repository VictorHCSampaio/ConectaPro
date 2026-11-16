package com.grupo.tfc.conectapro.dto.auth;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
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
        @Pattern(
                regexp = "^(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z0-9]).+$",
                message = "A senha deve ter ao menos uma letra maiuscula, um numero e um caractere especial"
        )
        String password,

        @JsonAlias({"tipo"})
        String role,

        @AssertTrue(message = "E necessario aceitar os Termos de Uso e a Politica de Privacidade")
        @JsonAlias({"acceptTerms"})
        boolean aceitouTermos
){
}
