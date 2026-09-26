package com.grupo.tfc.conectapro.controller;

import com.grupo.tfc.conectapro.config.SessaoUsuario;
import com.grupo.tfc.conectapro.dto.EnderecoCepResponse;
import com.grupo.tfc.conectapro.dto.EnderecoRequest;
import com.grupo.tfc.conectapro.model.Endereco;
import com.grupo.tfc.conectapro.service.EnderecoService;
import com.grupo.tfc.conectapro.service.LocalizacaoService;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

import static org.springframework.http.HttpStatus.NOT_FOUND;

@RestController
@RequestMapping("/enderecos")
public class EnderecoController {

    private final LocalizacaoService localizacaoService;
    private final EnderecoService enderecoService;

    public EnderecoController(LocalizacaoService localizacaoService, EnderecoService enderecoService) {
        this.localizacaoService = localizacaoService;
        this.enderecoService = enderecoService;
    }

    @GetMapping("/me")
    public ResponseEntity<EnderecoCepResponse> meuEndereco(HttpSession session) {
        UUID usuarioId = SessaoUsuario.exigirUsuarioId(session);

        Endereco endereco = enderecoService.buscarPorUsuario(usuarioId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Endereço ainda não cadastrado"));

        return ResponseEntity.ok(paraResposta(endereco));
    }

    @PutMapping("/me")
    public ResponseEntity<EnderecoCepResponse> salvarMeuEndereco(@Valid @RequestBody EnderecoRequest request,
                                                                 HttpSession session) {
        UUID usuarioId = SessaoUsuario.exigirUsuarioId(session);

        return ResponseEntity.ok(paraResposta(enderecoService.salvar(usuarioId, request)));
    }

    @GetMapping("/{cep}")
    public ResponseEntity<EnderecoCepResponse> buscarPorCep(@PathVariable String cep) {
        LocalizacaoService.EnderecoCep endereco = localizacaoService.buscarEndereco(cep)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "CEP não encontrado"));

        return ResponseEntity.ok(new EnderecoCepResponse(
                endereco.cep(),
                endereco.street(),
                endereco.neighborhood(),
                endereco.city(),
                endereco.state()
        ));
    }

    private EnderecoCepResponse paraResposta(Endereco endereco) {
        return new EnderecoCepResponse(
                endereco.getCep(),
                endereco.getLogradouro(),
                endereco.getBairro(),
                endereco.getCidade(),
                endereco.getEstado()
        );
    }
}
