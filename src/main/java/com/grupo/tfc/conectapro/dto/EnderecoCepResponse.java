package com.grupo.tfc.conectapro.dto;

public record EnderecoCepResponse(
        String cep,
        String street,
        String neighborhood,
        String city,
        String state
) {
}
