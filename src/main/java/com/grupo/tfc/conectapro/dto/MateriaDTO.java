package com.grupo.tfc.conectapro.dto;

public record MateriaDTO(
        Integer id,
        String nome,
        String descricao,
        String area,
        Boolean ativa
) {
}
