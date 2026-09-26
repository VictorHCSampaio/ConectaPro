package com.grupo.tfc.conectapro.service;

import com.grupo.tfc.conectapro.service.LocalizacaoService.Coordenada;
import com.grupo.tfc.conectapro.service.LocalizacaoService.EnderecoCep;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withResourceNotFound;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

class LocalizacaoServiceTest {

    private static final String PAULISTA = """
            {
              "cep": "01310100",
              "state": "SP",
              "city": "São Paulo",
              "neighborhood": "Bela Vista",
              "street": "Avenida Paulista",
              "location": {
                "type": "Point",
                "coordinates": { "longitude": "-46.6553299", "latitude": "-23.5617698" }
              }
            }
            """;

    private static final String SEM_COORDENADA = """
            {
              "cep": "29010000",
              "state": "ES",
              "city": "Vitória",
              "neighborhood": "Centro",
              "street": "Rua Sete",
              "location": { "type": "Point", "coordinates": {} }
            }
            """;

    private RestClient.Builder builder;
    private MockRestServiceServer servidor;
    private LocalizacaoService servico;

    @BeforeEach
    void preparar() {
        builder = RestClient.builder().baseUrl("https://brasilapi.test");
        servidor = MockRestServiceServer.bindTo(builder).build();
        servico = new LocalizacaoService(builder.build());
    }

    @Test
    void deveLerEnderecoECoordenadaDaResposta() {
        servidor.expect(requestTo("https://brasilapi.test/api/cep/v2/01310100"))
                .andRespond(withSuccess(PAULISTA, MediaType.APPLICATION_JSON));

        EnderecoCep endereco = servico.buscarEndereco("01310-100").orElseThrow();

        assertThat(endereco.street()).isEqualTo("Avenida Paulista");
        assertThat(endereco.neighborhood()).isEqualTo("Bela Vista");
        assertThat(endereco.city()).isEqualTo("São Paulo");
        assertThat(endereco.state()).isEqualTo("SP");
        assertThat(endereco.latitude()).isEqualTo(-23.5617698);
        assertThat(endereco.longitude()).isEqualTo(-46.6553299);
    }

    @Test
    void naoDeveConsultarApiQuandoCepNaoTemOitoDigitos() {
        assertThat(servico.buscarEndereco("123")).isEmpty();
        assertThat(servico.buscarEndereco(null)).isEmpty();

        servidor.verify();
    }

    @Test
    void deveDevolverEnderecoSemCoordenadaQuandoApiNaoTrazLocalizacao() {
        servidor.expect(requestTo("https://brasilapi.test/api/cep/v2/29010000"))
                .andRespond(withSuccess(SEM_COORDENADA, MediaType.APPLICATION_JSON));

        EnderecoCep endereco = servico.buscarEndereco("29010000").orElseThrow();

        assertThat(endereco.city()).isEqualTo("Vitória");
        assertThat(endereco.latitude()).isNull();
        assertThat(servico.buscarCoordenada("29010000")).isEmpty();
    }

    @Test
    void deveDevolverVazioQuandoApiFalha() {
        servidor.expect(requestTo("https://brasilapi.test/api/cep/v2/69900000"))
                .andRespond(withResourceNotFound());

        assertThat(servico.buscarEndereco("69900000")).isEmpty();
    }

    @Test
    void deveConsultarApiUmaVezPorCepGracasAoCache() {
        servidor.expect(requestTo("https://brasilapi.test/api/cep/v2/01310100"))
                .andRespond(withSuccess(PAULISTA, MediaType.APPLICATION_JSON));

        servico.buscarEndereco("01310100");
        servico.buscarEndereco("01310100");
        servico.buscarEndereco("01310-100");

        servidor.verify();
    }

    @Test
    void deveCalcularDistanciaEntreCoordenadas() {
        Coordenada paulista = new Coordenada(-23.5617698, -46.6553299);
        Coordenada florianopolis = new Coordenada(-27.59667, -48.54917);

        assertThat(servico.distanciaEmKm(paulista, florianopolis)).isEqualTo(487.2);
        assertThat(servico.distanciaEmKm(paulista, paulista)).isEqualTo(0.0);
    }

    @Test
    void deveDevolverDistanciaNulaQuandoFaltaCoordenada() {
        Coordenada paulista = new Coordenada(-23.5617698, -46.6553299);

        assertThat(servico.distanciaEmKm(null, paulista)).isNull();
        assertThat(servico.distanciaEmKm(paulista, null)).isNull();
    }

    @Test
    void deveManterApenasOsDigitosDoCep() {
        assertThat(servico.apenasDigitos("01310-100")).isEqualTo("01310100");
        assertThat(servico.apenasDigitos(null)).isEmpty();
    }

    @Test
    void deveIgnorarCoordenadaComValorInvalido() {
        servidor.expect(requestTo("https://brasilapi.test/api/cep/v2/01310100"))
                .andRespond(withSuccess(PAULISTA.replace("-23.5617698", "abc"), MediaType.APPLICATION_JSON));

        Optional<EnderecoCep> endereco = servico.buscarEndereco("01310100");

        assertThat(endereco).isPresent();
        assertThat(endereco.get().latitude()).isNull();
    }
}
