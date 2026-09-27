package com.grupo.tfc.conectapro.dto.integracao;

public record BrasilApiCepResponse(
        String cep,
        String state,
        String city,
        String neighborhood,
        String street,
        Localizacao location
) {

    public record Localizacao(Coordenadas coordinates) {
    }

    public record Coordenadas(String latitude, String longitude) {
    }
}
