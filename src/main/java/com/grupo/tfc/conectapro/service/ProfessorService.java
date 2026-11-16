package com.grupo.tfc.conectapro.service;

import com.grupo.tfc.conectapro.dto.EnderecoRequest;
import com.grupo.tfc.conectapro.dto.professor.AvatarResponse;
import com.grupo.tfc.conectapro.dto.professor.DisponibilidadeRequest;
import com.grupo.tfc.conectapro.dto.professor.EnderecoProfessorRequest;
import com.grupo.tfc.conectapro.dto.professor.MateriaProfessorRequest;
import com.grupo.tfc.conectapro.dto.professor.PerfilProfessorRequest;
import com.grupo.tfc.conectapro.dto.professor.PerfilProfessorResponse;
import com.grupo.tfc.conectapro.dto.professor.ProfessorResumoResponse;
import com.grupo.tfc.conectapro.dto.professor.StatusCadastroResponse;
import com.grupo.tfc.conectapro.model.AcaoAuditoria;
import com.grupo.tfc.conectapro.model.Endereco;
import com.grupo.tfc.conectapro.model.Materia;
import com.grupo.tfc.conectapro.model.Professor;
import com.grupo.tfc.conectapro.model.ProfessorDisponibilidade;
import com.grupo.tfc.conectapro.model.ProfessorMateria;
import com.grupo.tfc.conectapro.model.StatusConta;
import com.grupo.tfc.conectapro.model.TipoUsuario;
import com.grupo.tfc.conectapro.model.Usuario;
import com.grupo.tfc.conectapro.repository.EnderecoRepository;
import com.grupo.tfc.conectapro.repository.MateriaRepository;
import com.grupo.tfc.conectapro.repository.ProfessorDisponibilidadeRepository;
import com.grupo.tfc.conectapro.repository.ProfessorMateriaRepository;
import com.grupo.tfc.conectapro.repository.ProfessorRepository;
import com.grupo.tfc.conectapro.repository.UsuarioRepository;
import com.grupo.tfc.conectapro.service.LocalizacaoService.Coordenada;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.FORBIDDEN;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
public class ProfessorService {

    private static final Logger logger = LoggerFactory.getLogger(ProfessorService.class);

    private static final String MODALIDADE_ONLINE = "ONLINE";
    private static final String MODALIDADE_PRESENCIAL = "PRESENCIAL";
    private static final String MODELO_PARTICULARES = "PARTICULARES";
    private static final String MODELO_INSTITUICOES = "INSTITUICOES";

    private static final Map<String, String> DIAS_SEMANA = new LinkedHashMap<>();

    static {
        DIAS_SEMANA.put("seg", "Seg");
        DIAS_SEMANA.put("ter", "Ter");
        DIAS_SEMANA.put("qua", "Qua");
        DIAS_SEMANA.put("qui", "Qui");
        DIAS_SEMANA.put("sex", "Sex");
        DIAS_SEMANA.put("sab", "Sáb");
        DIAS_SEMANA.put("dom", "Dom");
    }

    private final UsuarioRepository usuarioRepository;
    private final ProfessorRepository professorRepository;
    private final MateriaRepository materiaRepository;
    private final ProfessorMateriaRepository professorMateriaRepository;
    private final ProfessorDisponibilidadeRepository disponibilidadeRepository;
    private final EnderecoRepository enderecoRepository;
    private final LocalizacaoService localizacaoService;
    private final EnderecoService enderecoService;
    private final AuditoriaService auditoriaService;
    private final AvaliacaoService avaliacaoService;
    private final ArmazenamentoS3Service armazenamentoS3Service;

