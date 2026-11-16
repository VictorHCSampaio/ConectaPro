package com.grupo.tfc.conectapro.service;

import com.grupo.tfc.conectapro.dto.agendamento.AgendamentoResponse;
import com.grupo.tfc.conectapro.dto.agendamento.AgendarRequest;
import com.grupo.tfc.conectapro.dto.agendamento.HorarioDisponivelResponse;
import com.grupo.tfc.conectapro.dto.chat.EnviarMensagemRequest;
import com.grupo.tfc.conectapro.model.*;
import com.grupo.tfc.conectapro.repository.AgendamentoRepository;
import com.grupo.tfc.conectapro.repository.ProfessorDisponibilidadeRepository;
import com.grupo.tfc.conectapro.repository.ProfessorMateriaRepository;
import com.grupo.tfc.conectapro.repository.ProfessorRepository;
import com.grupo.tfc.conectapro.repository.UsuarioRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.CONFLICT;
import static org.springframework.http.HttpStatus.FORBIDDEN;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
public class AgendamentoService {

    private static final Logger logger = LoggerFactory.getLogger(AgendamentoService.class);

    private static final String MODALIDADE_ONLINE = "ONLINE";
    private static final String MODALIDADE_PRESENCIAL = "PRESENCIAL";

    private static final List<StatusAgendamento> STATUS_OCUPADOS =
            List.of(StatusAgendamento.SOLICITADO, StatusAgendamento.CONFIRMADO);

    private static final ZoneId FUSO_BRASIL = ZoneId.of("America/Sao_Paulo");

    private static final DateTimeFormatter HORA_FMT = DateTimeFormatter.ofPattern("HH:mm");

    private static final Map<DayOfWeek, String> DIA_SIGLA = Map.of(
            DayOfWeek.MONDAY, "seg",
            DayOfWeek.TUESDAY, "ter",
            DayOfWeek.WEDNESDAY, "qua",
            DayOfWeek.THURSDAY, "qui",
            DayOfWeek.FRIDAY, "sex",
            DayOfWeek.SATURDAY, "sab",
            DayOfWeek.SUNDAY, "dom"
    );

    private final AgendamentoRepository agendamentoRepository;
    private final ProfessorRepository professorRepository;
    private final UsuarioRepository usuarioRepository;
    private final ProfessorDisponibilidadeRepository disponibilidadeRepository;
    private final ProfessorMateriaRepository professorMateriaRepository;
    private final AuditoriaService auditoriaService;
    private final NotificacaoService notificacaoService;
    private final ChatService chatService;

    public AgendamentoService(AgendamentoRepository agendamentoRepository,
                              ProfessorRepository professorRepository,
                              UsuarioRepository usuarioRepository,
                              ProfessorDisponibilidadeRepository disponibilidadeRepository,
                              ProfessorMateriaRepository professorMateriaRepository,
                              AuditoriaService auditoriaService,
                              NotificacaoService notificacaoService,
                              ChatService chatService) {
        this.agendamentoRepository = agendamentoRepository;
        this.professorRepository = professorRepository;
        this.usuarioRepository = usuarioRepository;
        this.disponibilidadeRepository = disponibilidadeRepository;
        this.professorMateriaRepository = professorMateriaRepository;
        this.auditoriaService = auditoriaService;
        this.notificacaoService = notificacaoService;
        this.chatService = chatService;
    }

