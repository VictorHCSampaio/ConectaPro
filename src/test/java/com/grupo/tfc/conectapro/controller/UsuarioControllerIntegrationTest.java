package com.grupo.tfc.conectapro.controller;

import com.grupo.tfc.conectapro.dto.auth.LoginRequest;
import com.grupo.tfc.conectapro.dto.auth.LoginResponse;
import com.grupo.tfc.conectapro.dto.auth.RegisterRequest;
import com.grupo.tfc.conectapro.dto.auth.TotpConfiguracaoResponse;
import com.grupo.tfc.conectapro.repository.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.client.RestClient;
import org.springframework.web.context.WebApplicationContext;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
class UsuarioControllerIntegrationTest {

    private static final String EMAIL_REGISTRO = "integracao.register@conectapro.com";
    private static final String EMAIL_DUPLICADO = "integracao.duplicado@conectapro.com";

    @LocalServerPort
    private int port;

    @Autowired
    private WebApplicationContext webApplicationContext;

    @Autowired
    private UsuarioRepository usuarioRepository;

    private MockMvc mockMvc;

    private RestClient restClient;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .webAppContextSetup(webApplicationContext)
                .apply(springSecurity())
                .build();

        restClient = RestClient.builder()
                .baseUrl("http://localhost:" + port)
                .defaultStatusHandler(status -> true, (req, res) -> {})
                .build();

        usuarioRepository.findByEmail(EMAIL_REGISTRO)
                .ifPresent(usuarioRepository::delete);
        usuarioRepository.findByEmail(EMAIL_DUPLICADO)
                .ifPresent(usuarioRepository::delete);
    }

    @Test
    void deveRetornar200ECriarUsuarioQuandoPayloadValido() throws Exception {
        String payload = """
                {
                  "nome": "Usuário de Integração",
                  "email": "%s",
                  "password": "senha@123"
                }
                """.formatted(EMAIL_REGISTRO);

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.secret").isNotEmpty())
                .andExpect(jsonPath("$.qrUri").isNotEmpty());

        assertThat(usuarioRepository.findByEmail(EMAIL_REGISTRO)).isPresent();
    }

    @Test
    void deveRetornarErroQuandoEmailVazio() throws Exception {
        String payload = """
                {
                  "nome": "Usuário Inválido",
                  "email": "",
                  "password": "senha@123"
                }
                """;

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isBadRequest());
    }

    @Test
    void registrar_comEmailDuplicado_deveRetornar400() throws Exception {
        String payload = """
                {
                  "nome": "Usuário Duplicado",
                  "email": "%s",
                  "password": "senha@123"
                }
                """.formatted(EMAIL_DUPLICADO);

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk());

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isBadRequest());
    }

    @Test
    void registrar_comDadosValidos_deveRetornar200EPersistir() {
        String email = "teste" + System.nanoTime() + "@email.com";
        RegisterRequest payload = new RegisterRequest(
                "Usuario de Integracao",
                email,
                "senha@123",
                null
        );

        ResponseEntity<TotpConfiguracaoResponse> resposta = restClient.post()
                .uri("/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .body(payload)
                .retrieve()
                .toEntity(TotpConfiguracaoResponse.class);

        assertThat(resposta.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(resposta.getBody()).isNotNull();
        assertThat(resposta.getBody().secret()).isNotNull();
        assertThat(resposta.getBody().qrUri()).isNotNull();
        assertThat(usuarioRepository.findByEmail(email)).isPresent();
    }

    @Test
    void login_comCredenciaisValidas_deveRetornarTokenJwt() {
        String email = "teste" + System.nanoTime() + "@email.com";
        String senha = "senha@123";
        registrarUsuarioParaTeste(email, senha);
        LoginRequest payload = new LoginRequest(email, senha);

        ResponseEntity<LoginResponse> resposta = restClient.post()
                .uri("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .body(payload)
                .retrieve()
                .toEntity(LoginResponse.class);

        assertThat(resposta.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(resposta.getBody()).isNotNull();
        assertThat(resposta.getBody().status()).isEqualTo("AUTHENTICATED");
        assertThat(resposta.getBody().token()).isNotNull();
        assertThat(resposta.getBody().nomeCompleto()).isEqualTo("Usuario de Integracao");
    }

    @Test
    void me_semToken_deveRetornar401() {
        ResponseEntity<Void> resposta = restClient.get()
                .uri("/auth/me")
                .retrieve()
                .toEntity(Void.class);

        assertThat(resposta.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
    }

    @Test
    void logout_semToken_deveRetornar401() {
        ResponseEntity<Void> resposta = restClient.post()
                .uri("/auth/logout")
                .retrieve()
                .toEntity(Void.class);

        assertThat(resposta.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
    }

    private void registrarUsuarioParaTeste(String email, String senha) {
        RegisterRequest payload = new RegisterRequest(
                "Usuario de Integracao",
                email,
                senha,
                null
        );

        ResponseEntity<TotpConfiguracaoResponse> resposta = restClient.post()
                .uri("/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .body(payload)
                .retrieve()
                .toEntity(TotpConfiguracaoResponse.class);

        assertThat(resposta.getStatusCode()).isEqualTo(HttpStatus.OK);
    }
}
