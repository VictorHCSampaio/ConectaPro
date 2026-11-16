package com.grupo.tfc.conectapro.dto.professor;

import java.time.OffsetDateTime;

public record ProfessorPendenteResponse(
        String usuarioId,
        String nomeCompleto,
        String email,
        boolean certificadoEnviado,
        String certificadoNome,
        String justificativaSemCertificado,
        OffsetDateTime cadastradoEm
) {
}
