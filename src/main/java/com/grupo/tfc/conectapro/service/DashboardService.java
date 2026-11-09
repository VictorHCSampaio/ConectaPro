package com.grupo.tfc.conectapro.service;

import com.grupo.tfc.conectapro.dto.DashboardResumoDTO;
import com.grupo.tfc.conectapro.dto.DashboardResumoDTO.AtividadeRecenteDTO;
import com.grupo.tfc.conectapro.dto.DashboardResumoDTO.AulaRecenteDTO;
import com.grupo.tfc.conectapro.dto.DashboardResumoDTO.ContagemDisciplinaDTO;
import com.grupo.tfc.conectapro.dto.DashboardResumoDTO.PontoMensalDTO;
import com.grupo.tfc.conectapro.model.AcaoAuditoria;
import com.grupo.tfc.conectapro.model.Agendamento;
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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    private static final ZoneId ZONA = ZoneId.of("America/Sao_Paulo");
    private static final DateTimeFormatter ROTULO_DIA = DateTimeFormatter.ofPattern("dd/MM");
    private static final int JANELA_PADRAO = 30;

    private final UsuarioRepository usuarioRepository;
    private final AgendamentoRepository agendamentoRepository;
    private final ProfessorMateriaRepository professorMateriaRepository;
    private final AuditoriaLogRepository auditoriaLogRepository;
    private final PagamentoRepository pagamentoRepository;
    private final ProfessorRepository professorRepository;

    public DashboardService(UsuarioRepository usuarioRepository,
                            AgendamentoRepository agendamentoRepository,
                            ProfessorMateriaRepository professorMateriaRepository,
                            AuditoriaLogRepository auditoriaLogRepository,
                            PagamentoRepository pagamentoRepository,
                            ProfessorRepository professorRepository) {
        this.usuarioRepository = usuarioRepository;
        this.agendamentoRepository = agendamentoRepository;
        this.professorMateriaRepository = professorMateriaRepository;
        this.auditoriaLogRepository = auditoriaLogRepository;
        this.pagamentoRepository = pagamentoRepository;
        this.professorRepository = professorRepository;
    }

    @Transactional(readOnly = true)
    public DashboardResumoDTO resumo(int dias) {
        int janela = dias == 7 || dias == 30 || dias == 90 ? dias : JANELA_PADRAO;
        OffsetDateTime fim = OffsetDateTime.now(ZONA);
        OffsetDateTime inicio = fim.minusDays(janela);

        return new DashboardResumoDTO(
                usuarioRepository.countByTipo(TipoUsuario.ALUNO),
                professorRepository.countByUsuario_StatusConta(StatusConta.ATIVO),
                contarConfirmadas(inicio, fim),
                receitaAssinaturas(inicio, fim),
                novosUsuarios(inicio, fim, janela),
                professoresPorMateria(inicio, fim),
                ultimasAulas(),
                atividadesRecentes()
        );
    }

    private long contarConfirmadas(OffsetDateTime inicio, OffsetDateTime fim) {
        return agendamentoRepository.countByStatusAndCriadoEmGreaterThanEqualAndCriadoEmLessThan(
                StatusAgendamento.CONFIRMADO, inicio, fim);
    }

    private BigDecimal receitaAssinaturas(OffsetDateTime inicio, OffsetDateTime fim) {
        BigDecimal receita = pagamentoRepository.somarReceitaAprovadaNoMes(inicio, fim);
        return receita == null ? BigDecimal.ZERO : receita;
    }

    private List<PontoMensalDTO> novosUsuarios(OffsetDateTime inicio, OffsetDateTime fim, int dias) {
        Map<LocalDate, long[]> porDia = new HashMap<>();
        for (Usuario usuario : usuarioRepository.findByCriadoEmGreaterThanEqualAndCriadoEmLessThan(inicio, fim)) {
            if (usuario.getCriadoEm() == null || usuario.getTipo() == null) {
                continue;
            }
            acumular(porDia, usuario.getCriadoEm().atZoneSameInstant(ZONA).toLocalDate(), usuario.getTipo());
        }
        contabilizarCadastrosSemData(inicio, fim, porDia);

        LocalDate primeiro = inicio.atZoneSameInstant(ZONA).toLocalDate();
        LocalDate ultimo = fim.atZoneSameInstant(ZONA).toLocalDate();
        if (dias > 31) {
            return pontosSemanais(primeiro, ultimo, porDia);
        }
        return pontosDiarios(primeiro, ultimo, porDia);
    }

    private void contabilizarCadastrosSemData(OffsetDateTime inicio, OffsetDateTime fim, Map<LocalDate, long[]> porDia) {
        Set<UUID> semData = new HashSet<>(usuarioRepository.findIdsComCriadoEmNulo());
        if (semData.isEmpty()) {
            return;
        }

        for (AuditoriaLog log : auditoriaLogRepository.findByAcaoAndCriadoEmGreaterThanEqual(
                AcaoAuditoria.CADASTRO, inicio)) {
            if (log.getUsuarioId() == null || !semData.contains(log.getUsuarioId()) || log.getCriadoEm() == null) {
                continue;
            }
            if (!log.getCriadoEm().isBefore(fim)) {
                continue;
            }
            TipoUsuario tipo = tipoDoDetalhe(log.getDetalhes());
            if (tipo == null) {
                continue;
            }
            acumular(porDia, log.getCriadoEm().atZoneSameInstant(ZONA).toLocalDate(), tipo);
        }
    }

    private void acumular(Map<LocalDate, long[]> porDia, LocalDate dia, TipoUsuario tipo) {
        long[] totais = porDia.computeIfAbsent(dia, chave -> new long[2]);
        if (tipo == TipoUsuario.PROFESSOR) {
            totais[1]++;
        } else if (tipo == TipoUsuario.ALUNO) {
            totais[0]++;
        }
    }

    private List<PontoMensalDTO> pontosDiarios(LocalDate primeiro, LocalDate ultimo, Map<LocalDate, long[]> porDia) {
        List<PontoMensalDTO> pontos = new ArrayList<>();
        for (LocalDate dia = primeiro; !dia.isAfter(ultimo); dia = dia.plusDays(1)) {
            long[] totais = porDia.getOrDefault(dia, new long[2]);
            pontos.add(new PontoMensalDTO(dia.format(ROTULO_DIA), totais[0], totais[1]));
        }
        return pontos;
    }

    private List<PontoMensalDTO> pontosSemanais(LocalDate primeiro, LocalDate ultimo, Map<LocalDate, long[]> porDia) {
        List<PontoMensalDTO> pontos = new ArrayList<>();
        LocalDate cursor = primeiro;
        while (!cursor.isAfter(ultimo)) {
            LocalDate fimSemana = cursor.plusDays(6).isAfter(ultimo) ? ultimo : cursor.plusDays(6);
            long alunos = 0;
            long professores = 0;
            for (LocalDate dia = cursor; !dia.isAfter(fimSemana); dia = dia.plusDays(1)) {
                long[] totais = porDia.get(dia);
                if (totais != null) {
                    alunos += totais[0];
                    professores += totais[1];
                }
            }
            pontos.add(new PontoMensalDTO(cursor.format(ROTULO_DIA), alunos, professores));
            cursor = fimSemana.plusDays(1);
        }
        return pontos;
    }

    private TipoUsuario tipoDoDetalhe(String detalhes) {
        if (detalhes == null) {
            return null;
        }
        if (detalhes.contains("PROFESSOR")) {
            return TipoUsuario.PROFESSOR;
        }
        if (detalhes.contains("ALUNO")) {
            return TipoUsuario.ALUNO;
        }
        return null;
    }

    private List<ContagemDisciplinaDTO> professoresPorMateria(OffsetDateTime inicio, OffsetDateTime fim) {
        return professorMateriaRepository.contarProfessoresPorMateria(inicio, fim).stream()
                .map(item -> new ContagemDisciplinaDTO(
                        item.getDisciplina(),
                        item.getQuantidade() == null ? 0 : item.getQuantidade()
                ))
                .toList();
    }

    private List<AulaRecenteDTO> ultimasAulas() {
        return agendamentoRepository.findTop5ByOrderByCriadoEmDesc().stream()
                .map(this::paraAula)
                .toList();
    }

    private AulaRecenteDTO paraAula(Agendamento agendamento) {
        return new AulaRecenteDTO(
                agendamento.getProfessor().getUsuario().getNomeCompleto(),
                agendamento.getAluno().getNomeCompleto(),
                agendamento.getMateria(),
                agendamento.getDiaSemana(),
                agendamento.getHorario(),
                traduzirStatus(agendamento.getStatus()),
                agendamento.getCriadoEm()
        );
    }

    private List<AtividadeRecenteDTO> atividadesRecentes() {
        List<AuditoriaLog> logs = auditoriaLogRepository.findTop5ByOrderByCriadoEmDesc();
        List<UUID> ids = logs.stream()
                .map(AuditoriaLog::getUsuarioId)
                .filter(id -> id != null)
                .distinct()
                .toList();
        Map<UUID, Usuario> usuarios = usuarioRepository.findAllById(ids).stream()
                .collect(Collectors.toMap(Usuario::getId, Function.identity()));

        return logs.stream()
                .map(log -> new AtividadeRecenteDTO(
                        nomeDe(usuarios.get(log.getUsuarioId())),
                        traduzirAcao(log.getAcao()),
                        log.getCriadoEm()
                ))
                .toList();
    }

    private String nomeDe(Usuario usuario) {
        if (usuario == null || usuario.getNomeCompleto() == null || usuario.getNomeCompleto().isBlank()) {
            return "Usuário";
        }
        return usuario.getNomeCompleto();
    }

    private String traduzirStatus(StatusAgendamento status) {
        if (status == null) {
            return "Desconhecido";
        }
        return switch (status) {
            case SOLICITADO -> "Solicitado";
            case CONFIRMADO -> "Confirmado";
            case CANCELADO -> "Cancelado";
        };
    }

    private String traduzirAcao(AcaoAuditoria acao) {
        if (acao == null) {
            return "registrou uma atividade";
        }
        return switch (acao) {
            case CADASTRO -> "se cadastrou";
            case LOGIN_SUCESSO -> "entrou na plataforma";
            case LOGIN_FALHA -> "teve uma tentativa de login malsucedida";
            case LOGOUT -> "saiu da plataforma";
            case PERFIL_ATUALIZADO -> "atualizou o perfil";
            case ENDERECO_ATUALIZADO -> "atualizou o endereço";
            case MATERIA_CRIADA -> "cadastrou uma matéria";
            case ACESSO_NEGADO -> "teve um acesso negado";
            case TOTP_VERIFICADO -> "confirmou a verificação em duas etapas";
            case TOTP_FALHA -> "falhou na verificação em duas etapas";
            case AGENDAMENTO_CRIADO -> "solicitou um agendamento";
            case AGENDAMENTO_CONFIRMADO -> "confirmou um agendamento";
            case AGENDAMENTO_CANCELADO -> "cancelou um agendamento";
            case RESET_SENHA_SOLICITADO -> "solicitou redefinição de senha";
            case RESET_SENHA_CONFIRMADO -> "redefiniu a senha";
        };
    }
}
