package com.grupo.tfc.conectapro.dto.professor;

import java.util.List;

/** Professor cadastrado, no formato que o diretorio do frontend consome. */
public record ProfessorResumoResponse(
        String id,
        String name,
        String initials,
        List<String> subjects,
        double rating,
        int reviewCount,
        List<String> modalities,
        Double pricePerHour,
        boolean verified,
        String bio,
        List<String> availability,
        List<String> weekDays
) {
}
