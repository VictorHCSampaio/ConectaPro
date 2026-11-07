package com.grupo.tfc.conectapro.service;

import com.grupo.tfc.conectapro.dto.auth.LoginResponse;
import com.grupo.tfc.conectapro.model.AcaoAuditoria;
import com.grupo.tfc.conectapro.model.TipoUsuario;
import com.grupo.tfc.conectapro.model.Usuario;
import com.grupo.tfc.conectapro.repository.UsuarioRepository;
import com.auth0.jwt.interfaces.DecodedJWT;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.NullAndEmptySource;
import org.junit.jupiter.params.provider.ValueSource;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthenticationServiceTest {

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private TotpService totpService;

    @Mock
    private SenhaService senhaService;

    @Mock
    private AuditoriaService auditoriaService;

    @Mock
    private JwtService jwtService;

    private AuthenticationService authenticationService;

    private static final String EMAIL_VALIDO = "joao.silva@email.com";
    private static final String SENHA_CORRETA = "S3nh@Correta!";
    private static final String SENHA_HASH = "$2a$10$abcdefghijklmnopqrstuuVGnxyz1234567890abcdefghijk";
    private static final String FAKE_TOKEN = "eyJhbGciOiJIUzI1NiJ9.fake.token";
    private static final String FAKE_PRE_AUTH_TOKEN = "eyJhbGciOiJIUzI1NiJ9.preauth.token";

    private Usuario usuarioPadrao;

    @BeforeEach
    void setUp() {
        authenticationService = new AuthenticationService(
                usuarioRepository, totpService, senhaService, auditoriaService, jwtService
        );

        usuarioPadrao = Usuario.builder()
                .id(UUID.randomUUID())
                .nomeCompleto("João Silva")
                .email(EMAIL_VALIDO)
                .senhaHash(SENHA_HASH)
                .tipo(TipoUsuario.ALUNO)
                .build();
    }


    // Cenário 1 — Caminho Feliz


    @Test
    void deveRealizarLoginComSucesso() {
        // Arrange
        when(usuarioRepository.findByEmail(EMAIL_VALIDO)).thenReturn(Optional.of(usuarioPadrao));
        when(senhaService.match(SENHA_CORRETA, SENHA_HASH)).thenReturn(true);
        when(jwtService.gerarToken(usuarioPadrao.getId(), "ALUNO", false)).thenReturn(FAKE_TOKEN);

        // Act
        LoginResponse resultado = authenticationService.login(EMAIL_VALIDO, SENHA_CORRETA);

        // Assert
        assertThat(resultado.status()).isEqualTo("AUTHENTICATED");
        assertThat(resultado.nomeCompleto()).isEqualTo("João Silva");
        assertThat(resultado.tipo()).isEqualTo(TipoUsuario.ALUNO);
        assertThat(resultado.token()).isEqualTo(FAKE_TOKEN);
        verify(jwtService).gerarToken(usuarioPadrao.getId(), "ALUNO", false);
        verify(auditoriaService).registrar(
                eq(AcaoAuditoria.LOGIN_SUCESSO),
                eq(usuarioPadrao.getId()),
                eq("USUARIO"),
                eq(usuarioPadrao.getId().toString()),
                isNull()
        );
    }

    @Test
    void deveRetornarTotpRequiredQuandoTotpAtivo() {
        // Arrange
        usuarioPadrao.setTotpAtivo(true);
        usuarioPadrao.setSegredoTotp("JBSWY3DPEHPK3PXP");
        when(usuarioRepository.findByEmail(EMAIL_VALIDO)).thenReturn(Optional.of(usuarioPadrao));
        when(senhaService.match(SENHA_CORRETA, SENHA_HASH)).thenReturn(true);
        when(jwtService.gerarPreAuthToken(usuarioPadrao.getId())).thenReturn(FAKE_PRE_AUTH_TOKEN);

        // Act
        LoginResponse resultado = authenticationService.login(EMAIL_VALIDO, SENHA_CORRETA);

        // Assert
        assertThat(resultado.status()).isEqualTo("TOTP_REQUIRED");
        assertThat(resultado.token()).isEqualTo(FAKE_PRE_AUTH_TOKEN);
        verify(jwtService).gerarPreAuthToken(usuarioPadrao.getId());
        verify(jwtService, never()).gerarToken(any(), any(), anyBoolean());
        verify(auditoriaService, never()).registrar(eq(AcaoAuditoria.LOGIN_SUCESSO), any(), any(), any(), any());
    }

    @Test
    void deveVerificarTotpComSucesso() {
        // Arrange
        UUID userId = usuarioPadrao.getId();
        usuarioPadrao.setTotpAtivo(true);
        usuarioPadrao.setSegredoTotp("JBSWY3DPEHPK3PXP");

        DecodedJWT jwt = mock(DecodedJWT.class);
        when(jwtService.validarToken(FAKE_PRE_AUTH_TOKEN)).thenReturn(jwt);
        when(jwtService.extrairScope(jwt)).thenReturn(JwtService.SCOPE_PRE_AUTH);
        when(jwtService.extrairUserId(jwt)).thenReturn(userId);
        when(usuarioRepository.findById(userId)).thenReturn(Optional.of(usuarioPadrao));
        when(totpService.verificarCodigo("JBSWY3DPEHPK3PXP", 123456)).thenReturn(true);
        when(jwtService.gerarToken(userId, "ALUNO", false)).thenReturn(FAKE_TOKEN);

        // Act
        LoginResponse resultado = authenticationService.verificarTotp(123456, FAKE_PRE_AUTH_TOKEN);

        // Assert
        assertThat(resultado.status()).isEqualTo("AUTHENTICATED");
        assertThat(resultado.nomeCompleto()).isEqualTo("João Silva");
        assertThat(resultado.token()).isEqualTo(FAKE_TOKEN);
        verify(auditoriaService).registrar(eq(AcaoAuditoria.TOTP_VERIFICADO), eq(userId), any(), any(), any());
    }

    @Test
    void deveLancarExcecaoQuandoTotpSemPreAuthToken() {
        // Act
        ResponseStatusException excecao = assertThrows(
                ResponseStatusException.class,
                () -> authenticationService.verificarTotp(123456, null)
        );

        // Assert
        assertThat(excecao.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
    }


    // Cenário 2 — Violação de Regra: senha inválida


    @Test
    void deveLancarExcecaoQuandoSenhaInvalida() {
        // Arrange
        when(usuarioRepository.findByEmail(EMAIL_VALIDO)).thenReturn(Optional.of(usuarioPadrao));
        when(senhaService.match("senhaErrada!", SENHA_HASH)).thenReturn(false);

        // Act
        ResponseStatusException excecao = assertThrows(
                ResponseStatusException.class,
                () -> authenticationService.login(EMAIL_VALIDO, "senhaErrada!")
        );

        // Assert
        assertThat(excecao.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
        verify(jwtService, never()).gerarToken(any(), any(), anyBoolean());
        verify(auditoriaService).registrar(
                eq(AcaoAuditoria.LOGIN_FALHA),
                eq(usuarioPadrao.getId()),
                eq("USUARIO"),
                eq(usuarioPadrao.getId().toString()),
                eq("senha inválida")
        );
    }


    // Cenário 3 — Caso-Limite: e-mail não encontrado ou inválido


    @ParameterizedTest
    @NullAndEmptySource
    @ValueSource(strings = {"inexistente@email.com", "   "})
    void deveLancarExcecaoQuandoEmailNaoEncontradoOuInvalido(String email) {
        // Arrange
        when(usuarioRepository.findByEmail(any())).thenReturn(Optional.empty());

        // Act
        ResponseStatusException excecao = assertThrows(
                ResponseStatusException.class,
                () -> authenticationService.login(email, SENHA_CORRETA)
        );

        // Assert
        assertThat(excecao.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
        verify(senhaService, never()).match(any(), any());
    }
}
