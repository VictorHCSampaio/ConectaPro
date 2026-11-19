package com.grupo.tfc.conectapro.service;

import com.grupo.tfc.conectapro.dto.agendamento.AgendarRequest;
import com.grupo.tfc.conectapro.model.TipoUsuario;
import com.grupo.tfc.conectapro.model.Usuario;
import com.grupo.tfc.conectapro.repository.AgendamentoRepository;
import com.grupo.tfc.conectapro.repository.ProfessorDisponibilidadeRepository;
import com.grupo.tfc.conectapro.repository.ProfessorMateriaRepository;
import com.grupo.tfc.conectapro.repository.ProfessorRepository;
import com.grupo.tfc.conectapro.repository.UsuarioRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AgendamentoServiceTest {

    @Mock
    private AgendamentoRepository agendamentoRepository;
    @Mock
    private ProfessorRepository professorRepository;
    @Mock
    private UsuarioRepository usuarioRepository;
    @Mock
    private ProfessorDisponibilidadeRepository disponibilidadeRepository;
    @Mock
    private ProfessorMateriaRepository professorMateriaRepository;
    @Mock
    private AuditoriaService auditoriaService;
    @Mock
    private NotificacaoService notificacaoService;
    @Mock
    private ChatService chatService;

    @InjectMocks
    private AgendamentoService agendamentoService;

    @Test
    void solicitar_professorLogado_retorna400() {
        UUID professorLogadoId = UUID.randomUUID();
        Usuario professorLogado = Usuario.builder()
                .id(professorLogadoId)
                .nomeCompleto("Paulo Professor")
                .email("paulo@professor.com")
                .tipo(TipoUsuario.PROFESSOR)
                .build();
        when(usuarioRepository.findById(professorLogadoId)).thenReturn(Optional.of(professorLogado));

        AgendarRequest request = new AgendarRequest(
                UUID.randomUUID(),
                OffsetDateTime.parse("2026-12-01T11:00:00Z"),
                "ONLINE",
                "Matemática");

        ResponseStatusException excecao = assertThrows(
                ResponseStatusException.class,
                () -> agendamentoService.solicitar(professorLogadoId, request)
        );

        assertThat(excecao.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(excecao.getReason()).isEqualTo("Professores não podem agendar aulas com outros professores.");
        verify(professorRepository, never()).findById(request.professorId());
    }
}
