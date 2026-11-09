package com.grupo.tfc.conectapro.service;

import com.grupo.tfc.conectapro.model.TipoUsuario;
import com.grupo.tfc.conectapro.repository.UsuarioRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DashboardServiceTest {

    @Mock
    private UsuarioRepository usuarioRepository;

    @InjectMocks
    private DashboardService dashboardService;

    @Test
    void resumo_contaAlunosEProfessoresPelaRole() {
        when(usuarioRepository.countByTipo(TipoUsuario.ALUNO)).thenReturn(12L);
        when(usuarioRepository.countByTipo(TipoUsuario.PROFESSOR)).thenReturn(3L);

        var resumo = dashboardService.resumo();

        assertThat(resumo.totalAlunos()).isEqualTo(12);
        assertThat(resumo.totalProfessores()).isEqualTo(3);
    }
}