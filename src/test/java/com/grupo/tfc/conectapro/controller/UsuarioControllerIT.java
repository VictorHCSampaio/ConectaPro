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
import org.springframework.web.client.RestClient;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
class UsuarioControllerIT {

    @LocalServerPort
    private int port;

    @Autowired
    private UsuarioRepository usuarioRepository;

    private RestClient restClient;

    @BeforeEach
    void setUp() {
        restClient = RestClient.builder()
                .baseUrl("http://localhost:" + port)
                .defaultStatusHandler(status -> true, (req, res) -> {})
                .build();
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
