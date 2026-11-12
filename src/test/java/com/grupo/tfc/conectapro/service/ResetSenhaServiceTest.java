package com.grupo.tfc.conectapro.service;

import com.auth0.jwt.interfaces.DecodedJWT;
import com.grupo.tfc.conectapro.config.EmailProperties;
import com.grupo.tfc.conectapro.model.AcaoAuditoria;
import com.grupo.tfc.conectapro.model.Usuario;
import com.grupo.tfc.conectapro.repository.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ResetSenhaServiceTest {

    @Mock private UsuarioRepository usuarioRepository;
    @Mock private JwtService jwtService;
    @Mock private SenhaService senhaService;
    @Mock private EmailService emailService;
    @Mock private AuditoriaService auditoriaService;

    private ResetSenhaService resetSenhaService;

    private static final UUID USUARIO_ID = UUID.randomUUID();
    private static final String EMAIL = "user@test.com";
    private static final String SENHA_HASH = "$2a$10$hashExistente";

    @BeforeEach
    void setUp() {
        EmailProperties props = new EmailProperties(
                "noreply@test.com",
                new EmailProperties.ResetProperties("Reset", 15),
                "http://localhost:3000"
        );
        resetSenhaService = new ResetSenhaService(
                usuarioRepository, jwtService, senhaService,
                emailService, auditoriaService, props
        );
    }

    @Test
    void solicitarReset_emailExistente_deveGerarTokenJwtEEnviarEmail() {
        Usuario usuario = Usuario.builder().id(USUARIO_ID).email(EMAIL).nomeCompleto("Teste").senhaHash(SENHA_HASH).build();
        when(usuarioRepository.findByEmail(EMAIL)).thenReturn(Optional.of(usuario));
        when(jwtService.gerarPasswordResetToken(USUARIO_ID, SENHA_HASH, 15)).thenReturn("jwt-reset-token");

        resetSenhaService.solicitarReset(EMAIL);

        verify(jwtService).gerarPasswordResetToken(USUARIO_ID, SENHA_HASH, 15);
        verify(emailService).enviarEmailResetSenha(eq(EMAIL), eq("Teste"), contains("http://localhost:3000/reset-password?token=jwt-reset-token"));
        verify(auditoriaService).registrar(eq(AcaoAuditoria.RESET_SENHA_SOLICITADO), eq(USUARIO_ID), any(), any(), isNull());
    }

    @Test
    void solicitarReset_emailInexistente_naoDeveLancarExcecao() {
        when(usuarioRepository.findByEmail("inexistente@test.com")).thenReturn(Optional.empty());

        resetSenhaService.solicitarReset("inexistente@test.com");

        verify(jwtService, never()).gerarPasswordResetToken(any(), any(), anyLong());
        verify(emailService, never()).enviarEmailResetSenha(any(), any(), any());
    }

    @Test
    void confirmarReset_tokenValido_deveRedefinirSenha() {
        String token = criarTokenFalso(USUARIO_ID);
        Usuario usuario = Usuario.builder().id(USUARIO_ID).email(EMAIL).nomeCompleto("Teste").senhaHash(SENHA_HASH).build();
        DecodedJWT decodedJWT = mock(DecodedJWT.class);

        when(usuarioRepository.findById(USUARIO_ID)).thenReturn(Optional.of(usuario));
        when(jwtService.validarPasswordResetToken(token, SENHA_HASH)).thenReturn(decodedJWT);
        when(senhaService.senhaHash("NovaSenha123")).thenReturn("novoHash");

        resetSenhaService.confirmarReset(token, "NovaSenha123");

        assertThat(usuario.getSenhaHash()).isEqualTo("novoHash");
        verify(usuarioRepository).save(usuario);
        verify(auditoriaService).registrar(eq(AcaoAuditoria.RESET_SENHA_CONFIRMADO), eq(USUARIO_ID), any(), any(), isNull());
    }

    @Test
    void confirmarReset_tokenInvalidoOuExpirado_deveLancarExcecao() {
        String token = criarTokenFalso(USUARIO_ID);
        Usuario usuario = Usuario.builder().id(USUARIO_ID).email(EMAIL).senhaHash(SENHA_HASH).build();

        when(usuarioRepository.findById(USUARIO_ID)).thenReturn(Optional.of(usuario));
        when(jwtService.validarPasswordResetToken(token, SENHA_HASH)).thenReturn(null);

        assertThatThrownBy(() -> resetSenhaService.confirmarReset(token, "NovaSenha123"))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("inválido ou expirado");
    }

    @Test
    void confirmarReset_usuarioNaoExiste_deveLancarExcecao() {
        String token = criarTokenFalso(USUARIO_ID);

        when(usuarioRepository.findById(USUARIO_ID)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> resetSenhaService.confirmarReset(token, "NovaSenha123"))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("inválido");
    }

    @Test
    void confirmarReset_tokenMalFormado_deveLancarExcecao() {
        assertThatThrownBy(() -> resetSenhaService.confirmarReset("token-invalido", "NovaSenha123"))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("inválido");
    }

    private String criarTokenFalso(UUID userId) {
        String header = java.util.Base64.getUrlEncoder().withoutPadding()
                .encodeToString("{\"alg\":\"HS256\",\"typ\":\"JWT\"}".getBytes());
        String payload = java.util.Base64.getUrlEncoder().withoutPadding()
                .encodeToString(("{\"sub\":\"" + userId + "\",\"scope\":\"PASSWORD_RESET\"}").getBytes());
        return header + "." + payload + ".fake-signature";
    }
}