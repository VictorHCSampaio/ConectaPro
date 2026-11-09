package com.grupo.tfc.conectapro.controller;

import com.grupo.tfc.conectapro.repository.UsuarioRepository;
import com.grupo.tfc.conectapro.service.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.web.client.RestClient;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.mock;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
class ResetSenhaIntegrationTest {

    @TestConfiguration
    static class MockMailConfig {
        @Bean
        @Primary
        public JavaMailSender javaMailSender() {
            JavaMailSender mock = mock(JavaMailSender.class);
            doNothing().when(mock).send(any(SimpleMailMessage.class));
            return mock;
        }
    }

    @LocalServerPort
    private int port;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private JwtService jwtService;

    private RestClient client;

    @BeforeEach
    void configurarCliente() {
        client = RestClient.builder()
                .baseUrl("http://localhost:" + port)
                .defaultStatusHandler(status -> true, (req, res) -> {})
                .build();
    }

    @Test
    void solicitarReset_emailExistente_deveRetornar200ComMensagemGenerica() {
        long ts = System.nanoTime();
        String email = "reset.exist" + ts + "@test.com";
        registrar(email);

        ResponseEntity<Map> r = client.post().uri("/auth/password-reset/request")
                .contentType(MediaType.APPLICATION_JSON)
                .body(Map.of("email", email))
                .retrieve().toEntity(Map.class);

        assertThat(r.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(r.getBody()).containsKey("message");
        assertThat(r.getBody().get("message").toString()).contains("receberá instruções");
    }

    @Test
    void solicitarReset_emailInexistente_deveRetornar200ComMesmaMensagem() {
        ResponseEntity<Map> r = client.post().uri("/auth/password-reset/request")
                .contentType(MediaType.APPLICATION_JSON)
                .body(Map.of("email", "naoexiste@test.com"))
                .retrieve().toEntity(Map.class);

        assertThat(r.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(r.getBody()).containsKey("message");
        assertThat(r.getBody().get("message").toString()).contains("receberá instruções");
    }

    @Test
    void confirmarReset_comTokenJwtValido_deveRedefinirSenhaEPermitirLogin() {
        long ts = System.nanoTime();
        String email = "reset.jwt" + ts + "@test.com";
        registrar(email);

        var usuario = usuarioRepository.findByEmail(email).orElseThrow();
        String token = jwtService.gerarPasswordResetToken(usuario.getId(), usuario.getSenhaHash(), 15);

        ResponseEntity<Map> r = client.post().uri("/auth/password-reset/confirm")
                .contentType(MediaType.APPLICATION_JSON)
                .body(Map.of("token", token, "novaSenha", "NovaSenha123"))
                .retrieve().toEntity(Map.class);

        assertThat(r.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(r.getBody().get("message").toString()).contains("Senha redefinida");

        ResponseEntity<Map> login = client.post().uri("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .body(Map.of("email", email, "senha", "NovaSenha123"))
                .retrieve().toEntity(Map.class);

        assertThat(login.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(login.getBody().get("status")).isEqualTo("AUTHENTICATED");
    }

    @Test
    void confirmarReset_tokenInvalido_deveRetornar400() {
        ResponseEntity<String> r = client.post().uri("/auth/password-reset/confirm")
                .contentType(MediaType.APPLICATION_JSON)
                .body(Map.of("token", "token-invalido-xyz", "novaSenha", "NovaSenha123"))
                .retrieve().toEntity(String.class);

        assertThat(r.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    void confirmarReset_tokenJaUsado_deveRetornar400() {
        long ts = System.nanoTime();
        String email = "reset.used" + ts + "@test.com";
        registrar(email);

        var usuario = usuarioRepository.findByEmail(email).orElseThrow();
        String token = jwtService.gerarPasswordResetToken(usuario.getId(), usuario.getSenhaHash(), 15);

        client.post().uri("/auth/password-reset/confirm")
                .contentType(MediaType.APPLICATION_JSON)
                .body(Map.of("token", token, "novaSenha", "NovaSenha123"))
                .retrieve().toEntity(Map.class);

        ResponseEntity<String> r2 = client.post().uri("/auth/password-reset/confirm")
                .contentType(MediaType.APPLICATION_JSON)
                .body(Map.of("token", token, "novaSenha", "OutraSenha456"))
                .retrieve().toEntity(String.class);

        assertThat(r2.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    void solicitarReset_semBody_deveRetornar400() {
        ResponseEntity<String> r = client.post().uri("/auth/password-reset/request")
                .contentType(MediaType.APPLICATION_JSON)
                .body("{}")
                .retrieve().toEntity(String.class);

        assertThat(r.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

    private void registrar(String email) {
        client.post().uri("/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .body(Map.of("nome", "Reset User", "email", email, "password", "Senh@12345"))
                .retrieve().toBodilessEntity();
    }
}