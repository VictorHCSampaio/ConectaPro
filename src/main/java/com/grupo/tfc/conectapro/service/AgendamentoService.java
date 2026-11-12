package com.grupo.tfc.conectapro.service;

import com.grupo.tfc.conectapro.dto.agendamento.AgendamentoResponse;
import com.grupo.tfc.conectapro.dto.agendamento.AgendarRequest;
import com.grupo.tfc.conectapro.dto.agendamento.HorarioDisponivelResponse;
import com.grupo.tfc.conectapro.model.AcaoAuditoria;
import com.grupo.tfc.conectapro.model.Agendamento;
import com.grupo.tfc.conectapro.model.Professor;
import com.grupo.tfc.conectapro.model.ProfessorMateria;
import com.grupo.tfc.conectapro.model.StatusAgendamento;
import com.grupo.tfc.conectapro.model.StatusConta;
import com.grupo.tfc.conectapro.model.Usuario;
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

import java.util.List;
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

    private final AgendamentoRepository agendamentoRepository;
    private final ProfessorRepository professorRepository;
    private final UsuarioRepository usuarioRepository;
    private final ProfessorDisponibilidadeRepository disponibilidadeRepository;
    private final ProfessorMateriaRepository professorMateriaRepository;
    private final AuditoriaService auditoriaService;

    public AgendamentoService(AgendamentoRepository agendamentoRepository,
                              ProfessorRepository professorRepository,
                              UsuarioRepository usuarioRepository,
                              ProfessorDisponibilidadeRepository disponibilidadeRepository,
                              ProfessorMateriaRepository professorMateriaRepository,
                              AuditoriaService auditoriaService) {
        this.agendamentoRepository = agendamentoRepository;
        this.professorRepository = professorRepository;
        this.usuarioRepository = usuarioRepository;
        this.disponibilidadeRepository = disponibilidadeRepository;
        this.professorMateriaRepository = professorMateriaRepository;
        this.auditoriaService = auditoriaService;
    }

    @Transactional
    public AgendamentoResponse solicitar(UUID alunoId, AgendarRequest request) {
        Usuario aluno = usuarioRepository.findById(alunoId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Usuário não encontrado"));

        Professor professor = professorRepository.findById(request.professorId())
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Professor não encontrado"));

        if (professor.getUsuario().getStatusConta() != StatusConta.ATIVO) {
            throw new ResponseStatusException(NOT_FOUND, "Professor não encontrado");
        }

        if (professor.getUsuario().getId().equals(alunoId)) {
            throw new ResponseStatusException(BAD_REQUEST, "Não é possível agendar com você mesmo");
        }

        String dia = request.day().trim();
        String horario = request.time().trim();
        String modalidade = modalidadeValida(professor, request.modality());
        String materia = materiaValida(professor, request.subject());

        boolean existeNaGrade = disponibilidadeRepository.findByProfessorId(professor.getId()).stream()
                .anyMatch(slot -> slot.getDiaSemana().equals(dia) && slot.getHorario().equals(horario));
        if (!existeNaGrade) {
            throw new ResponseStatusException(BAD_REQUEST, "Horário indisponível na grade do professor");
        }

        if (agendamentoRepository.existsByProfessorIdAndDiaSemanaAndHorarioAndStatusIn(
                professor.getId(), dia, horario, STATUS_OCUPADOS)) {
            throw new ResponseStatusException(CONFLICT, "Horário já reservado");
        }

        Agendamento agendamento = Agendamento.builder()
                .aluno(aluno)
                .professor(professor)
                .diaSemana(dia)
                .horario(horario)
                .modalidade(modalidade)
                .materia(materia)
                .status(StatusAgendamento.SOLICITADO)
                .slotChave(chave(professor.getId(), dia, horario))
                .build();

        Agendamento salvo;
        try {
            salvo = agendamentoRepository.saveAndFlush(agendamento);
        } catch (DataIntegrityViolationException excecao) {
            logger.warn("Corrida ao reservar horário. professorId={} dia={} horario={}", professor.getId(), dia, horario);
            throw new ResponseStatusException(CONFLICT, "Horário já reservado");
        }

        logger.info("Agendamento solicitado. agendamentoId={} alunoId={} professorId={}",
                salvo.getId(), alunoId, professor.getId());
        auditoriaService.registrar(AcaoAuditoria.AGENDAMENTO_CRIADO, alunoId, "AGENDAMENTO", salvo.getId().toString(),
                dia + " " + horario);

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

    @Transactional(readOnly = true)
    public List<AgendamentoResponse> listarDoAluno(UUID alunoId) {
        return agendamentoRepository.findByAlunoIdOrderByCriadoEmDesc(alunoId).stream()
                .map(this::paraResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<AgendamentoResponse> listarDoProfessor(UUID usuarioId) {
        Professor professor = professorDoUsuario(usuarioId);
        return agendamentoRepository.findByProfessorIdOrderByCriadoEmDesc(professor.getId()).stream()
                .map(this::paraResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<HorarioDisponivelResponse> horariosDisponiveis(UUID professorId) {
        Professor professor = professorRepository.findById(professorId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Professor não encontrado"));

        Set<String> ocupados = agendamentoRepository.findByProfessorIdAndStatusIn(professor.getId(), STATUS_OCUPADOS).stream()
                .map(agendamento -> chaveSlot(agendamento.getDiaSemana(), agendamento.getHorario()))
                .collect(Collectors.toSet());

        return disponibilidadeRepository.findByProfessorId(professor.getId()).stream()
                .map(slot -> new HorarioDisponivelResponse(
                        slot.getDiaSemana(),
                        slot.getHorario(),
                        !ocupados.contains(chaveSlot(slot.getDiaSemana(), slot.getHorario()))))
                .toList();
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
                .map(m -> m.getNome())
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

    private String chave(UUID professorId, String dia, String horario) {
        return professorId + "|" + dia + "|" + horario;
    }

    private String chaveSlot(String dia, String horario) {
        return dia + "|" + horario;
    }

    private AgendamentoResponse paraResponse(Agendamento agendamento) {
        return new AgendamentoResponse(
                agendamento.getId(),
                agendamento.getProfessor().getId(),
                agendamento.getProfessor().getUsuario().getNomeCompleto(),
                agendamento.getAluno().getNomeCompleto(),
                agendamento.getDiaSemana(),
                agendamento.getHorario(),
                agendamento.getModalidade(),
                agendamento.getMateria(),
                agendamento.getStatus(),
                agendamento.getCriadoEm()
        );
    }
}