    public ProfessorService(UsuarioRepository usuarioRepository,
                            ProfessorRepository professorRepository,
                            MateriaRepository materiaRepository,
                            ProfessorMateriaRepository professorMateriaRepository,
                            ProfessorDisponibilidadeRepository disponibilidadeRepository,
                            EnderecoRepository enderecoRepository,
                            LocalizacaoService localizacaoService,
                            EnderecoService enderecoService,
                            AuditoriaService auditoriaService,
                            AvaliacaoService avaliacaoService,
                            ArmazenamentoS3Service armazenamentoS3Service) {
        this.usuarioRepository = usuarioRepository;
        this.professorRepository = professorRepository;
        this.materiaRepository = materiaRepository;
        this.professorMateriaRepository = professorMateriaRepository;
        this.disponibilidadeRepository = disponibilidadeRepository;
        this.enderecoRepository = enderecoRepository;
        this.localizacaoService = localizacaoService;
        this.enderecoService = enderecoService;
        this.auditoriaService = auditoriaService;
        this.avaliacaoService = avaliacaoService;
        this.armazenamentoS3Service = armazenamentoS3Service;
    }

    @Transactional
    public PerfilProfessorResponse salvarPerfil(UUID usuarioId, PerfilProfessorRequest request) {
        Usuario usuario = buscarUsuario(usuarioId);
        if (!podeManterPerfil(usuario)) {
            auditoriaService.registrar(AcaoAuditoria.ACESSO_NEGADO, usuarioId, "PROFESSOR", null, "configuração de perfil por usuário que não é professor");
            throw new ResponseStatusException(FORBIDDEN, "Apenas professores podem configurar este perfil");
        }
        if (!usuario.administrador()) {
            if (usuario.getStatusConta() == StatusConta.EM_ANALISE
                    || usuario.getStatusConta() == StatusConta.REJEITADO) {
                throw new ResponseStatusException(FORBIDDEN, "Seu cadastro precisa ser aprovado antes de configurar o perfil");
            }
            if (usuario.getStatusConta() == StatusConta.PENDENTE_PAGAMENTO) {
                throw new ResponseStatusException(FORBIDDEN, "Efetue o pagamento para editar seu perfil");
            }
        }
        usuario.setNomeCompleto(request.fullName().trim());
        usuarioRepository.save(usuario);

        Professor professor = professorRepository.findByUsuarioId(usuarioId)
                .orElseGet(() -> {
                    Professor novo = new Professor();
                    novo.setUsuario(usuario);
                    novo.setCriadoEm(OffsetDateTime.now());
                    novo.setVerificado(false);
                    return novo;
                });

        boolean online = contemModalidade(request.modalities(), MODALIDADE_ONLINE);
        boolean presencial = contemModalidade(request.modalities(), MODALIDADE_PRESENCIAL);
        boolean paraInstituicoes = MODELO_INSTITUICOES.equalsIgnoreCase(request.teachingModel());
        BigDecimal preco = BigDecimal.valueOf(request.pricePerHour());

        professor.setBiografia(request.bio().trim());
        professor.setTelefone(request.phone());
        professor.setAtendeOnline(online);
        professor.setAtendePresencial(presencial);
        professor.setPrecoHoraParticular(paraInstituicoes ? null : preco);
        professor.setPrecoHoraEscola(paraInstituicoes ? preco : null);
        professor.setCep(request.address().cep());
        professor.setEndereco(formatarEndereco(request.address()));
        professor.setAntecedenciaMinHoras(
                request.advanceNoticeHours() != null && request.advanceNoticeHours() >= 0
                        ? request.advanceNoticeHours()
                        : null);
        professor.setAtualizadoEm(OffsetDateTime.now());

        Professor salvo = professorRepository.save(professor);

        enderecoService.salvar(usuario, paraEnderecoRequest(request.address()));
        salvarMaterias(salvo, request.subjects());
        salvarDisponibilidade(salvo, request.availability());

        logger.info("Perfil de professor salvo. usuarioId={} professorId={}", usuarioId, salvo.getId());
        auditoriaService.registrar(AcaoAuditoria.PERFIL_ATUALIZADO, usuarioId, "PROFESSOR", salvo.getId().toString(), null);

        return buscarPerfil(usuarioId);
    }

