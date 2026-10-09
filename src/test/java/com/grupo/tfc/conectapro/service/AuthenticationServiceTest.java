package com.grupo.tfc.conectapro.service;

import com.grupo.tfc.conectapro.config.SessaoUsuario;
import com.grupo.tfc.conectapro.model.AcaoAuditoria;
import com.grupo.tfc.conectapro.model.TipoUsuario;
import com.grupo.tfc.conectapro.model.Usuario;
import com.grupo.tfc.conectapro.repository.UsuarioRepository;
import jakarta.servlet.http.HttpSession;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.NullAndEmptySource;
import org.junit.jupiter.params.provider.ValueSource;
import org.mockito.InjectMocks;
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
    private HttpSession session;

    @InjectMocks
    private AuthenticationService authenticationService;

    private static final String EMAIL_VALIDO = "joao.silva@email.com";
    private static final String SENHA_CORRETA = "S3nh@Correta!";
    private static final String SENHA_HASH = "$2a$10$abcdefghijklmnopqrstuuVGnxyz1234567890abcdefghijk";

    private Usuario usuarioPadrao;

    @BeforeEach
    void setUp() {
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

        // Act
        Usuario resultado = authenticationService.login(EMAIL_VALIDO, SENHA_CORRETA, session);

        // Assert
        assertThat(resultado).isEqualTo(usuarioPadrao);
        verify(session).setAttribute(SessaoUsuario.ATRIBUTO, usuarioPadrao.getId());
        verify(auditoriaService).registrar(
                eq(AcaoAuditoria.LOGIN_SUCESSO),
                eq(usuarioPadrao.getId()),
                eq("USUARIO"),
                eq(usuarioPadrao.getId().toString()),
                isNull()
        );
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
                () -> authenticationService.login(EMAIL_VALIDO, "senhaErrada!", session)
        );

        // Assert
        assertThat(excecao.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
        verify(session, never()).setAttribute(any(), any());
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
                () -> authenticationService.login(email, SENHA_CORRETA, session)
        );

        // Assert
        assertThat(excecao.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
        verify(senhaService, never()).match(any(), any());
    }
}