    @Transactional
    public AgendamentoResponse solicitar(UUID alunoId, AgendarRequest request) {
        Usuario aluno = usuarioRepository.findById(alunoId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Usuário não encontrado"));

        if (aluno.getTipo() == TipoUsuario.PROFESSOR && !aluno.administrador()) {
            throw new ResponseStatusException(BAD_REQUEST, "Professores não podem agendar aulas com outros professores.");
        }

        Professor professor = professorRepository.findById(request.professorId())
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Professor não encontrado"));

        if (professor.getUsuario().getStatusConta() != StatusConta.ATIVO) {
            throw new ResponseStatusException(NOT_FOUND, "Professor não encontrado");
        }

        if (professor.getUsuario().getId().equals(alunoId)) {
            throw new ResponseStatusException(BAD_REQUEST, "Não é possível agendar com você mesmo");
        }

        if (professor.getUsuario().administrador()) {
            throw new ResponseStatusException(NOT_FOUND, "Professor não encontrado");
        }

        OffsetDateTime dataHoraInicio = request.dataHoraInicio();
        ZonedDateTime zdtBrasil = dataHoraInicio.atZoneSameInstant(FUSO_BRASIL);
        String dia = DIA_SIGLA.get(zdtBrasil.getDayOfWeek());
        String horario = zdtBrasil.format(HORA_FMT);

        if (dataHoraInicio.isBefore(OffsetDateTime.now(FUSO_BRASIL))) {
            throw new ResponseStatusException(BAD_REQUEST, "Não é possível agendar no passado");
        }

        String modalidade = modalidadeValida(professor, request.modality());
        String materia = materiaValida(professor, request.subject());

        boolean existeNaGrade = disponibilidadeRepository.findByProfessorId(professor.getId()).stream()
                .anyMatch(slot -> slot.getDiaSemana().equals(dia) && slot.getHorario().equals(horario));
        if (!existeNaGrade) {
            throw new ResponseStatusException(BAD_REQUEST, "Horário indisponível na grade do professor");
        }

        validarAntecedencia(professor, dataHoraInicio);

        String slotChave = chave(professor.getId(), zdtBrasil.toLocalDate(), horario);

        if (agendamentoRepository.existsBySlotChaveAndStatusIn(slotChave, STATUS_OCUPADOS)) {
            throw new ResponseStatusException(CONFLICT, "Horário já reservado");
        }

        Agendamento agendamento = Agendamento.builder()
                .aluno(aluno)
                .professor(professor)
                .dataHoraInicio(dataHoraInicio)
                .diaSemana(dia)
                .horario(horario)
                .modalidade(modalidade)
                .materia(materia)
                .status(StatusAgendamento.SOLICITADO)
                .slotChave(slotChave)
                .build();

        Agendamento salvo;
        try {
            salvo = agendamentoRepository.saveAndFlush(agendamento);
        } catch (DataIntegrityViolationException excecao) {
            logger.warn("Corrida ao reservar horário. professorId={} dataHoraInicio={}", professor.getId(), dataHoraInicio);
            throw new ResponseStatusException(CONFLICT, "Horário já reservado");
        }

        logger.info("Agendamento solicitado. agendamentoId={} alunoId={} professorId={}",
                salvo.getId(), alunoId, professor.getId());
        auditoriaService.registrar(AcaoAuditoria.AGENDAMENTO_CRIADO, alunoId, "AGENDAMENTO", salvo.getId().toString(),
                dia + " " + horario);
        notificacaoService.criarNotificacao(
                professor.getUsuario(),
                "Nova aula",
                aluno.getNomeCompleto() + " solicitou uma aula de " + materia + ".",
                TipoNotificacao.AULA_NOVA);

        return paraResponse(salvo);
    }

    @Transactional
    public AgendamentoResponse aprovar(UUID usuarioId, UUID agendamentoId) {
        Agendamento agendamento = buscarDoProfessor(usuarioId, agendamentoId);

        if (agendamento.getStatus() != StatusAgendamento.SOLICITADO) {
            throw new ResponseStatusException(BAD_REQUEST, "Apenas solicitações pendentes podem ser aprovadas");
        }

        agendamento.setStatus(StatusAgendamento.CONFIRMADO);
        agendamentoRepository.save(agendamento);

        logger.info("Agendamento aprovado. agendamentoId={} professorUsuarioId={}", agendamentoId, usuarioId);
        auditoriaService.registrar(AcaoAuditoria.AGENDAMENTO_CONFIRMADO, usuarioId, "AGENDAMENTO", agendamentoId.toString(), null);
        notificacaoService.criarNotificacao(
                agendamento.getAluno(),
                "Aula confirmada",
                "Sua aula de " + agendamento.getMateria() + " foi confirmada.",
                TipoNotificacao.AULA_NOVA);

        return paraResponse(agendamento);
    }

    @Transactional
    public AgendamentoResponse recusar(UUID usuarioId, UUID agendamentoId) {
        Agendamento agendamento = buscarDoProfessor(usuarioId, agendamentoId);

        if (agendamento.getStatus() == StatusAgendamento.CANCELADO) {
            throw new ResponseStatusException(BAD_REQUEST, "Agendamento já está cancelado");
        }

        agendamento.setStatus(StatusAgendamento.CANCELADO);
        agendamento.setSlotChave(null);
        agendamentoRepository.save(agendamento);

        logger.info("Agendamento recusado. agendamentoId={} professorUsuarioId={}", agendamentoId, usuarioId);
        auditoriaService.registrar(AcaoAuditoria.AGENDAMENTO_CANCELADO, usuarioId, "AGENDAMENTO", agendamentoId.toString(), null);

        return paraResponse(agendamento);
    }

    @Transactional
    public AgendamentoResponse cancelar(UUID usuarioId, UUID agendamentoId) {
        Agendamento agendamento = agendamentoRepository.findById(agendamentoId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Agendamento não encontrado"));

        boolean ehAluno = agendamento.getAluno().getId().equals(usuarioId);
        boolean ehProfessor = agendamento.getProfessor().getUsuario().getId().equals(usuarioId);

        if (!ehAluno && !ehProfessor) {
            auditoriaService.registrar(AcaoAuditoria.ACESSO_NEGADO, usuarioId, "AGENDAMENTO",
                    agendamentoId.toString(), "tentativa de cancelar agendamento alheio");
            throw new ResponseStatusException(FORBIDDEN, "Este agendamento não pertence a você");
        }

        if (agendamento.getStatus() == StatusAgendamento.CANCELADO) {
            throw new ResponseStatusException(BAD_REQUEST, "Agendamento já está cancelado");
        }

        agendamento.setStatus(StatusAgendamento.CANCELADO);
        agendamento.setSlotChave(null);
        agendamentoRepository.save(agendamento);

        logger.info("Agendamento cancelado. agendamentoId={} usuarioId={}", agendamentoId, usuarioId);
        auditoriaService.registrar(AcaoAuditoria.AGENDAMENTO_CANCELADO, usuarioId, "AGENDAMENTO",
                agendamentoId.toString(), null);

        Usuario outraParte = ehAluno
                ? agendamento.getProfessor().getUsuario()
                : agendamento.getAluno();
        String nomeQuemCancelou = ehAluno
                ? agendamento.getAluno().getNomeCompleto()
                : agendamento.getProfessor().getUsuario().getNomeCompleto();

        notificacaoService.criarNotificacao(
                outraParte,
                "Aula cancelada",
                nomeQuemCancelou + " cancelou a aula de " + agendamento.getMateria() + ".",
                TipoNotificacao.AULA_NOVA);

        String dataFormatada = formatarDataHora(agendamento.getDataHoraInicio());
        String mensagemChat = "⚠️ Aula de " + agendamento.getMateria()
                + " (" + dataFormatada + ") foi cancelada.";
        try {
            chatService.enviarMensagem(new EnviarMensagemRequest(outraParte.getId(), mensagemChat, null));
        } catch (Exception e) {
            logger.warn("Falha ao enviar mensagem de cancelamento no chat. agendamentoId={}", agendamentoId, e);
        }

        return paraResponse(agendamento);
    }

    @Transactional(readOnly = true)
    public List<AgendamentoResponse> listarDoAluno(UUID alunoId) {
        return agendamentoRepository.findByAlunoIdOrderByDataHoraInicioDesc(alunoId).stream()
                .map(this::paraResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<AgendamentoResponse> listarDoProfessor(UUID usuarioId) {
        Professor professor = professorDoUsuario(usuarioId);
        return agendamentoRepository.findByProfessorIdOrderByDataHoraInicioDesc(professor.getId()).stream()
                .map(this::paraResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<HorarioDisponivelResponse> horariosDisponiveis(UUID professorId) {
        Professor professor = professorRepository.findById(professorId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Professor não encontrado"));

        Set<String> ocupados = agendamentoRepository.findByProfessorIdAndStatusIn(professor.getId(), STATUS_OCUPADOS).stream()
                .map(Agendamento::getSlotChave)
                .collect(Collectors.toSet());

        return disponibilidadeRepository.findByProfessorId(professor.getId()).stream()
                .map(slot -> new HorarioDisponivelResponse(
                        slot.getDiaSemana(),
                        slot.getHorario(),
                        !ocupados.contains(chave(professor.getId(), proximaData(slot.getDiaSemana()), slot.getHorario()))))
                .toList();
    }

    private LocalDate proximaData(String diaSemana) {
        DayOfWeek alvo = DIA_SIGLA.entrySet().stream()
                .filter(e -> e.getValue().equals(diaSemana))
                .map(Map.Entry::getKey)
                .findFirst()
                .orElse(null);
        if (alvo == null) {
            return LocalDate.now(FUSO_BRASIL);
        }

        LocalDate hoje = LocalDate.now(FUSO_BRASIL);
        int delta = (alvo.getValue() - hoje.getDayOfWeek().getValue() + 7) % 7;
        if (delta == 0) {
            delta = 7;
        }
        return hoje.plusDays(delta);
    }

    private String modalidadeValida(Professor professor, String modalidade) {
        String valor = modalidade == null ? "" : modalidade.trim().toUpperCase();
        boolean online = MODALIDADE_ONLINE.equals(valor) && Boolean.TRUE.equals(professor.getAtendeOnline());
        boolean presencial = MODALIDADE_PRESENCIAL.equals(valor) && Boolean.TRUE.equals(professor.getAtendePresencial());
        if (!online && !presencial) {
            throw new ResponseStatusException(BAD_REQUEST, "Modalidade não oferecida por este professor");
        }
        return valor;
    }

    private String materiaValida(Professor professor, String materia) {
        String alvo = materia == null ? "" : materia.trim();
        return professorMateriaRepository.findByProfessorId(professor.getId()).stream()
                .map(ProfessorMateria::getMateria)
                .map(Materia::getNome)
                .filter(nome -> nome.equalsIgnoreCase(alvo))
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(BAD_REQUEST, "Matéria não oferecida por este professor"));
    }

    private Agendamento buscarDoProfessor(UUID usuarioId, UUID agendamentoId) {
        Professor professor = professorDoUsuario(usuarioId);
        Agendamento agendamento = agendamentoRepository.findById(agendamentoId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Agendamento não encontrado"));

        if (!agendamento.getProfessor().getId().equals(professor.getId())) {
            auditoriaService.registrar(AcaoAuditoria.ACESSO_NEGADO, usuarioId, "AGENDAMENTO", agendamentoId.toString(),
                    "tentativa de alterar agendamento de outro professor");
            throw new ResponseStatusException(FORBIDDEN, "Este agendamento não pertence a você");
        }

        return agendamento;
    }

    private Professor professorDoUsuario(UUID usuarioId) {
        return professorRepository.findByUsuarioId(usuarioId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Perfil ainda não configurado"));
    }

    private String chave(UUID professorId, LocalDate data, String horario) {
        return professorId + "|" + data + "|" + horario;
    }

    private void validarAntecedencia(Professor professor, OffsetDateTime dataHoraInicio) {
        Integer minHoras = professor.getAntecedenciaMinHoras();
        if (minHoras == null || minHoras <= 0) {
            return;
        }

        OffsetDateTime agora = OffsetDateTime.now(FUSO_BRASIL);
        long horasAte = ChronoUnit.HOURS.between(agora, dataHoraInicio);

        if (horasAte < minHoras) {
            throw new ResponseStatusException(BAD_REQUEST,
                    String.format("Este professor exige no mínimo %d hora(s) de antecedência para agendamento", minHoras));
        }
    }

    private String formatarDataHora(OffsetDateTime dataHora) {
        if (dataHora == null) {
            return "";
        }
        ZonedDateTime zdt = dataHora.atZoneSameInstant(FUSO_BRASIL);
        return zdt.format(DateTimeFormatter.ofPattern("dd/MM/yyyy 'às' HH:mm"));
    }

    private AgendamentoResponse paraResponse(Agendamento agendamento) {
        String dia = agendamento.getDiaSemana();
        String horario = agendamento.getHorario();
        if (agendamento.getDataHoraInicio() != null && (dia == null || horario == null)) {
            ZonedDateTime zdt = agendamento.getDataHoraInicio().atZoneSameInstant(FUSO_BRASIL);
            dia = DIA_SIGLA.getOrDefault(zdt.getDayOfWeek(), "");
            horario = zdt.format(HORA_FMT);
        }
        return new AgendamentoResponse(
                agendamento.getId(),
                agendamento.getProfessor().getId(),
                agendamento.getProfessor().getUsuario().getNomeCompleto(),
                agendamento.getAluno().getId(),
                agendamento.getAluno().getNomeCompleto(),
                agendamento.getDataHoraInicio(),
                dia,
                horario,
                agendamento.getModalidade(),
                agendamento.getMateria(),
                agendamento.getStatus(),
                agendamento.getCriadoEm(),
                agendamento.getAluno().getId(),
                agendamento.getProfessor().getUsuario().getId()
        );
    }
}
