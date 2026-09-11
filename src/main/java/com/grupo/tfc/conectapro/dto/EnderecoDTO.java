package com.grupo.tfc.conectapro.dto;

import java.util.UUID;

public record EnderecoDTO(
        UUID id,
        String logradouro,
        Long numero,
        String complemento,
        String bairro,
        String cidade,
        String estado,
        String cep,
        UUID usuarioId
) {
}