    @Transactional
    public AvatarResponse enviarAvatar(UUID usuarioId, MultipartFile arquivo) {
        Usuario usuario = buscarUsuario(usuarioId);
        if (!podeManterPerfil(usuario)) {
            auditoriaService.registrar(AcaoAuditoria.ACESSO_NEGADO, usuarioId, "PROFESSOR", null, "envio de foto por usuario que nao e professor");
            throw new ResponseStatusException(FORBIDDEN, "Apenas professores podem enviar foto de perfil");
        }

        Professor professor;
        if (usuario.administrador()) {
            professor = obterOuCriarProfessor(usuario);
        } else {
            professor = professorRepository.findByUsuarioId(usuarioId)
                    .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Configure e salve seu perfil antes de enviar a foto"));
        }

        String url = armazenamentoS3Service.enviarAvatar(professor.getId(), arquivo);
        professor.setAvatarUrl(url);
        professor.setAtualizadoEm(OffsetDateTime.now());
        professorRepository.save(professor);
        usuario.setAvatarUrl(url);
        usuarioRepository.save(usuario);

        logger.info("Foto de perfil atualizada. usuarioId={} professorId={}", usuarioId, professor.getId());
        return new AvatarResponse(url);
    }

    @Transactional
    public void removerAvatar(UUID usuarioId) {
        Professor professor = professorRepository.findByUsuarioId(usuarioId).orElse(null);
        if (professor == null || professor.getAvatarUrl() == null) {
            return;
        }

        armazenamentoS3Service.removerAvatar(professor.getId());
        professor.setAvatarUrl(null);
        professor.setAtualizadoEm(OffsetDateTime.now());
        professorRepository.save(professor);
        Usuario usuario = professor.getUsuario();
        if (usuario != null) {
            usuario.setAvatarUrl(null);
            usuarioRepository.save(usuario);
        }

        logger.info("Foto de perfil removida. usuarioId={} professorId={}", usuarioId, professor.getId());
    }

    @Transactional
    public void enviarCertificado(UUID usuarioId, MultipartFile arquivo) {
        Usuario usuario = buscarUsuario(usuarioId);
        if (usuario.getTipo() != TipoUsuario.PROFESSOR) {
            throw new ResponseStatusException(FORBIDDEN, "Apenas professores podem enviar certificado");
        }
        if (usuario.getStatusConta() != StatusConta.EM_ANALISE
                && usuario.getStatusConta() != StatusConta.REJEITADO) {
            throw new ResponseStatusException(FORBIDDEN, "O certificado so pode ser enviado durante a analise do cadastro");
        }

        Professor professor = obterOuCriarProfessor(usuario);
        armazenamentoS3Service.enviarCertificado(professor.getId(), arquivo);
        professor.setCertificadoNome(nomeArquivo(arquivo));
        professor.setJustificativaSemCertificado(null);
        professor.setAtualizadoEm(OffsetDateTime.now());
        professorRepository.save(professor);

        auditoriaService.registrar(AcaoAuditoria.CERTIFICADO_ENVIADO, usuarioId, "PROFESSOR", professor.getId().toString(), null);
        logger.info("Certificado enviado. usuarioId={} professorId={}", usuarioId, professor.getId());
    }

    @Transactional
    public void enviarJustificativa(UUID usuarioId, String justificativa) {
        Usuario usuario = buscarUsuario(usuarioId);
        if (usuario.getTipo() != TipoUsuario.PROFESSOR) {
            throw new ResponseStatusException(FORBIDDEN, "Apenas professores podem enviar justificativa");
        }
        if (usuario.getStatusConta() != StatusConta.EM_ANALISE
                && usuario.getStatusConta() != StatusConta.REJEITADO) {
            throw new ResponseStatusException(FORBIDDEN, "A justificativa so pode ser enviada durante a analise do cadastro");
        }

        Professor professor = obterOuCriarProfessor(usuario);
        professor.setJustificativaSemCertificado(justificativa.trim());
        professor.setAtualizadoEm(OffsetDateTime.now());
        professorRepository.save(professor);

        logger.info("Justificativa de ausencia de certificado enviada. usuarioId={} professorId={}", usuarioId, professor.getId());
    }

