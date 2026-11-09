package com.grupo.tfc.conectapro.dto.professor;

import java.util.List;

public record PerfilProfessorResponse(
        String fullName,
        String phone,
        String bio,
        List<MateriaProfessorRequest> subjects,
        String teachingModel,
        List<String> modalities,
        Double pricePerHour,
        EnderecoProfessorRequest address,
        List<DisponibilidadeRequest> availability
) {
}
