package com.grupo.tfc.conectapro.dto;

import java.util.UUID;

public record MateriaDTO(
        UUID id,
        String nome,
        String descricao,
        String nivel
) {
}
