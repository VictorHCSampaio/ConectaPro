package com.grupo.tfc.conectapro.controller;

import com.grupo.tfc.conectapro.dto.denuncia.DenunciaResponse;
import com.grupo.tfc.conectapro.dto.denuncia.RegistrarDenunciaRequest;
import com.grupo.tfc.conectapro.service.DenunciaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/denuncias")
public class DenunciaController {

    private final DenunciaService denunciaService;

    public DenunciaController(DenunciaService denunciaService) {
        this.denunciaService = denunciaService;
    }

    @PostMapping
    public ResponseEntity<DenunciaResponse> registrar(@Valid @RequestBody RegistrarDenunciaRequest request) {
        // denunciante sai do token, o body so aponta o professor
        return ResponseEntity.status(HttpStatus.CREATED).body(denunciaService.registrar(request));
    }
}
