package com.grupo.tfc.conectapro.dto.professor;

import java.util.List;

public record ProfessorResumoResponse(
        String id,
        String name,
        String initials,
        String avatarUrl,
        List<String> subjects,
        double rating,
        int reviewCount,
        List<String> modalities,
        Double pricePerHour,
        boolean verified,
        String bio,
        List<String> availability,
        List<String> weekDays,
        String neighborhood,
        String city,
        Double distanceKm,
        String usuarioId
) {
}
