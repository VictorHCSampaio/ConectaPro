package com.grupo.tfc.conectapro.service;

import com.grupo.tfc.conectapro.config.UsuarioAutenticado;
import com.grupo.tfc.conectapro.dto.usuario.PerfilAlunoRequest;
import com.grupo.tfc.conectapro.dto.usuario.PerfilAlunoResponse;
import com.grupo.tfc.conectapro.model.Avaliacao;
import com.grupo.tfc.conectapro.model.Endereco;
import com.grupo.tfc.conectapro.model.StatusAgendamento;
import com.grupo.tfc.conectapro.model.Usuario;
import com.grupo.tfc.conectapro.repository.AgendamentoRepository;
import com.grupo.tfc.conectapro.repository.AvaliacaoRepository;
import com.grupo.tfc.conectapro.repository.EnderecoRepository;
import com.grupo.tfc.conectapro.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final EnderecoRepository enderecoRepository;
    private final AgendamentoRepository agendamentoRepository;
    private final AvaliacaoRepository avaliacaoRepository;

    public UsuarioService(UsuarioRepository usuarioRepository,
                          EnderecoRepository enderecoRepository,
                          AgendamentoRepository agendamentoRepository,
                          AvaliacaoRepository avaliacaoRepository) {
        this.usuarioRepository = usuarioRepository;
        this.enderecoRepository = enderecoRepository;
        this.agendamentoRepository = agendamentoRepository;
        this.avaliacaoRepository = avaliacaoRepository;
    }

    public PerfilAlunoResponse buscarPerfilPublico(UUID id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Usuário não encontrado"));

        Endereco endereco = enderecoRepository.findFirstByUsuarioId(id).orElse(null);

        int totalAulas = (int) agendamentoRepository.findByAlunoIdOrderByCriadoEmDesc(id).stream()
                .filter(a -> a.getStatus() == StatusAgendamento.CONFIRMADO)
                .count();

        double[] ratingInfo = calcularRating(id);

        return new PerfilAlunoResponse(
                usuario.getId(),
                usuario.getNomeCompleto(),
                usuario.getEmail(),
                usuario.getTipo().name(),
                usuario.getBiografia(),
                usuario.getAvatarUrl(),
                endereco != null ? endereco.getCidade() : null,
                endereco != null ? endereco.getBairro() : null,
                usuario.getCriadoEm(),
                totalAulas,
                ratingInfo[0],
                (int) ratingInfo[1]
        );
    }

    public PerfilAlunoResponse buscarMeuPerfil() {
        UUID id = UsuarioAutenticado.exigirUsuarioId();
        return buscarPerfilPublico(id);
    }

    @Transactional
    public PerfilAlunoResponse atualizarMeuPerfil(PerfilAlunoRequest request) {
        UUID id = UsuarioAutenticado.exigirUsuarioId();
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Usuário não encontrado"));

        if (request.biografia() != null) {
            usuario.setBiografia(request.biografia().trim());
        }
        if (request.avatarUrl() != null) {
            usuario.setAvatarUrl(request.avatarUrl().trim());
        }

        usuarioRepository.save(usuario);
        return buscarMeuPerfil();
    }

    private double[] calcularRating(UUID usuarioId) {
        List<Avaliacao> avaliacoes = avaliacaoRepository.findByAvaliadoIdOrderByCriadoEmDesc(usuarioId);
        if (avaliacoes.isEmpty()) {
            return new double[]{0, 0};
        }
        double media = avaliacoes.stream().mapToInt(Avaliacao::getNota).average().orElse(0);
        return new double[]{Math.round(media * 10.0) / 10.0, avaliacoes.size()};
    }
}
