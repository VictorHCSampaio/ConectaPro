package com.grupo.tfc.conectapro.service;

import com.grupo.tfc.conectapro.config.UsuarioAutenticado;
import com.grupo.tfc.conectapro.dto.avaliacao.AvaliacaoRequest;
import com.grupo.tfc.conectapro.dto.avaliacao.AvaliacaoResponse;
import com.grupo.tfc.conectapro.model.Agendamento;
import com.grupo.tfc.conectapro.model.Avaliacao;
import com.grupo.tfc.conectapro.model.StatusAgendamento;
import com.grupo.tfc.conectapro.model.Usuario;
import com.grupo.tfc.conectapro.repository.AgendamentoRepository;
import com.grupo.tfc.conectapro.repository.AvaliacaoRepository;
import com.grupo.tfc.conectapro.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.CONFLICT;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
public class AvaliacaoService {

    private final AvaliacaoRepository avaliacaoRepository;
    private final UsuarioRepository usuarioRepository;
    private final AgendamentoRepository agendamentoRepository;

    public AvaliacaoService(AvaliacaoRepository avaliacaoRepository,
                            UsuarioRepository usuarioRepository,
                            AgendamentoRepository agendamentoRepository) {
        this.avaliacaoRepository = avaliacaoRepository;
        this.usuarioRepository = usuarioRepository;
        this.agendamentoRepository = agendamentoRepository;
    }

    @Transactional
    public AvaliacaoResponse avaliar(AvaliacaoRequest request) {
        UUID avaliadorId = UsuarioAutenticado.exigirUsuarioId();

        if (avaliadorId.equals(request.avaliadoId())) {
            throw new ResponseStatusException(BAD_REQUEST, "Não é possível avaliar a si mesmo");
        }

        Usuario avaliador = usuarioRepository.findById(avaliadorId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Usuário não encontrado"));

        Usuario avaliado = usuarioRepository.findById(request.avaliadoId())
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Usuário avaliado não encontrado"));

        Agendamento agendamento = agendamentoRepository.findById(request.agendamentoId())
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Agendamento não encontrado"));

        if (agendamento.getStatus() != StatusAgendamento.CONFIRMADO) {
            throw new ResponseStatusException(BAD_REQUEST, "Só é possível avaliar aulas confirmadas");
        }

        UUID alunoId = agendamento.getAluno().getId();
        UUID professorUsuarioId = agendamento.getProfessor().getUsuario().getId();

        boolean avaliadorEhParticipante = avaliadorId.equals(alunoId) || avaliadorId.equals(professorUsuarioId);
        boolean avaliadoEhParticipante = request.avaliadoId().equals(alunoId) || request.avaliadoId().equals(professorUsuarioId);

        if (!avaliadorEhParticipante || !avaliadoEhParticipante) {
            throw new ResponseStatusException(BAD_REQUEST, "Avaliador e avaliado devem ser participantes do agendamento");
        }

        if (avaliacaoRepository.existsByAvaliadorIdAndAgendamentoId(avaliadorId, request.agendamentoId())) {
            throw new ResponseStatusException(CONFLICT, "Você já avaliou este agendamento");
        }

        Avaliacao avaliacao = Avaliacao.builder()
                .avaliador(avaliador)
                .avaliado(avaliado)
                .agendamento(agendamento)
                .nota(request.nota())
                .comentario(request.comentario() != null ? request.comentario().trim() : null)
                .build();

        Avaliacao salva = avaliacaoRepository.save(avaliacao);
        return paraResponse(salva);
    }

    public List<AvaliacaoResponse> listarPorAvaliado(UUID avaliadoId) {
        return avaliacaoRepository.findByAvaliadoIdOrderByCriadoEmDesc(avaliadoId).stream()
                .map(this::paraResponse)
                .toList();
    }

    public List<AvaliacaoResponse> listarPorAgendamento(UUID agendamentoId) {
        return avaliacaoRepository.findByAgendamentoId(agendamentoId).stream()
                .map(this::paraResponse)
                .toList();
    }

    public double[] calcularMedia(UUID avaliadoId) {
        List<Avaliacao> avaliacoes = avaliacaoRepository.findByAvaliadoIdOrderByCriadoEmDesc(avaliadoId);
        if (avaliacoes.isEmpty()) {
            return new double[]{0, 0};
        }
        double media = avaliacoes.stream().mapToInt(Avaliacao::getNota).average().orElse(0);
        return new double[]{Math.round(media * 10.0) / 10.0, avaliacoes.size()};
    }

    private AvaliacaoResponse paraResponse(Avaliacao avaliacao) {
        Usuario avaliador = avaliacao.getAvaliador();
        return new AvaliacaoResponse(
                avaliacao.getId(),
                avaliador.getNomeCompleto(),
                avaliador.getAvatarUrl(),
                avaliacao.getNota(),
                avaliacao.getComentario(),
                avaliacao.getCriadoEm()
        );
    }
}
