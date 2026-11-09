package com.grupo.tfc.conectapro.service;

import com.grupo.tfc.conectapro.dto.DashboardResumoDTO;
import com.grupo.tfc.conectapro.model.TipoUsuario;
import com.grupo.tfc.conectapro.repository.UsuarioRepository;
import org.springframework.stereotype.Service;

@Service
public class DashboardService {

    private final UsuarioRepository usuarioRepository;

    public DashboardService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    public DashboardResumoDTO resumo() {
        return new DashboardResumoDTO(
                usuarioRepository.countByTipo(TipoUsuario.ALUNO),
                usuarioRepository.countByTipo(TipoUsuario.PROFESSOR)
        );
    }
}
