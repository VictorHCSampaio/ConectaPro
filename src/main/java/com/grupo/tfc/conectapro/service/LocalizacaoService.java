package com.grupo.tfc.conectapro.service;

import com.grupo.tfc.conectapro.dto.integracao.BrasilApiCepResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class LocalizacaoService {

    private static final Logger logger = LoggerFactory.getLogger(LocalizacaoService.class);

    private static final double RAIO_TERRA_KM = 6371.0088;
    private static final int TAMANHO_CEP = 8;

    private final RestClient restClient;
    private final Map<String, EnderecoCep> cache = new ConcurrentHashMap<>();

    public LocalizacaoService(RestClient cepRestClient) {
        this.restClient = cepRestClient;
    }

    public Optional<EnderecoCep> buscarEndereco(String cep) {
        String digitos = apenasDigitos(cep);
        if (digitos.length() != TAMANHO_CEP) {
            return Optional.empty();
        }

        EnderecoCep emCache = cache.get(digitos);
        if (emCache != null) {
            return Optional.of(emCache);
        }

        Optional<EnderecoCep> encontrado = consultar(digitos);
        encontrado.ifPresent(endereco -> cache.put(digitos, endereco));
        return encontrado;
    }

    public Optional<Coordenada> buscarCoordenada(String cep) {
        return buscarEndereco(cep)
                .filter(endereco -> endereco.latitude() != null && endereco.longitude() != null)
                .map(endereco -> new Coordenada(endereco.latitude(), endereco.longitude()));
    }

    public Double distanciaEmKm(Coordenada origem, Coordenada destino) {
        if (origem == null || destino == null) {
            return null;
        }

        double latOrigem = Math.toRadians(origem.latitude());
        double latDestino = Math.toRadians(destino.latitude());
        double deltaLat = latDestino - latOrigem;
        double deltaLon = Math.toRadians(destino.longitude() - origem.longitude());

        double a = Math.pow(Math.sin(deltaLat / 2), 2)
                + Math.cos(latOrigem) * Math.cos(latDestino) * Math.pow(Math.sin(deltaLon / 2), 2);
        double km = 2 * RAIO_TERRA_KM * Math.asin(Math.sqrt(a));

        return Math.round(km * 10) / 10d;
    }

    public String apenasDigitos(String cep) {
        return cep == null ? "" : cep.replaceAll("\\D", "");
    }

    private Optional<EnderecoCep> consultar(String cep) {
        try {
            BrasilApiCepResponse resposta = restClient.get()
                    .uri("/api/cep/v2/{cep}", cep)
                    .retrieve()
                    .body(BrasilApiCepResponse.class);

            if (resposta == null) {
                return Optional.empty();
            }

            Coordenada coordenada = extrairCoordenada(resposta);
            if (coordenada == null) {
                logger.warn("CEP sem coordenada disponivel. cep={}", cep);
            }

            return Optional.of(new EnderecoCep(
                    cep,
                    resposta.street(),
                    resposta.neighborhood(),
                    resposta.city(),
                    resposta.state(),
                    coordenada == null ? null : coordenada.latitude(),
                    coordenada == null ? null : coordenada.longitude()));
        } catch (RuntimeException exception) {
            logger.warn("Falha ao consultar o CEP {}. motivo={}", cep, exception.getMessage());
            return Optional.empty();
        }
    }

    private Coordenada extrairCoordenada(BrasilApiCepResponse resposta) {
        if (resposta.location() == null || resposta.location().coordinates() == null) {
            return null;
        }

        BrasilApiCepResponse.Coordenadas coordenadas = resposta.location().coordinates();
        if (coordenadas.latitude() == null || coordenadas.longitude() == null) {
            return null;
        }

        try {
            return new Coordenada(
                    Double.parseDouble(coordenadas.latitude()),
                    Double.parseDouble(coordenadas.longitude()));
        } catch (NumberFormatException exception) {
            logger.warn("Coordenada invalida retornada para o CEP {}", resposta.cep());
            return null;
        }
    }

    public record Coordenada(double latitude, double longitude) {
    }

    public record EnderecoCep(
            String cep,
            String street,
            String neighborhood,
            String city,
            String state,
            Double latitude,
            Double longitude
    ) {
    }
}