    @Transactional
    public void reenviarParaAnalise(UUID usuarioId) {
        Usuario usuario = buscarUsuario(usuarioId);
        if (usuario.getTipo() != TipoUsuario.PROFESSOR) {
            throw new ResponseStatusException(FORBIDDEN, "Apenas professores podem reenviar o cadastro");
        }
        if (usuario.getStatusConta() != StatusConta.REJEITADO) {
            throw new ResponseStatusException(BAD_REQUEST, "O cadastro nao esta rejeitado");
        }

        usuario.setStatusConta(StatusConta.EM_ANALISE);
        usuario.setMotivoRejeicao(null);
        usuarioRepository.save(usuario);

        logger.info("Cadastro reenviado para analise. usuarioId={}", usuarioId);
    }

    @Transactional(readOnly = true)
    public StatusCadastroResponse statusCadastro(UUID usuarioId) {
        Usuario usuario = buscarUsuario(usuarioId);
        Professor professor = professorRepository.findByUsuarioId(usuarioId).orElse(null);
        String certificadoNome = professor == null ? null : professor.getCertificadoNome();
        String justificativa = professor == null ? null : professor.getJustificativaSemCertificado();

        return new StatusCadastroResponse(
                usuario.getStatusConta().name(),
                certificadoNome != null,
                certificadoNome,
                justificativa,
                usuario.getMotivoRejeicao());
    }

    private Professor obterOuCriarProfessor(Usuario usuario) {
        return professorRepository.findByUsuarioId(usuario.getId())
                .orElseGet(() -> {
                    Professor novo = new Professor();
                    novo.setUsuario(usuario);
                    novo.setCriadoEm(OffsetDateTime.now());
                    novo.setVerificado(false);
                    return professorRepository.save(novo);
                });
    }

    private String nomeArquivo(MultipartFile arquivo) {
        String nome = arquivo.getOriginalFilename();
        return nome == null || nome.isBlank() ? "certificado" : nome;
    }

