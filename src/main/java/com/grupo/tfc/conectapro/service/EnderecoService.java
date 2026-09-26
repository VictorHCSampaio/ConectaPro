package com.grupo.tfc.conectapro.service;

import com.grupo.tfc.conectapro.dto.EnderecoRequest;
import com.grupo.tfc.conectapro.model.Endereco;
import com.grupo.tfc.conectapro.model.Usuario;
import com.grupo.tfc.conectapro.repository.EnderecoRepository;
import com.grupo.tfc.conectapro.repository.UsuarioRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
public class EnderecoService {

    private static final Logger logger = LoggerFactory.getLogger(EnderecoService.class);

    private final EnderecoRepository enderecoRepository;
    private final UsuarioRepository usuarioRepository;
    private final LocalizacaoService localizacaoService;

    public EnderecoService(EnderecoRepository enderecoRepository,
                           UsuarioRepository usuarioRepository,
                           LocalizacaoService localizacaoService) {
        this.enderecoRepository = enderecoRepository;
        this.usuarioRepository = usuarioRepository;
        this.localizacaoService = localizacaoService;
    }

    @Transactional
    public Endereco salvar(UUID usuarioId, EnderecoRequest request) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Usuário não encontrado"));

        return salvar(usuario, request);
    }

    @Transactional
    public Endereco salvar(Usuario usuario, EnderecoRequest request) {
        Endereco endereco = enderecoRepository.findFirstByUsuarioId(usuario.getId())
                .orElseGet(() -> {
                    Endereco novo = new Endereco();
                    novo.setUsuario(usuario);
                    return novo;
                });

        boolean cepAlterado = !request.cep().equals(endereco.getCep());

        endereco.setCep(request.cep());
        endereco.setLogradouro(request.street());
        endereco.setBairro(request.neighborhood());
        endereco.setCidade(request.city());
        endereco.setEstado(request.state());

        if (cepAlterado) {
            endereco.setLatitude(null);
            endereco.setLongitude(null);
        }

        aplicarCoordenada(endereco);

        return enderecoRepository.save(endereco);
    }

    @Transactional(readOnly = true)
    public Optional<Endereco> buscarPorUsuario(UUID usuarioId) {
        return enderecoRepository.findFirstByUsuarioId(usuarioId);
    }

    @Transactional
    public int preencherCoordenadasPendentes() {
        List<Endereco> pendentes = enderecoRepository.findByLatitudeIsNull();
        int preenchidos = 0;

        for (Endereco endereco : pendentes) {
            aplicarCoordenada(endereco);
            if (endereco.getLatitude() != null) {
                enderecoRepository.save(endereco);
                preenchidos++;
            }
        }

        if (!pendentes.isEmpty()) {
            logger.info("Coordenadas preenchidas. pendentes={} preenchidos={}", pendentes.size(), preenchidos);
        }

        return preenchidos;
    }

    private void aplicarCoordenada(Endereco endereco) {
        if (endereco.getLatitude() != null && endereco.getLongitude() != null) {
            return;
        }

        localizacaoService.buscarCoordenada(endereco.getCep()).ifPresent(coordenada -> {
            endereco.setLatitude(coordenada.latitude());
            endereco.setLongitude(coordenada.longitude());
        });
    }
}
