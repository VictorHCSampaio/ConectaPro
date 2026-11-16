package com.grupo.tfc.conectapro.dto.professor;

import java.util.List;

public record PerfilProfessorResponse(
        String fullName,
        String phone,
        String bio,
        String avatarUrl,
        List<MateriaProfessorRequest> subjects,
        String teachingModel,
        List<String> modalities,
        Double pricePerHour,
        EnderecoProfessorRequest address,
        List<DisponibilidadeRequest> availability,
        Integer advanceNoticeHours,
        boolean certificadoEnviado,
        String certificadoNome,
        String justificativaSemCertificado,
        boolean solicitarConversaAdmin,
        boolean verificado,
        String tipoVerificacao,
        boolean certificadoDisponivel,
        String statusComprovacao
) {
}
