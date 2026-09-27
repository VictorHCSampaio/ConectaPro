package com.grupo.tfc.conectapro.dto.auditoria;

import com.grupo.tfc.conectapro.model.AcaoAuditoria;

import java.time.OffsetDateTime;
import java.util.UUID;

public record AuditoriaLogResponse(
        UUID id,
        UUID usuarioId,
        AcaoAuditoria acao,
        String recurso,
        String recursoId,
        String detalhes,
        String ip,
        OffsetDateTime criadoEm
) {
}
