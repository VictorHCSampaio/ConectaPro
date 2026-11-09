package com.grupo.tfc.conectapro.service;

import com.grupo.tfc.conectapro.model.AcaoAuditoria;
import com.grupo.tfc.conectapro.model.AuditoriaLog;
import com.grupo.tfc.conectapro.model.StatusAgendamento;
import com.grupo.tfc.conectapro.model.StatusConta;
import com.grupo.tfc.conectapro.model.TipoUsuario;
import com.grupo.tfc.conectapro.repository.AgendamentoRepository;
import com.grupo.tfc.conectapro.repository.AuditoriaLogRepository;
import com.grupo.tfc.conectapro.repository.PagamentoRepository;
import com.grupo.tfc.conectapro.repository.ProfessorMateriaRepository;
import com.grupo.tfc.conectapro.repository.ProfessorRepository;
import com.grupo.tfc.conectapro.repository.UsuarioRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
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
        when(agendamentoRepository.findTop5ByOrderByCriadoEmDesc()).thenReturn(List.of());
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
}
