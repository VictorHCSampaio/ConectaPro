package com.grupo.tfc.conectapro.controller;

import com.grupo.tfc.conectapro.dto.denuncia.DenunciaResponse;
import com.grupo.tfc.conectapro.dto.moderacao.AplicarTimeoutRequest;
import com.grupo.tfc.conectapro.dto.moderacao.AtualizarStatusDenunciaRequest;
import com.grupo.tfc.conectapro.dto.moderacao.BanirUsuarioRequest;
import com.grupo.tfc.conectapro.dto.moderacao.ModeracaoUsuarioResponse;
import com.grupo.tfc.conectapro.service.ModeracaoService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminModeracaoController {

    private final ModeracaoService moderacaoService;

    public AdminModeracaoController(ModeracaoService moderacaoService) {
        this.moderacaoService = moderacaoService;
    }

    @PostMapping("/usuarios/{id}/ban")
    public ResponseEntity<ModeracaoUsuarioResponse> banir(@PathVariable UUID id,
                                                          @Valid @RequestBody BanirUsuarioRequest request) {
        return ResponseEntity.ok(moderacaoService.banir(id, request.motivo()));
    }

    @PostMapping("/usuarios/{id}/unban")
    public ResponseEntity<ModeracaoUsuarioResponse> desbanir(@PathVariable UUID id) {
        return ResponseEntity.ok(moderacaoService.desbanir(id));
    }

    @PostMapping("/usuarios/{id}/timeout")
    public ResponseEntity<ModeracaoUsuarioResponse> timeout(@PathVariable UUID id,
                                                            @Valid @RequestBody AplicarTimeoutRequest request) {
        return ResponseEntity.ok(moderacaoService.aplicarTimeout(id, request));
    }

    @PostMapping("/denuncias/{id}/recomendar-bo")
    public ResponseEntity<DenunciaResponse> recomendarBoletim(@PathVariable UUID id) {
        return ResponseEntity.ok(moderacaoService.recomendarBoletim(id));
    }

    @PatchMapping("/denuncias/{id}/status")
    public ResponseEntity<DenunciaResponse> atualizarStatus(@PathVariable UUID id,
                                                            @Valid @RequestBody AtualizarStatusDenunciaRequest request) {
        return ResponseEntity.ok(moderacaoService.atualizarStatus(id, request));
    }
}
