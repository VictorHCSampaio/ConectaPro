package com.grupo.tfc.conectapro.service;

import com.grupo.tfc.conectapro.dto.EnderecoRequest;
import com.grupo.tfc.conectapro.model.Endereco;
import com.grupo.tfc.conectapro.model.TipoUsuario;
import com.grupo.tfc.conectapro.model.Usuario;
import com.grupo.tfc.conectapro.repository.EnderecoRepository;
import com.grupo.tfc.conectapro.repository.UsuarioRepository;
import com.grupo.tfc.conectapro.service.LocalizacaoService.Coordenada;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EnderecoServiceTest {

    @Mock private EnderecoRepository enderecoRepository;
    @Mock private UsuarioRepository usuarioRepository;
    @Mock private LocalizacaoService localizacaoService;
    @Mock private AuditoriaService auditoriaService;

    @InjectMocks
    private EnderecoService enderecoService;

    private Usuario usuarioPadrao;
    private Endereco enderecoExistente;

    @BeforeEach
    void setUp() {
        usuarioPadrao = Usuario.builder()
                .id(UUID.randomUUID())
                .nomeCompleto("Maria Souza")
                .email("maria@email.com")
                .tipo(TipoUsuario.ALUNO)
                .build();

        enderecoExistente = new Endereco();
        enderecoExistente.setUsuario(usuarioPadrao);
        enderecoExistente.setCep("01000-000");
        enderecoExistente.setLogradouro("Rua Exemplo");
        enderecoExistente.setBairro("Centro");
        enderecoExistente.setCidade("São Paulo");
        enderecoExistente.setEstado("SP");
        enderecoExistente.setLatitude(10.0);
        enderecoExistente.setLongitude(20.0);
    }

    
    // Cenário 1 — Caminho Feliz: CEP inalterado preserva coordenadas existentes
    

    @Test
    void deveManterCoordenadasQuandoCepNaoForAlterado() {
        // Arrange
        EnderecoRequest request = new EnderecoRequest(
                "01000-000", "Rua Exemplo", "Centro", "São Paulo", "SP");

        when(enderecoRepository.findFirstByUsuarioId(usuarioPadrao.getId()))
                .thenReturn(Optional.of(enderecoExistente));
        when(enderecoRepository.save(any(Endereco.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        Endereco resultado = enderecoService.salvar(usuarioPadrao, request);

        // Assert
        assertThat(resultado.getLatitude()).isEqualTo(10.0);
        assertThat(resultado.getLongitude()).isEqualTo(20.0);
        verify(localizacaoService, never()).buscarCoordenada(any());
    }

    
    // Cenário 2 — Fluxo Alternativo: CEP alterado zera e busca novas coordenadas
    

    @Test
    void deveZerarEAtualizarCoordenadasQuandoCepForAlterado() {
        // Arrange
        EnderecoRequest request = new EnderecoRequest(
                "02000-000", "Nova Rua", "Novo Bairro", "São Paulo", "SP");

        Coordenada novasCoordenadas = new Coordenada(-23.5617, -46.6553);

        when(enderecoRepository.findFirstByUsuarioId(usuarioPadrao.getId()))
                .thenReturn(Optional.of(enderecoExistente));
        when(localizacaoService.buscarCoordenada("02000-000"))
                .thenReturn(Optional.of(novasCoordenadas));
        when(enderecoRepository.save(any(Endereco.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        ArgumentCaptor<Endereco> captor = ArgumentCaptor.forClass(Endereco.class);

        // Act
        enderecoService.salvar(usuarioPadrao, request);

        // Assert
        verify(localizacaoService).buscarCoordenada("02000-000");
        verify(enderecoRepository).save(captor.capture());
        Endereco enderecoSalvo = captor.getValue();
        assertThat(enderecoSalvo.getLatitude()).isEqualTo(-23.5617);
        assertThat(enderecoSalvo.getLongitude()).isEqualTo(-46.6553);
    }

    
    // Cenário 3 — Caso-Limite: nenhum endereço pendente → zero iterações
    

    @Test
    void deveRetornarZeroENaoSalvarNadaQuandoNaoHouverEnderecosPendentes() {
        // Arrange
        when(enderecoRepository.findByLatitudeIsNull()).thenReturn(Collections.emptyList());

        // Act
        int resultado = enderecoService.preencherCoordenadasPendentes();

        // Assert
        assertEquals(0, resultado);
        verify(enderecoRepository, never()).save(any());
    }
}
