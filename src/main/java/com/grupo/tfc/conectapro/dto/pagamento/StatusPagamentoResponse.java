package com.grupo.tfc.conectapro.dto.pagamento;

import java.time.OffsetDateTime;

public record StatusPagamentoResponse(
        String status,
        OffsetDateTime assinaturaValidaAte,
        boolean reembolsoDisponivel
) {
}
