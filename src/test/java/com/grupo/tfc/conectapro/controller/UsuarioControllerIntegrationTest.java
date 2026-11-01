package com.grupo.tfc.conectapro.controller;

import com.grupo.tfc.conectapro.dto.auth.LoginRequest;
import com.grupo.tfc.conectapro.dto.auth.MensagemAutenticacaoResponse;
import com.grupo.tfc.conectapro.dto.auth.RegisterRequest;
import com.grupo.tfc.conectapro.dto.auth.TotpSetupResponse;
import com.grupo.tfc.conectapro.model.Usuario;
import com.grupo.tfc.conectapro.repository.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.client.RestClient;
import org.springframework.web.context.WebApplicationContext;

import static org.assertj.core.api.Assertions.assertThat;
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

    // Cenário 1 — Caminho Feliz: POST /auth/register persiste usuário no banco


    @Test
    void deveRetornar200ECriarUsuarioQuandoPayloadValido() throws Exception {
        // Arrange
        String payload = """
                {
                  "nome": "Usuário de Integração",
                  "email": "%s",
                  "password": "senha@123"
                }
                """.formatted(EMAIL_REGISTRO);

        // Act
        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))

                // Assert — resposta HTTP
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.secret").isNotEmpty())
                .andExpect(jsonPath("$.qrUri").isNotEmpty());

        // Assert — persistência no banco H2
        assertThat(usuarioRepository.findByEmail(EMAIL_REGISTRO)).isPresent();
    }


    // Cenário 2 — Erro 4xx: e-mail em branco dispara Bean Validation


    @Test
    void deveRetornarErroQuandoEmailInvalidoOuDuplicado() throws Exception {
        // Arrange
        String payloadEmailEmBranco = """
                {
                  "nome": "Usuário Inválido",
                  "email": "",
                  "password": "senha@123"
                }
                """;

        // Act + Assert
        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payloadEmailEmBranco))
                .andExpect(status().isBadRequest());
    }


    // Cenário 3 — Erro 4xx: e-mail já cadastrado dispara BAD_REQUEST


    @Test
    void registrar_comEmailDuplicado_deveRetornar400() throws Exception {
        // Arrange
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

        // Act + Assert
        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isBadRequest())
                .andExpect(status().reason("Email ja cadastrado"));
    }

    @Test
    void registrar_comDadosValidos_deveRetornar200EPersistir() {
        // Arrange
        String email = "teste" + System.nanoTime() + "@email.com";
        RegisterRequest payload = new RegisterRequest(
                "Usuario de Integracao",
                email,
                "senha@123",
                null
        );

        // Act
        ResponseEntity<TotpSetupResponse> resposta = restClient.post()
                .uri("/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .body(payload)
                .retrieve()
                .toEntity(TotpSetupResponse.class);

        // Assert
        assertThat(resposta.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(resposta.getBody()).isNotNull();
        assertThat(resposta.getBody().secret()).isNotNull();
        assertThat(resposta.getBody().qrUri()).isNotNull();
        assertThat(usuarioRepository.findByEmail(email)).isPresent();
    }

    @Test
    void login_comCredenciaisValidas_deveRetornar200EHeaderSetCookie() {
        // Arrange
        String email = "teste" + System.nanoTime() + "@email.com";
        String senha = "senha@123";
        registrarUsuarioParaTeste(email, senha);
        LoginRequest payload = new LoginRequest(email, senha);

        // Act
        ResponseEntity<MensagemAutenticacaoResponse> resposta = restClient.post()
                .uri("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .body(payload)
                .retrieve()
                .toEntity(MensagemAutenticacaoResponse.class);

        // Assert
        Usuario usuario = usuarioRepository.findByEmail(email).orElseThrow();
        assertThat(resposta.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(resposta.getBody()).isNotNull();
        assertThat(resposta.getBody().nomeCompleto()).isEqualTo(usuario.getNomeCompleto());
        assertThat(resposta.getBody().tipo()).isEqualTo(usuario.getTipo());
        assertThat(resposta.getBody().isAdmin()).isEqualTo(usuario.isAdmin());
        assertThat(resposta.getBody().message()).isEqualTo("Senha validada");
        assertThat(resposta.getHeaders().get(HttpHeaders.SET_COOKIE))
                .isNotNull()
                .isNotEmpty()
                .anyMatch(cookie -> cookie.contains("JSESSIONID"));
    }

    @Test
    void sessao_aposLogin_deveRetornar200() {
        // Arrange
        String email = "teste" + System.nanoTime() + "@email.com";
        String senha = "senha@123";
        registrarUsuarioParaTeste(email, senha);

        ResponseEntity<MensagemAutenticacaoResponse> login = restClient.post()
                .uri("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .body(new LoginRequest(email, senha))
                .retrieve()
                .toEntity(MensagemAutenticacaoResponse.class);
        String cookieValue = login.getHeaders().get(HttpHeaders.SET_COOKIE).getFirst();

        // Act
        ResponseEntity<MensagemAutenticacaoResponse> resposta = restClient.get()
                .uri("/auth/sessao")
                .header(HttpHeaders.COOKIE, cookieValue)
                .retrieve()
                .toEntity(MensagemAutenticacaoResponse.class);

        // Assert
        Usuario usuario = usuarioRepository.findByEmail(email).orElseThrow();
        assertThat(resposta.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(resposta.getBody()).isNotNull();
        assertThat(resposta.getBody().nomeCompleto()).isEqualTo(usuario.getNomeCompleto());
        assertThat(resposta.getBody().tipo()).isEqualTo(usuario.getTipo());
        assertThat(resposta.getBody().isAdmin()).isEqualTo(usuario.isAdmin());
        assertThat(resposta.getBody().message()).isEqualTo("Sessão ativa");
    }

    @Test
    void logout_aposLogin_deveRetornar204() {
        // Arrange
        String email = "teste" + System.nanoTime() + "@email.com";
        String senha = "senha@123";
        registrarUsuarioParaTeste(email, senha);

        ResponseEntity<MensagemAutenticacaoResponse> login = restClient.post()
                .uri("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .body(new LoginRequest(email, senha))
                .retrieve()
                .toEntity(MensagemAutenticacaoResponse.class);
        String cookieValue = login.getHeaders().get(HttpHeaders.SET_COOKIE).getFirst();

        // Act
        ResponseEntity<Void> resposta = restClient.post()
                .uri("/auth/logout")
                .header(HttpHeaders.COOKIE, cookieValue)
                .retrieve()
                .toEntity(Void.class);

        // Assert
        assertThat(resposta.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);
    }

    private void registrarUsuarioParaTeste(String email, String senha) {
        RegisterRequest payload = new RegisterRequest(
                "Usuario de Integracao",
                email,
                senha,
                null
        );

        ResponseEntity<TotpSetupResponse> resposta = restClient.post()
                .uri("/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .body(payload)
                .retrieve()
                .toEntity(TotpSetupResponse.class);

        assertThat(resposta.getStatusCode()).isEqualTo(HttpStatus.OK);
    }
}
