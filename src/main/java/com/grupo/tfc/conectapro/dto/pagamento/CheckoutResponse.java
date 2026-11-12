package com.grupo.tfc.conectapro.dto.pagamento;

public record CheckoutResponse(
        String preferenceId,
        String redirectUrl
) {}
