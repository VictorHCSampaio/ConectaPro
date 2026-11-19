package com.grupo.tfc.conectapro.service;

import com.grupo.tfc.conectapro.config.UsuarioAutenticado;
import com.grupo.tfc.conectapro.dto.usuario.ExportacaoDadosDTO;
import com.grupo.tfc.conectapro.dto.usuario.PerfilAlunoRequest;
import com.grupo.tfc.conectapro.dto.usuario.PerfilAlunoResponse;
import com.grupo.tfc.conectapro.model.Agendamento;
import com.grupo.tfc.conectapro.model.Avaliacao;
import com.grupo.tfc.conectapro.model.Endereco;
import com.grupo.tfc.conectapro.model.StatusAgendamento;
import com.grupo.tfc.conectapro.model.StatusConta;
import com.grupo.tfc.conectapro.model.Usuario;
import com.grupo.tfc.conectapro.repository.AgendamentoRepository;
import com.grupo.tfc.conectapro.repository.AvaliacaoAgregado;
import com.grupo.tfc.conectapro.repository.AvaliacaoRepository;
import com.grupo.tfc.conectapro.repository.DenunciaRepository;
import com.grupo.tfc.conectapro.repository.EnderecoRepository;
import com.grupo.tfc.conectapro.repository.MensagemRepository;
import com.grupo.tfc.conectapro.repository.NotificacaoRepository;
import com.grupo.tfc.conectapro.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final EnderecoRepository enderecoRepository;
    private final AgendamentoRepository agendamentoRepository;
    private final AvaliacaoRepository avaliacaoRepository;
    private final MensagemRepository mensagemRepository;
    private final NotificacaoRepository notificacaoRepository;
    private final DenunciaRepository denunciaRepository;

    public UsuarioService(UsuarioRepository usuarioRepository,
                          EnderecoRepository enderecoRepository,
                          AgendamentoRepository agendamentoRepository,
                          AvaliacaoRepository avaliacaoRepository,
                          MensagemRepository mensagemRepository,
                          NotificacaoRepository notificacaoRepository,
                          DenunciaRepository denunciaRepository) {
        this.usuarioRepository = usuarioRepository;
        this.enderecoRepository = enderecoRepository;
        this.agendamentoRepository = agendamentoRepository;
        this.avaliacaoRepository = avaliacaoRepository;
        this.mensagemRepository = mensagemRepository;
        this.notificacaoRepository = notificacaoRepository;
        this.denunciaRepository = denunciaRepository;
    }

    public PerfilAlunoResponse buscarPerfilPublico(UUID id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Usuário não encontrado"));

        if (usuario.getStatusConta() == StatusConta.EXCLUIDO) {
            throw new ResponseStatusException(NOT_FOUND, "Usuário não encontrado");
        }

        Endereco endereco = enderecoRepository.findFirstByUsuarioId(id).orElse(null);

        int totalAulas = (int) agendamentoRepository.countByAlunoIdAndStatus(id, StatusAgendamento.CONFIRMADO);

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

    @Transactional(readOnly = true)
    public ExportacaoDadosDTO exportarMeusDados() {
        UUID id = UsuarioAutenticado.exigirUsuarioId();
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Usuário não encontrado"));

        ExportacaoDadosDTO.DadosPessoais dados = new ExportacaoDadosDTO.DadosPessoais(
                usuario.getId().toString(),
                usuario.getNomeCompleto(),
                usuario.getEmail(),
                usuario.getTipo().name(),
                usuario.getStatusConta().name(),
                usuario.getBiografia(),
                usuario.getAvatarUrl(),
                usuario.getCriadoEm()
        );

        Endereco endereco = enderecoRepository.findFirstByUsuarioId(id).orElse(null);
        ExportacaoDadosDTO.EnderecoExport enderecoExport = endereco != null
                ? new ExportacaoDadosDTO.EnderecoExport(
                        endereco.getCep(), endereco.getLogradouro(),
                        endereco.getBairro(), endereco.getCidade(), endereco.getEstado())
                : null;

        List<ExportacaoDadosDTO.AgendamentoExport> agendamentos =
                agendamentoRepository.findByAlunoIdOrderByDataHoraInicioDesc(id).stream()
                        .map(this::paraAgendamentoExport)
                        .toList();

        List<ExportacaoDadosDTO.MensagemExport> mensagens =
                mensagemRepository.buscarMensagensDoUsuario(id).stream()
                        .map(m -> new ExportacaoDadosDTO.MensagemExport(
                                m.getRemetente().getNomeCompleto(),
                                m.getDestinatario().getNomeCompleto(),
                                m.getConteudo(),
                                m.getDataEnvio()))
                        .toList();

        List<ExportacaoDadosDTO.AvaliacaoExport> avaliacoesFeitas =
                avaliacaoRepository.findByAvaliadorIdOrderByCriadoEmDesc(id).stream()
                        .map(this::paraAvaliacaoExport)
                        .toList();

        List<ExportacaoDadosDTO.AvaliacaoExport> avaliacoesRecebidas =
                avaliacaoRepository.findByAvaliadoIdOrderByCriadoEmDesc(id).stream()
                        .map(this::paraAvaliacaoExport)
                        .toList();

        List<ExportacaoDadosDTO.DenunciaExport> denuncias =
                denunciaRepository.findByDenuncianteIdOrDenunciadoId(id, id).stream()
                        .map(d -> new ExportacaoDadosDTO.DenunciaExport(
                                d.getDenunciante().getId().equals(id) ? "denunciante" : "denunciado",
                                d.getMotivo().name(),
                                d.getDescricao(),
                                d.getStatus().name(),
                                d.getDataCriacao()))
                        .toList();

        List<ExportacaoDadosDTO.NotificacaoExport> notificacoes =
                notificacaoRepository.findByUsuarioIdOrderByDataCriacaoDesc(id).stream()
                        .map(n -> new ExportacaoDadosDTO.NotificacaoExport(
                                n.getTitulo(), n.getMensagem(), n.getTipo().name(),
                                n.isLida(), n.getDataCriacao()))
                        .toList();

        return new ExportacaoDadosDTO(
                dados, enderecoExport, agendamentos, mensagens,
                avaliacoesFeitas, avaliacoesRecebidas, denuncias, notificacoes);
    }

    @Transactional
    public void excluirMinhaConta() {
        UUID id = UsuarioAutenticado.exigirUsuarioId();
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Usuário não encontrado"));

        if (usuario.getStatusConta() == StatusConta.EXCLUIDO) {
            throw new ResponseStatusException(BAD_REQUEST, "Conta já foi excluída");
        }

        usuario.setNomeCompleto("Usuário Removido");
        usuario.setEmail("excluido_" + id + "@removido.local");
        usuario.setBiografia(null);
        usuario.setAvatarUrl(null);
        usuario.setSenhaHash("");
        usuario.setSegredoTotp(null);
        usuario.setTotpAtivo(false);
        usuario.setStatusConta(StatusConta.EXCLUIDO);

        enderecoRepository.findFirstByUsuarioId(id).ifPresent(enderecoRepository::delete);

        usuarioRepository.save(usuario);
    }

    private ExportacaoDadosDTO.AgendamentoExport paraAgendamentoExport(Agendamento a) {
        return new ExportacaoDadosDTO.AgendamentoExport(
                a.getId().toString(),
                a.getProfessor().getUsuario().getNomeCompleto(),
                a.getAluno().getNomeCompleto(),
                a.getMateria(),
                a.getModalidade(),
                a.getStatus().name(),
                a.getDataHoraInicio(),
                a.getCriadoEm());
    }

    private ExportacaoDadosDTO.AvaliacaoExport paraAvaliacaoExport(Avaliacao av) {
        return new ExportacaoDadosDTO.AvaliacaoExport(
                av.getAvaliador().getNomeCompleto(),
                av.getAvaliado().getNomeCompleto(),
                av.getNota(),
                av.getComentario(),
                av.getCriadoEm());
    }

    private double[] calcularRating(UUID usuarioId) {
        AvaliacaoAgregado agregado = avaliacaoRepository.agregarPorAvaliado(usuarioId);
        if (agregado == null || agregado.quantidade() == 0) {
            return new double[]{0, 0};
        }
        double media = (double) agregado.soma() / agregado.quantidade();
        return new double[]{Math.round(media * 10.0) / 10.0, agregado.quantidade()};
    }
}
