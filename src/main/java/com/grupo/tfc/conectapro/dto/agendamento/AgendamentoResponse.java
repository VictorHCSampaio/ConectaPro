package com.grupo.tfc.conectapro.dto.agendamento;

import com.grupo.tfc.conectapro.model.StatusAgendamento;

import java.time.OffsetDateTime;
import java.util.UUID;

public record AgendamentoResponse(
        UUID id,
        UUID professorId,
        String professorName,
        String studentName,
        String day,
        String time,
        String modality,
        String subject,
        StatusAgendamento status,
        OffsetDateTime createdAt,
        UUID alunoUsuarioId,
        UUID professorUsuarioId
) {
}