    @Transactional(readOnly = true)
    public PerfilProfessorResponse buscarPerfil(UUID usuarioId) {
        Usuario usuario = buscarUsuario(usuarioId);
        Professor professor = professorRepository.findByUsuarioId(usuarioId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Perfil ainda não configurado"));

        List<MateriaProfessorRequest> materias = professorMateriaRepository.findByProfessorId(professor.getId())
                .stream()
                .map(vinculo -> new MateriaProfessorRequest(
                        vinculo.getMateria().getNome(),
                        vinculo.getObservacao(),
                        vinculo.getNivel()))
                .toList();

        List<DisponibilidadeRequest> disponibilidade = disponibilidadeRepository.findByProfessorId(professor.getId())
                .stream()
                .map(slot -> new DisponibilidadeRequest(slot.getDiaSemana(), slot.getHorario()))
                .toList();

        EnderecoProfessorRequest endereco = enderecoRepository.findFirstByUsuarioId(usuarioId)
                .map(salvo -> new EnderecoProfessorRequest(
                        salvo.getCep(),
                        salvo.getLogradouro(),
                        salvo.getBairro(),
                        salvo.getCidade(),
                        salvo.getEstado()))
                .orElseGet(() -> new EnderecoProfessorRequest(professor.getCep(), null, null, null, null));

        BigDecimal preco = precoHora(professor);

        return new PerfilProfessorResponse(
                usuario.getNomeCompleto(),
                professor.getTelefone(),
                professor.getBiografia(),
                professor.getAvatarUrl(),
                materias,
                atendeInstituicoes(professor) ? MODELO_INSTITUICOES : MODELO_PARTICULARES,
                modalidadesDoProfessor(professor),
                preco == null ? null : preco.doubleValue(),
                endereco,
                disponibilidade,
                professor.getAntecedenciaMinHoras()
        );
    }

    @Transactional(readOnly = true)
    public List<ProfessorResumoResponse> listarProfessores(UUID usuarioId) {
        List<Professor> professores = professorRepository.findAtivosComUsuario().stream()
                .filter(this::visivelNaBuscaPublica)
                .toList();
        List<UUID> professorIds = professores.stream().map(Professor::getId).toList();
        Map<UUID, List<String>> materiasPorProfessor = carregarMaterias(professorIds);
        Map<UUID, List<ProfessorDisponibilidade>> horariosPorProfessor = carregarHorarios(professorIds);
        Map<UUID, Endereco> enderecos = buscarEnderecos(professores);
        Coordenada origem = localizacaoService.buscarCoordenada(cepDeOrigem(usuarioId)).orElse(null);

        List<ProfessorResumoResponse> resumos = professores.stream()
                .map(professor -> paraResumo(
                        professor,
                        enderecos.get(professor.getUsuario().getId()),
                        origem,
                        materiasPorProfessor.getOrDefault(professor.getId(), List.of()),
                        horariosPorProfessor.getOrDefault(professor.getId(), List.of())))
                .sorted(Comparator.comparing(ProfessorResumoResponse::name, String.CASE_INSENSITIVE_ORDER))
                .toList();

        if (usuarioId == null) {
            return resumos.stream().map(this::redigirParaVisitante).toList();
        }

        return resumos;
    }

    @Transactional(readOnly = true)
    public ProfessorResumoResponse buscarProfessor(UUID professorId, UUID usuarioId) {
        Professor professor = professorRepository.findById(professorId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Professor não encontrado"));

        if (professor.getUsuario().administrador()
                && (usuarioId == null || !professor.getUsuario().getId().equals(usuarioId))) {
            throw new ResponseStatusException(NOT_FOUND, "Professor não encontrado");
        }

        if (professor.getUsuario().getStatusConta() == StatusConta.PENDENTE_PAGAMENTO
                && !professor.getUsuario().getId().equals(usuarioId)) {
            throw new ResponseStatusException(NOT_FOUND, "Professor não encontrado");
        }

        Endereco endereco = enderecoRepository.findFirstByUsuarioId(professor.getUsuario().getId()).orElse(null);
        List<UUID> professorIds = List.of(professor.getId());
        List<String> materias = carregarMaterias(professorIds).getOrDefault(professor.getId(), List.of());
        List<ProfessorDisponibilidade> slots = carregarHorarios(professorIds).getOrDefault(professor.getId(), List.of());

        if (professor.getUsuario().getId().equals(usuarioId)) {
            return paraResumo(professor, endereco, null, materias, slots);
        }

        Coordenada origem = localizacaoService.buscarCoordenada(cepDeOrigem(usuarioId)).orElse(null);
        ProfessorResumoResponse resumo = paraResumo(professor, endereco, origem, materias, slots);

        return usuarioId == null ? redigirParaVisitante(resumo) : resumo;
    }

    private ProfessorResumoResponse redigirParaVisitante(ProfessorResumoResponse resumo) {
        return new ProfessorResumoResponse(
                resumo.id(),
                "",
                resumo.initials(),
                resumo.avatarUrl(),
                resumo.subjects(),
                resumo.rating(),
                resumo.reviewCount(),
                resumo.modalities(),
                null,
                resumo.verified(),
                resumo.bio(),
                resumo.availability(),
                resumo.weekDays(),
                resumo.neighborhood(),
                resumo.city(),
                resumo.distanceKm(),
                resumo.usuarioId());
    }

    private boolean podeManterPerfil(Usuario usuario) {
        return usuario.getTipo() == TipoUsuario.PROFESSOR || usuario.administrador();
    }

    private boolean visivelNaBuscaPublica(Professor professor) {
        Usuario usuario = professor.getUsuario();
        if (usuario == null) {
            return false;
        }
        return !usuario.isAdmin() && usuario.getTipo() == TipoUsuario.PROFESSOR;
    }

    private Usuario buscarUsuario(UUID usuarioId) {
        return usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Usuário não encontrado"));
    }

    private Map<UUID, List<String>> carregarMaterias(List<UUID> professorIds) {
        if (professorIds.isEmpty()) {
            return Map.of();
        }

        return professorMateriaRepository.findByProfessorIdIn(professorIds).stream()
                .collect(Collectors.groupingBy(
                        vinculo -> vinculo.getProfessor().getId(),
                        Collectors.mapping(vinculo -> vinculo.getMateria().getNome(), Collectors.toList())));
    }

    private Map<UUID, List<ProfessorDisponibilidade>> carregarHorarios(List<UUID> professorIds) {
        if (professorIds.isEmpty()) {
            return Map.of();
        }

        return disponibilidadeRepository.findByProfessorIdIn(professorIds).stream()
                .collect(Collectors.groupingBy(slot -> slot.getProfessor().getId()));
    }

    private ProfessorResumoResponse paraResumo(Professor professor,
                                                Endereco endereco,
                                                Coordenada origem,
                                                List<String> materias,
                                                List<ProfessorDisponibilidade> slots) {
        String nome = professor.getUsuario().getNomeCompleto();

        List<String> modalidades = new ArrayList<>();
        if (Boolean.TRUE.equals(professor.getAtendeOnline())) {
            modalidades.add(MODALIDADE_ONLINE.toLowerCase(Locale.ROOT));
        }
        if (Boolean.TRUE.equals(professor.getAtendePresencial())) {
            modalidades.add(MODALIDADE_PRESENCIAL.toLowerCase(Locale.ROOT));
        }

        BigDecimal preco = precoHora(professor);
        double[] ratingDoProfessor = avaliacaoService.calcularMedia(professor.getUsuario().getId());

        return new ProfessorResumoResponse(
                professor.getId().toString(),
                nome,
                gerarIniciais(nome),
                professor.getAvatarUrl(),
                materias,
                ratingDoProfessor[0],
                (int) ratingDoProfessor[1],
                modalidades,
                preco == null ? 0d : preco.doubleValue(),
                Boolean.TRUE.equals(professor.getVerificado()),
                professor.getBiografia(),
                slots.stream().map(ProfessorDisponibilidade::getHorario).distinct().sorted().toList(),
                DIAS_SEMANA.entrySet().stream()
                        .filter(dia -> slots.stream().anyMatch(slot -> dia.getKey().equals(slot.getDiaSemana())))
                        .map(Map.Entry::getValue)
                        .toList(),
                endereco == null ? null : endereco.getBairro(),
                endereco == null ? null : endereco.getCidade(),
                distanciaAte(professor, endereco, origem),
                professor.getUsuario().getId().toString()
        );
    }

    private String cepDeOrigem(UUID usuarioId) {
        if (usuarioId == null) {
            return null;
        }

        return enderecoRepository.findFirstByUsuarioId(usuarioId)
                .map(Endereco::getCep)
                .orElse(null);
    }

    private Map<UUID, Endereco> buscarEnderecos(List<Professor> professores) {
        List<UUID> usuarioIds = professores.stream()
                .map(professor -> professor.getUsuario().getId())
                .toList();

        if (usuarioIds.isEmpty()) {
            return Map.of();
        }

        return enderecoRepository.findByUsuarioIdIn(usuarioIds).stream()
                .collect(Collectors.toMap(
                        endereco -> endereco.getUsuario().getId(),
                        endereco -> endereco,
                        (primeiro, segundo) -> primeiro));
    }

    private Double distanciaAte(Professor professor, Endereco endereco, Coordenada origem) {
        if (origem == null) {
            return null;
        }

        return localizacaoService.distanciaEmKm(origem, coordenadaDoProfessor(professor, endereco));
    }

    private Coordenada coordenadaDoProfessor(Professor professor, Endereco endereco) {
        if (endereco != null && endereco.getLatitude() != null && endereco.getLongitude() != null) {
            return new Coordenada(endereco.getLatitude(), endereco.getLongitude());
        }

        String cep = endereco == null || endereco.getCep() == null ? professor.getCep() : endereco.getCep();
        return localizacaoService.buscarCoordenada(cep).orElse(null);
    }

    private boolean atendeInstituicoes(Professor professor) {
        return professor.getPrecoHoraEscola() != null;
    }

    private boolean contemModalidade(List<String> modalidades, String alvo) {
        return modalidades != null && modalidades.stream().anyMatch(alvo::equalsIgnoreCase);
    }

    private List<String> modalidadesDoProfessor(Professor professor) {
        List<String> modalidades = new ArrayList<>();
        if (Boolean.TRUE.equals(professor.getAtendeOnline())) {
            modalidades.add(MODALIDADE_ONLINE);
        }
        if (Boolean.TRUE.equals(professor.getAtendePresencial())) {
            modalidades.add(MODALIDADE_PRESENCIAL);
        }
        return modalidades;
    }

    private BigDecimal precoHora(Professor professor) {
        return atendeInstituicoes(professor)
                ? professor.getPrecoHoraEscola()
                : professor.getPrecoHoraParticular();
    }

    private String gerarIniciais(String nome) {
        String[] partes = nome.trim().split("\\s+");
        if (partes.length == 1) {
            return partes[0].substring(0, Math.min(2, partes[0].length())).toUpperCase(Locale.ROOT);
        }
        return (partes[0].charAt(0) + "" + partes[partes.length - 1].charAt(0)).toUpperCase(Locale.ROOT);
    }

    private EnderecoRequest paraEnderecoRequest(EnderecoProfessorRequest address) {
        return new EnderecoRequest(
                address.cep(),
                address.street(),
                address.neighborhood(),
                address.city(),
                address.state());
    }

    private void salvarMaterias(Professor professor, List<MateriaProfessorRequest> materias) {
        professorMateriaRepository.deleteByProfessorId(professor.getId());
        professorMateriaRepository.flush();

        List<ProfessorMateria> vinculos = new ArrayList<>();
        for (MateriaProfessorRequest item : materias) {
            String nome = item.name().trim();
            Materia materia = materiaRepository.findFirstByNomeIgnoreCase(nome)
                    .orElseGet(() -> {
                        Materia nova = new Materia();
                        nova.setNome(nome);
                        nova.setAtiva(true);
                        nova.setCriadoEm(OffsetDateTime.now());
                        return materiaRepository.save(nova);
                    });

            ProfessorMateria vinculo = new ProfessorMateria();
            vinculo.setProfessor(professor);
            vinculo.setMateria(materia);
            vinculo.setNivel(item.level());
            vinculo.setObservacao(item.observation());
            vinculos.add(vinculo);
        }
        professorMateriaRepository.saveAll(vinculos);
    }

    private void salvarDisponibilidade(Professor professor, List<DisponibilidadeRequest> slots) {
        disponibilidadeRepository.deleteByProfessorId(professor.getId());
        disponibilidadeRepository.flush();

        if (slots == null || slots.isEmpty()) {
            return;
        }

        List<ProfessorDisponibilidade> novos = slots.stream().map(item -> {
            ProfessorDisponibilidade slot = new ProfessorDisponibilidade();
            slot.setProfessor(professor);
            slot.setDiaSemana(item.day());
            slot.setHorario(item.time());
            return slot;
        }).toList();

        disponibilidadeRepository.saveAll(novos);
    }

    private String formatarEndereco(EnderecoProfessorRequest address) {
        List<String> partes = new ArrayList<>();
        Optional.ofNullable(address.street()).filter(v -> !v.isBlank()).ifPresent(partes::add);
        Optional.ofNullable(address.neighborhood()).filter(v -> !v.isBlank()).ifPresent(partes::add);
        Optional.ofNullable(address.city()).filter(v -> !v.isBlank()).ifPresent(partes::add);
        Optional.ofNullable(address.state()).filter(v -> !v.isBlank()).ifPresent(partes::add);
        return String.join(", ", partes);
    }
}