package com.grupo.tfc.conectapro.service;

import com.grupo.tfc.conectapro.dto.professor.DisponibilidadeRequest;
import com.grupo.tfc.conectapro.dto.professor.EnderecoProfessorRequest;
import com.grupo.tfc.conectapro.dto.professor.MateriaProfessorRequest;
import com.grupo.tfc.conectapro.dto.professor.PerfilProfessorRequest;
import com.grupo.tfc.conectapro.dto.professor.PerfilProfessorResponse;
import com.grupo.tfc.conectapro.dto.professor.ProfessorResumoResponse;
import com.grupo.tfc.conectapro.model.Endereco;
import com.grupo.tfc.conectapro.model.Materia;
import com.grupo.tfc.conectapro.model.Professor;
import com.grupo.tfc.conectapro.model.ProfessorDisponibilidade;
import com.grupo.tfc.conectapro.model.ProfessorMateria;
import com.grupo.tfc.conectapro.model.Usuario;
import com.grupo.tfc.conectapro.repository.EnderecoRepository;
import com.grupo.tfc.conectapro.repository.MateriaRepository;
import com.grupo.tfc.conectapro.repository.ProfessorDisponibilidadeRepository;
import com.grupo.tfc.conectapro.repository.ProfessorMateriaRepository;
import com.grupo.tfc.conectapro.repository.ProfessorRepository;
import com.grupo.tfc.conectapro.repository.UsuarioRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
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

    public ProfessorService(UsuarioRepository usuarioRepository,
                            ProfessorRepository professorRepository,
                            MateriaRepository materiaRepository,
                            ProfessorMateriaRepository professorMateriaRepository,
                            ProfessorDisponibilidadeRepository disponibilidadeRepository,
                            EnderecoRepository enderecoRepository) {
        this.usuarioRepository = usuarioRepository;
        this.professorRepository = professorRepository;
        this.materiaRepository = materiaRepository;
        this.professorMateriaRepository = professorMateriaRepository;
        this.disponibilidadeRepository = disponibilidadeRepository;
        this.enderecoRepository = enderecoRepository;
    }

    @Transactional
    public PerfilProfessorResponse salvarPerfil(UUID usuarioId, PerfilProfessorRequest request) {
        Usuario usuario = buscarUsuario(usuarioId);
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

        boolean online = MODALIDADE_ONLINE.equalsIgnoreCase(request.modality());
        boolean paraInstituicoes = MODELO_INSTITUICOES.equalsIgnoreCase(request.teachingModel());
        BigDecimal preco = BigDecimal.valueOf(request.pricePerHour());

        professor.setBiografia(request.bio().trim());
        professor.setTelefone(request.phone());
        professor.setAtendeOnline(online);
        professor.setAtendePresencial(!online);
        professor.setPrecoHoraParticular(paraInstituicoes ? null : preco);
        professor.setPrecoHoraEscola(paraInstituicoes ? preco : null);
        professor.setCep(request.address().cep());
        professor.setEndereco(formatarEndereco(request.address()));
        professor.setAtualizadoEm(OffsetDateTime.now());

        Professor salvo = professorRepository.save(professor);

        salvarEndereco(usuario, request.address());
        salvarMaterias(salvo, request.subjects());
        salvarDisponibilidade(salvo, request.availability());

        logger.info("Perfil de professor salvo. usuarioId={} professorId={}", usuarioId, salvo.getId());

        return buscarPerfil(usuarioId);
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
                materias,
                atendeInstituicoes(professor) ? MODELO_INSTITUICOES : MODELO_PARTICULARES,
                Boolean.TRUE.equals(professor.getAtendeOnline()) ? MODALIDADE_ONLINE : MODALIDADE_PRESENCIAL,
                preco == null ? null : preco.doubleValue(),
                endereco,
                disponibilidade
        );
    }

    @Transactional(readOnly = true)
    public List<ProfessorResumoResponse> listarProfessores() {
        return professorRepository.findAll().stream()
                .map(this::paraResumo)
                .sorted(Comparator.comparing(ProfessorResumoResponse::name, String.CASE_INSENSITIVE_ORDER))
                .toList();
    }

    @Transactional(readOnly = true)
    public ProfessorResumoResponse buscarProfessor(UUID professorId) {
        return professorRepository.findById(professorId)
                .map(this::paraResumo)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Professor não encontrado"));
    }

    private Usuario buscarUsuario(UUID usuarioId) {
        return usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Usuário não encontrado"));
    }

    private ProfessorResumoResponse paraResumo(Professor professor) {
        String nome = professor.getUsuario().getNomeCompleto();

        List<String> materias = professorMateriaRepository.findByProfessorId(professor.getId())
                .stream()
                .map(vinculo -> vinculo.getMateria().getNome())
                .toList();

        List<ProfessorDisponibilidade> slots = disponibilidadeRepository.findByProfessorId(professor.getId());

        List<String> modalidades = new ArrayList<>();
        if (Boolean.TRUE.equals(professor.getAtendeOnline())) {
            modalidades.add(MODALIDADE_ONLINE.toLowerCase(Locale.ROOT));
        }
        if (Boolean.TRUE.equals(professor.getAtendePresencial())) {
            modalidades.add(MODALIDADE_PRESENCIAL.toLowerCase(Locale.ROOT));
        }

        BigDecimal preco = precoHora(professor);

        return new ProfessorResumoResponse(
                professor.getId().toString(),
                nome,
                gerarIniciais(nome),
                materias,
                0,
                0,
                modalidades,
                preco == null ? 0d : preco.doubleValue(),
                Boolean.TRUE.equals(professor.getVerificado()),
                professor.getBiografia(),
                slots.stream().map(ProfessorDisponibilidade::getHorario).distinct().sorted().toList(),
                DIAS_SEMANA.entrySet().stream()
                        .filter(dia -> slots.stream().anyMatch(slot -> dia.getKey().equals(slot.getDiaSemana())))
                        .map(Map.Entry::getValue)
                        .toList()
        );
    }

    private boolean atendeInstituicoes(Professor professor) {
        return professor.getPrecoHoraEscola() != null;
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

    private void salvarEndereco(Usuario usuario, EnderecoProfessorRequest request) {
        Endereco endereco = enderecoRepository.findFirstByUsuarioId(usuario.getId())
                .orElseGet(() -> {
                    Endereco novo = new Endereco();
                    novo.setUsuario(usuario);
                    return novo;
                });

        endereco.setCep(request.cep());
        endereco.setLogradouro(request.street());
        endereco.setBairro(request.neighborhood());
        endereco.setCidade(request.city());
        endereco.setEstado(request.state());
        enderecoRepository.save(endereco);
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