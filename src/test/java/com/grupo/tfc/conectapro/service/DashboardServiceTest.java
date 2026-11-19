package com.grupo.tfc.conectapro.service;

import com.grupo.tfc.conectapro.model.AcaoAuditoria;
import com.grupo.tfc.conectapro.model.AuditoriaLog;
import com.grupo.tfc.conectapro.model.StatusAgendamento;
import com.grupo.tfc.conectapro.model.StatusConta;
import com.grupo.tfc.conectapro.model.TipoUsuario;
import com.grupo.tfc.conectapro.model.Usuario;
import com.grupo.tfc.conectapro.repository.AgendamentoRepository;
import com.grupo.tfc.conectapro.repository.AuditoriaLogRepository;
import com.grupo.tfc.conectapro.repository.PagamentoRepository;
import com.grupo.tfc.conectapro.repository.ProfessorMateriaRepository;
import com.grupo.tfc.conectapro.repository.ProfessorRepository;
import com.grupo.tfc.conectapro.repository.UsuarioRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DashboardServiceTest {

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private AgendamentoRepository agendamentoRepository;

    @Mock
    private ProfessorMateriaRepository professorMateriaRepository;

    @Mock
    private AuditoriaLogRepository auditoriaLogRepository;

    @Mock
    private PagamentoRepository pagamentoRepository;

    @Mock
    private ProfessorRepository professorRepository;

    @InjectMocks
    private DashboardService dashboardService;

    @Test
    void resumo_usaContagensReaisEReceitaDeAssinaturasAprovadas() {
        UUID legado = UUID.randomUUID();
        AuditoriaLog cadastro = new AuditoriaLog();
        cadastro.setUsuarioId(legado);
        cadastro.setAcao(AcaoAuditoria.CADASTRO);
        cadastro.setDetalhes("tipo=ALUNO");
        cadastro.setCriadoEm(OffsetDateTime.now());

        when(usuarioRepository.countByTipo(TipoUsuario.ALUNO)).thenReturn(12L);
        when(professorRepository.countByUsuario_StatusConta(StatusConta.ATIVO)).thenReturn(9L);
        when(agendamentoRepository.countByStatusAndCriadoEmGreaterThanEqualAndCriadoEmLessThan(
                eq(StatusAgendamento.CONFIRMADO), any(), any())).thenReturn(4L);
        when(pagamentoRepository.somarReceitaAprovadaNoMes(any(), any())).thenReturn(new BigDecimal("29.90"));
        when(usuarioRepository.findByCriadoEmGreaterThanEqualAndCriadoEmLessThan(any(), any()))
                .thenReturn(List.of());
        when(usuarioRepository.findIdsComCriadoEmNulo()).thenReturn(List.of(legado));
        when(auditoriaLogRepository.findByAcaoAndCriadoEmGreaterThanEqual(
                eq(AcaoAuditoria.CADASTRO), any())).thenReturn(List.of(cadastro));
        when(professorMateriaRepository.contarProfessoresPorMateria(any(), any())).thenReturn(List.of());
        when(agendamentoRepository.buscarUltimasComParticipantes(any())).thenReturn(List.of());
        when(auditoriaLogRepository.findTop5ByOrderByCriadoEmDesc()).thenReturn(List.of());

        var resumo = dashboardService.resumo(30);

        assertThat(resumo.totalAlunos()).isEqualTo(12);
        assertThat(resumo.totalProfessores()).isEqualTo(9);
        assertThat(resumo.aulasConfirmadasNoMes()).isEqualTo(4);
        assertThat(resumo.receitaAssinaturasMes()).isEqualByComparingTo("29.90");
        assertThat(resumo.novosUsuarios().get(resumo.novosUsuarios().size() - 1).alunos()).isEqualTo(1);
        assertThat(resumo.professoresPorMateria()).isEmpty();
        assertThat(resumo.ultimasAulas()).isEmpty();
        assertThat(resumo.atividadesRecentes()).isEmpty();
    }

    @Test
    void resumo_noventaDias_consultaAJanelaDe90Dias() {
        ArgumentCaptor<OffsetDateTime> inicio = ArgumentCaptor.forClass(OffsetDateTime.class);
        ArgumentCaptor<OffsetDateTime> fim = ArgumentCaptor.forClass(OffsetDateTime.class);
        prepararConsultas(inicio, fim, 2L, List.of());

        var resumo = dashboardService.resumo(90);

        assertThat(ChronoUnit.DAYS.between(inicio.getValue(), fim.getValue())).isEqualTo(90);
        assertThat(resumo.aulasConfirmadasNoMes()).isEqualTo(2);
        assertThat(resumo.novosUsuarios()).isNotEmpty();
    }

    @Test
    void resumo_desdeOInicio_comecaNoPrimeiroCadastro() {
        ZoneId zona = ZoneId.of("America/Sao_Paulo");
        OffsetDateTime primeiro = OffsetDateTime.now(zona).minusDays(120);
        Usuario aluno = Usuario.builder()
                .id(UUID.randomUUID())
                .tipo(TipoUsuario.ALUNO)
                .criadoEm(primeiro)
                .build();
        when(usuarioRepository.buscarMenorCriadoEm()).thenReturn(primeiro);

        ArgumentCaptor<OffsetDateTime> inicio = ArgumentCaptor.forClass(OffsetDateTime.class);
        ArgumentCaptor<OffsetDateTime> fim = ArgumentCaptor.forClass(OffsetDateTime.class);
        prepararConsultas(inicio, fim, 3L, List.of(aluno));

        var resumo = dashboardService.resumo(0);

        assertThat(inicio.getValue().atZoneSameInstant(zona).toLocalDate())
                .isEqualTo(primeiro.atZoneSameInstant(zona).toLocalDate());
        assertThat(resumo.aulasConfirmadasNoMes()).isEqualTo(3);
        assertThat(resumo.receitaAssinaturasMes()).isEqualByComparingTo("10.00");
        assertThat(resumo.novosUsuarios().get(0).mes())
                .isEqualTo(primeiro.atZoneSameInstant(zona).toLocalDate().format(DateTimeFormatter.ofPattern("dd/MM")));
        assertThat(resumo.novosUsuarios().stream().mapToLong(ponto -> ponto.alunos()).sum()).isEqualTo(1);
        assertThat(resumo.novosUsuarios().size()).isGreaterThan(14);
    }

    @Test
    void resumo_desdeOInicio_semDatas_usaJanelaDe90Dias() {
        ArgumentCaptor<OffsetDateTime> inicio = ArgumentCaptor.forClass(OffsetDateTime.class);
        ArgumentCaptor<OffsetDateTime> fim = ArgumentCaptor.forClass(OffsetDateTime.class);
        prepararConsultas(inicio, fim, 0L, List.of());

        var resumo = dashboardService.resumo(0);

        assertThat(ChronoUnit.DAYS.between(inicio.getValue(), fim.getValue())).isEqualTo(90);
        assertThat(resumo.novosUsuarios()).hasSizeBetween(12, 14);
    }

    private void prepararConsultas(ArgumentCaptor<OffsetDateTime> inicio,
                                   ArgumentCaptor<OffsetDateTime> fim,
                                   long aulas,
                                   List<Usuario> usuarios) {
        when(usuarioRepository.countByTipo(TipoUsuario.ALUNO)).thenReturn(1L);
        when(professorRepository.countByUsuario_StatusConta(StatusConta.ATIVO)).thenReturn(0L);
        when(agendamentoRepository.countByStatusAndCriadoEmGreaterThanEqualAndCriadoEmLessThan(
                eq(StatusAgendamento.CONFIRMADO), inicio.capture(), fim.capture())).thenReturn(aulas);
        when(pagamentoRepository.somarReceitaAprovadaNoMes(any(), any())).thenReturn(new BigDecimal("10.00"));
        when(usuarioRepository.findByCriadoEmGreaterThanEqualAndCriadoEmLessThan(any(), any())).thenReturn(usuarios);
        when(usuarioRepository.findIdsComCriadoEmNulo()).thenReturn(List.of());
        when(professorMateriaRepository.contarProfessoresPorMateria(any(), any())).thenReturn(List.of());
        when(agendamentoRepository.buscarUltimasComParticipantes(any())).thenReturn(List.of());
        when(auditoriaLogRepository.findTop5ByOrderByCriadoEmDesc()).thenReturn(List.of());
    }
}
