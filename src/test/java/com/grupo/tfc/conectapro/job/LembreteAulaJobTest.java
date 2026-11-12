package com.grupo.tfc.conectapro.job;

import com.grupo.tfc.conectapro.model.Agendamento;
import com.grupo.tfc.conectapro.model.Professor;
import com.grupo.tfc.conectapro.model.StatusAgendamento;
import com.grupo.tfc.conectapro.model.TipoNotificacao;
import com.grupo.tfc.conectapro.model.Usuario;
import com.grupo.tfc.conectapro.repository.AgendamentoRepository;
import com.grupo.tfc.conectapro.repository.NotificacaoRepository;
import com.grupo.tfc.conectapro.service.NotificacaoService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class LembreteAulaJobTest {

    private static final OffsetDateTime QUINTA_OITO =
            OffsetDateTime.of(2026, 11, 12, 8, 0, 0, 0, ZoneOffset.ofHours(-3));

    @Mock
    private AgendamentoRepository agendamentoRepository;
    @Mock
    private NotificacaoRepository notificacaoRepository;
    @Mock
    private NotificacaoService notificacaoService;

    @InjectMocks
    private LembreteAulaJob job;

    @Test
    void aulaEm24Horas_avisaAlunoEProfessor() {
        Agendamento aula = aula("sex", "08:00", "Matemática");
        when(agendamentoRepository.buscarPorStatusComParticipantes(StatusAgendamento.CONFIRMADO))
                .thenReturn(List.of(aula));

        job.enviarLembretes(QUINTA_OITO);

        String mensagem = "Você tem uma aula de Matemática em 24 horas!";
        verify(notificacaoService).criarNotificacao(eq(aula.getAluno()), eq("Lembrete de aula"), eq(mensagem), eq(TipoNotificacao.AULA_LEMBRETE));
        verify(notificacaoService).criarNotificacao(
                eq(aula.getProfessor().getUsuario()), eq("Lembrete de aula"), eq(mensagem), eq(TipoNotificacao.AULA_LEMBRETE));
    }

    @Test
    void aulaEm1Hora_avisaAlunoEProfessor() {
        Agendamento aula = aula("qui", "08:00", "Física");
        when(agendamentoRepository.buscarPorStatusComParticipantes(StatusAgendamento.CONFIRMADO))
                .thenReturn(List.of(aula));
        OffsetDateTime agora = QUINTA_OITO.minusHours(1);

        job.enviarLembretes(agora);

        verify(notificacaoService, times(2)).criarNotificacao(
                any(), eq("Lembrete de aula"), eq("Você tem uma aula de Física em 1 hora!"), eq(TipoNotificacao.AULA_LEMBRETE));
    }

    @Test
    void aulaForaDaJanela_naoGeraLembrete() {
        Agendamento aula = aula("qui", "14:00", "História");
        when(agendamentoRepository.buscarPorStatusComParticipantes(StatusAgendamento.CONFIRMADO))
                .thenReturn(List.of(aula));

        job.enviarLembretes(QUINTA_OITO);

        verify(notificacaoService, never()).criarNotificacao(any(), any(), any(), any());
    }

    @Test
    void lembreteJaEnviadoNaMesmaJanela_naoRepete() {
        Agendamento aula = aula("sex", "08:00", "Matemática");
        when(agendamentoRepository.buscarPorStatusComParticipantes(StatusAgendamento.CONFIRMADO))
                .thenReturn(List.of(aula));
        when(notificacaoRepository.existsByUsuarioIdAndTipoAndMensagemAndDataCriacaoAfter(
                any(), eq(TipoNotificacao.AULA_LEMBRETE), any(), any())).thenReturn(true);

        job.enviarLembretes(QUINTA_OITO);

        verify(notificacaoService, never()).criarNotificacao(any(), any(), any(), any());
    }

    private Agendamento aula(String dia, String horario, String materia) {
        Usuario aluno = Usuario.builder().id(UUID.randomUUID()).nomeCompleto("Ana Aluna").build();
        Usuario professorUsuario = Usuario.builder().id(UUID.randomUUID()).nomeCompleto("Paulo Professor").build();
        Professor professor = new Professor();
        professor.setId(UUID.randomUUID());
        professor.setUsuario(professorUsuario);
        return Agendamento.builder()
                .id(UUID.randomUUID())
                .aluno(aluno)
                .professor(professor)
                .diaSemana(dia)
                .horario(horario)
                .materia(materia)
                .status(StatusAgendamento.CONFIRMADO)
                .build();
    }
}
