package com.grupo.tfc.conectapro.dto;

import java.util.UUID;

public record MateriaDTO(
        Integer id,
        String nome,
        String descricao,
        String nivel
) {
}
