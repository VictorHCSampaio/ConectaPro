package com.grupo.tfc.conectapro.dto.professor;

import java.util.List;

/** Devolve o perfil salvo no mesmo formato que o formulario consome. */
public record PerfilProfessorResponse(
        String fullName,
        String phone,
        String bio,
        List<MateriaProfessorRequest> subjects,
        String teachingModel,
        String modality,
        Double pricePerHour,
        EnderecoProfessorRequest address,
        List<DisponibilidadeRequest> availability
) {
}
