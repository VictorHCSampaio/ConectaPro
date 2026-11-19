package com.grupo.tfc.conectapro.service;

import com.grupo.tfc.conectapro.dto.professor.DisponibilidadeRequest;
import com.grupo.tfc.conectapro.dto.professor.EnderecoProfessorRequest;
import com.grupo.tfc.conectapro.dto.professor.MateriaProfessorRequest;
import com.grupo.tfc.conectapro.dto.professor.PerfilProfessorRequest;
import com.grupo.tfc.conectapro.dto.professor.ProfessorResumoResponse;
import com.grupo.tfc.conectapro.model.AcaoAuditoria;
import com.grupo.tfc.conectapro.model.Materia;
import com.grupo.tfc.conectapro.dto.professor.StatusCadastroResponse;
import com.grupo.tfc.conectapro.model.Professor;
import com.grupo.tfc.conectapro.model.StatusComprovacao;
import com.grupo.tfc.conectapro.model.StatusConta;
import com.grupo.tfc.conectapro.model.TipoUsuario;
import com.grupo.tfc.conectapro.model.Usuario;
import com.grupo.tfc.conectapro.repository.EnderecoRepository;
import com.grupo.tfc.conectapro.repository.MateriaRepository;
import com.grupo.tfc.conectapro.repository.ProfessorDisponibilidadeRepository;
import com.grupo.tfc.conectapro.repository.ProfessorMateriaRepository;
import com.grupo.tfc.conectapro.repository.ProfessorRepository;
import com.grupo.tfc.conectapro.repository.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.ArgumentMatchers.nullable;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProfessorServiceTest {

    @Mock private UsuarioRepository usuarioRepository;
    @Mock private ProfessorRepository professorRepository;
    @Mock private MateriaRepository materiaRepository;
    @Mock private ProfessorMateriaRepository professorMateriaRepository;
    @Mock private ProfessorDisponibilidadeRepository disponibilidadeRepository;
    @Mock private EnderecoRepository enderecoRepository;
    @Mock private LocalizacaoService localizacaoService;
    @Mock private EnderecoService enderecoService;
    @Mock private AuditoriaService auditoriaService;
    @Mock private ArmazenamentoS3Service armazenamentoS3Service;
    @Mock private AvaliacaoService avaliacaoService;

    @InjectMocks
    private ProfessorService professorService;

    private UUID usuarioId;
    private Usuario usuarioProfessor;
    private Usuario usuarioAluno;
    private Professor professorExistente;
    private Materia materiaExistente;

    @BeforeEach
    void setUp() {
        usuarioId = UUID.randomUUID();

        usuarioProfessor = Usuario.builder()
                .id(usuarioId)
                .nomeCompleto("João Silva")
                .email("joao@professor.com")
                .tipo(TipoUsuario.PROFESSOR)
                .build();

        usuarioAluno = Usuario.builder()
                .id(usuarioId)
                .nomeCompleto("Maria Aluna")
                .email("maria@aluno.com")
                .tipo(TipoUsuario.ALUNO)
                .build();

        professorExistente = new Professor();
        professorExistente.setId(UUID.randomUUID());
        professorExistente.setUsuario(usuarioProfessor);
        professorExistente.setCriadoEm(OffsetDateTime.now());
        professorExistente.setVerificado(false);

        materiaExistente = new Materia();
        materiaExistente.setId(1);
        materiaExistente.setNome("Matemática");
        materiaExistente.setAtiva(true);
    }

    
    // Cenário 1 — Violação: aluno tenta salvar perfil de professor
    

    @Test
    void deveLancarExcecaoQuandoAlunoTentaSalvarPerfil() {
        // Arrange
        PerfilProfessorRequest request = buildRequest("PARTICULARES", "ONLINE", 100.0);
        when(usuarioRepository.findById(usuarioId)).thenReturn(Optional.of(usuarioAluno));

        // Act
        ResponseStatusException excecao = assertThrows(
                ResponseStatusException.class,
                () -> professorService.salvarPerfil(usuarioId, request)
        );

        // Assert
        assertThat(excecao.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
        verify(professorRepository, never()).save(any());
        verify(auditoriaService).registrar(
                eq(AcaoAuditoria.ACESSO_NEGADO),
                eq(usuarioId),
                eq("PROFESSOR"),
                isNull(),
                eq("configuração de perfil por usuário que não é professor")
        );
    }

    
    // Cenário 2 — Caminho Feliz: modelo PARTICULARES → precoHoraParticular
    

    @Test
    void deveSalvarPrecoParticularQuandoModeloForParticulares() {
        // Arrange
        PerfilProfessorRequest request = buildRequest("PARTICULARES", "ONLINE", 150.0);
        configurarMocksParaSalvarPerfil();
        ArgumentCaptor<Professor> captor = ArgumentCaptor.forClass(Professor.class);

        // Act
        professorService.salvarPerfil(usuarioId, request);

        // Assert
        verify(professorRepository).save(captor.capture());
        Professor professorSalvo = captor.getValue();
        assertThat(professorSalvo.getPrecoHoraParticular())
                .isEqualByComparingTo(BigDecimal.valueOf(150.0));
        assertThat(professorSalvo.getPrecoHoraEscola()).isNull();
    }

    
    // Cenário 3 — Caminho Feliz: modelo INSTITUICOES → precoHoraEscola
    

    @Test
    void deveSalvarPrecoEscolaQuandoModeloForInstituicoes() {
        // Arrange
        PerfilProfessorRequest request = buildRequest("INSTITUICOES", "ONLINE", 150.0);
        configurarMocksParaSalvarPerfil();
        ArgumentCaptor<Professor> captor = ArgumentCaptor.forClass(Professor.class);

        // Act
        professorService.salvarPerfil(usuarioId, request);

        // Assert
        verify(professorRepository).save(captor.capture());
        Professor professorSalvo = captor.getValue();
        assertThat(professorSalvo.getPrecoHoraEscola())
                .isEqualByComparingTo(BigDecimal.valueOf(150.0));
        assertThat(professorSalvo.getPrecoHoraParticular()).isNull();
    }

    
    // Cenário 4 — Caso-Limite: gerarIniciais via listarProfessores (visitante)
    

    @Test
    void deveGerarIniciaisCorretamenteParaNomesIrregulares() {
        // Arrange
        Professor profA = criarProfessor("A");
        Professor profJoao = criarProfessor("João");
        Professor profAna = criarProfessor("Ana Paula Silva");

        when(professorRepository.findAtivosComUsuario()).thenReturn(List.of(profA, profJoao, profAna));
        when(enderecoRepository.findByUsuarioIdIn(any())).thenReturn(List.of());
        when(localizacaoService.buscarCoordenada(nullable(String.class))).thenReturn(Optional.empty());
        when(professorMateriaRepository.findByProfessorIdIn(any())).thenReturn(List.of());
        when(disponibilidadeRepository.findByProfessorIdIn(any())).thenReturn(List.of());
        when(avaliacaoService.calcularMedia(any())).thenReturn(new double[]{0.0, 0});

        // Act
        List<ProfessorResumoResponse> resultado = professorService.listarProfessores(null);

        // Assert
        assertThat(resultado).hasSize(3);
        assertThat(resultado)
                .extracting(ProfessorResumoResponse::name)
                .containsOnly("");
        assertThat(resultado)
                .extracting(ProfessorResumoResponse::initials)
                .containsExactlyInAnyOrder("A", "JO", "AS");
    }

    @Test
    void listarProfessores_ocultaContaAdmin() {
        Professor professor = criarProfessor("Ana Paula Silva");
        Professor admin = criarProfessor("Admin Oculto");
        admin.getUsuario().setAdmin(true);

        when(professorRepository.findAtivosComUsuario()).thenReturn(List.of(professor, admin));
        when(enderecoRepository.findByUsuarioIdIn(any())).thenReturn(List.of());
        when(localizacaoService.buscarCoordenada(nullable(String.class))).thenReturn(Optional.empty());
        when(professorMateriaRepository.findByProfessorIdIn(any())).thenReturn(List.of());
        when(disponibilidadeRepository.findByProfessorIdIn(any())).thenReturn(List.of());
        when(avaliacaoService.calcularMedia(any())).thenReturn(new double[]{0.0, 0});

        List<ProfessorResumoResponse> resultado = professorService.listarProfessores(UUID.randomUUID());

        assertThat(resultado).extracting(ProfessorResumoResponse::name).containsExactly("Ana Paula Silva");
    }

    @Test
    void listarProfessores_ocultaOProprioProfessorLogado() {
        Professor proprio = criarProfessor("Eu Mesmo");
        Professor outro = criarProfessor("Ana Paula Silva");
        UUID logadoId = proprio.getUsuario().getId();

        when(usuarioRepository.findById(logadoId)).thenReturn(Optional.of(proprio.getUsuario()));
        when(professorRepository.findAtivosComUsuario()).thenReturn(List.of(proprio, outro));
        when(enderecoRepository.findByUsuarioIdIn(any())).thenReturn(List.of());
        when(localizacaoService.buscarCoordenada(nullable(String.class))).thenReturn(Optional.empty());
        when(professorMateriaRepository.findByProfessorIdIn(any())).thenReturn(List.of());
        when(disponibilidadeRepository.findByProfessorIdIn(any())).thenReturn(List.of());
        when(avaliacaoService.calcularMedia(any())).thenReturn(new double[]{0.0, 0});

        List<ProfessorResumoResponse> resultado = professorService.listarProfessores(logadoId);

        assertThat(resultado).extracting(ProfessorResumoResponse::name).containsExactly("Ana Paula Silva");
    }

    @Test
    void listarProfessores_alunoVeTodosOsProfessoresAtivos() {
        Professor primeiro = criarProfessor("Ana Paula Silva");
        Professor segundo = criarProfessor("João Silva");
        Usuario aluno = Usuario.builder()
                .id(UUID.randomUUID())
                .nomeCompleto("Maria Aluna")
                .email("maria@aluno.com")
                .tipo(TipoUsuario.ALUNO)
                .build();

        when(usuarioRepository.findById(aluno.getId())).thenReturn(Optional.of(aluno));
        when(professorRepository.findAtivosComUsuario()).thenReturn(List.of(primeiro, segundo));
        when(enderecoRepository.findByUsuarioIdIn(any())).thenReturn(List.of());
        when(localizacaoService.buscarCoordenada(nullable(String.class))).thenReturn(Optional.empty());
        when(professorMateriaRepository.findByProfessorIdIn(any())).thenReturn(List.of());
        when(disponibilidadeRepository.findByProfessorIdIn(any())).thenReturn(List.of());
        when(avaliacaoService.calcularMedia(any())).thenReturn(new double[]{0.0, 0});

        List<ProfessorResumoResponse> resultado = professorService.listarProfessores(aluno.getId());

        assertThat(resultado).extracting(ProfessorResumoResponse::name)
                .containsExactlyInAnyOrder("Ana Paula Silva", "João Silva");
    }

    @Test
    void enviarCertificado_professorAtivo_atualizaNome() {
        usuarioProfessor.setStatusConta(StatusConta.ATIVO);
        when(usuarioRepository.findById(usuarioId)).thenReturn(Optional.of(usuarioProfessor));
        when(professorRepository.findByUsuarioId(usuarioId)).thenReturn(Optional.of(professorExistente));
        when(professorRepository.save(any(Professor.class))).thenAnswer(invocation -> invocation.getArgument(0));
        MockMultipartFile arquivo = new MockMultipartFile("file", "diploma.jpg", "image/jpeg", new byte[] {1, 2, 3});

        professorService.enviarCertificado(usuarioId, arquivo);

        assertThat(professorExistente.getCertificadoNome()).isEqualTo("diploma.jpg");
        assertThat(professorExistente.getJustificativaSemCertificado()).isNull();
        assertThat(professorExistente.getStatusComprovacao()).isEqualTo(StatusComprovacao.PENDENTE);
        assertThat(professorExistente.isComprovacaoVerificada()).isFalse();
        verify(armazenamentoS3Service).enviarCertificado(professorExistente.getId(), arquivo);
        verify(usuarioRepository).save(usuarioProfessor);
    }

    @Test
    void enviarCertificado_contaBanida_retorna403() {
        usuarioProfessor.setStatusConta(StatusConta.BANIDO);
        when(usuarioRepository.findById(usuarioId)).thenReturn(Optional.of(usuarioProfessor));

        ResponseStatusException excecao = assertThrows(
                ResponseStatusException.class,
                () -> professorService.enviarCertificado(usuarioId, new MockMultipartFile("file", new byte[] {1}))
        );

        assertThat(excecao.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
        verify(armazenamentoS3Service, never()).enviarCertificado(any(), any());
    }

    @Test
    void enviarJustificativa_limpaCertificadoNomeERemoveArquivoDoS3() {
        usuarioProfessor.setStatusConta(StatusConta.EM_ANALISE);
        professorExistente.setCertificadoNome("diploma.png");
        when(usuarioRepository.findById(usuarioId)).thenReturn(Optional.of(usuarioProfessor));
        when(professorRepository.findByUsuarioId(usuarioId)).thenReturn(Optional.of(professorExistente));
        when(professorRepository.save(any(Professor.class))).thenAnswer(invocation -> invocation.getArgument(0));

        professorService.enviarJustificativa(usuarioId, "Tenho experiência e quero conversar com o administrador.");

        assertThat(professorExistente.getCertificadoNome()).isNull();
        assertThat(professorExistente.getJustificativaSemCertificado())
                .isEqualTo("Tenho experiência e quero conversar com o administrador.");
        verify(armazenamentoS3Service).removerCertificado(professorExistente.getId());
    }

    @Test
    void reenviarParaAnalise_semCertificadoNemJustificativa_retorna400() {
        usuarioProfessor.setStatusConta(StatusConta.REJEITADO);
        when(usuarioRepository.findById(usuarioId)).thenReturn(Optional.of(usuarioProfessor));
        when(professorRepository.findByUsuarioId(usuarioId)).thenReturn(Optional.of(professorExistente));

        ResponseStatusException excecao = assertThrows(
                ResponseStatusException.class,
                () -> professorService.reenviarParaAnalise(usuarioId)
        );

        assertThat(excecao.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(excecao.getReason()).isEqualTo(
                "É obrigatório enviar o certificado ou solicitar uma conversa com o administrador antes de enviar para análise.");
        verify(usuarioRepository, never()).save(any());
    }

    @Test
    void statusCadastro_comJustificativaSemCertificado_marcaSolicitarConversaAdmin() {
        usuarioProfessor.setStatusConta(StatusConta.EM_ANALISE);
        professorExistente.setCertificadoNome(null);
        professorExistente.setJustificativaSemCertificado("Quero uma conversa de avaliação com a equipe.");
        when(usuarioRepository.findById(usuarioId)).thenReturn(Optional.of(usuarioProfessor));
        when(professorRepository.findByUsuarioId(usuarioId)).thenReturn(Optional.of(professorExistente));

        StatusCadastroResponse status = professorService.statusCadastro(usuarioId);

        assertThat(status.certificadoEnviado()).isFalse();
        assertThat(status.solicitarConversaAdmin()).isTrue();
        assertThat(status.comprovacaoPendente()).isFalse();
    }

    @Test
    void statusCadastro_semCertificadoNemJustificativa_marcaComprovacaoPendente() {
        usuarioProfessor.setStatusConta(StatusConta.EM_ANALISE);
        when(usuarioRepository.findById(usuarioId)).thenReturn(Optional.of(usuarioProfessor));
        when(professorRepository.findByUsuarioId(usuarioId)).thenReturn(Optional.empty());

        StatusCadastroResponse status = professorService.statusCadastro(usuarioId);

        assertThat(status.solicitarConversaAdmin()).isFalse();
        assertThat(status.comprovacaoPendente()).isTrue();
    }

    
    // Helpers privados
    

    private void configurarMocksParaSalvarPerfil() {
        when(usuarioRepository.findById(usuarioId)).thenReturn(Optional.of(usuarioProfessor));
        when(professorRepository.findByUsuarioId(usuarioId)).thenReturn(Optional.of(professorExistente));
        when(professorRepository.save(any(Professor.class))).thenReturn(professorExistente);
        when(materiaRepository.findFirstByNomeIgnoreCase(any())).thenReturn(Optional.of(materiaExistente));
        when(professorMateriaRepository.findByProfessorId(any())).thenReturn(List.of());
        when(disponibilidadeRepository.findByProfessorId(any())).thenReturn(List.of());
        when(enderecoRepository.findFirstByUsuarioId(any())).thenReturn(Optional.empty());
    }

    private PerfilProfessorRequest buildRequest(String teachingModel, String modality, double pricePerHour) {
        EnderecoProfessorRequest address = new EnderecoProfessorRequest(
                "01310100", "Av. Paulista", "Bela Vista", "São Paulo", "SP"
        );
        return new PerfilProfessorRequest(
                "João Silva",
                "(11) 99999-9999",
                "Biografia de teste com mais de cinquenta caracteres obrigatórios para a validação.",
                List.of(new MateriaProfessorRequest("Matemática", null, "BASICO")),
                teachingModel,
                List.of(modality),
                pricePerHour,
                address,
                List.of(new DisponibilidadeRequest("seg", "08:00")),
                null
        );
    }

    private Professor criarProfessor(String nomeCompleto) {
        Usuario usuario = Usuario.builder()
                .id(UUID.randomUUID())
                .nomeCompleto(nomeCompleto)
                .email(nomeCompleto.toLowerCase().replace(" ", ".") + "@email.com")
                .tipo(TipoUsuario.PROFESSOR)
                .build();

        Professor professor = new Professor();
        professor.setId(UUID.randomUUID());
        professor.setUsuario(usuario);
        professor.setVerificado(false);
        return professor;
    }
}
