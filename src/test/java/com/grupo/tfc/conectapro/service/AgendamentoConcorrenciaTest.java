package com.grupo.tfc.conectapro.service;

import com.grupo.tfc.conectapro.dto.agendamento.AgendamentoResponse;
import com.grupo.tfc.conectapro.dto.agendamento.AgendarRequest;
import com.grupo.tfc.conectapro.model.Materia;
import com.grupo.tfc.conectapro.model.Professor;
import com.grupo.tfc.conectapro.model.ProfessorDisponibilidade;
import com.grupo.tfc.conectapro.model.ProfessorMateria;
import com.grupo.tfc.conectapro.model.StatusAgendamento;
import com.grupo.tfc.conectapro.model.StatusConta;
import com.grupo.tfc.conectapro.model.TipoUsuario;
import com.grupo.tfc.conectapro.model.Usuario;
import com.grupo.tfc.conectapro.repository.AgendamentoRepository;
import com.grupo.tfc.conectapro.repository.MateriaRepository;
import com.grupo.tfc.conectapro.repository.ProfessorDisponibilidadeRepository;
import com.grupo.tfc.conectapro.repository.ProfessorMateriaRepository;
import com.grupo.tfc.conectapro.repository.ProfessorRepository;
import com.grupo.tfc.conectapro.repository.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.Callable;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.stream.Stream;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@ActiveProfiles("test")
class AgendamentoConcorrenciaTest {

    private static final String DIA = "seg";
    private static final String HORARIO = "08:00";
    private static final String MATERIA = "Matemática";

    @Autowired
    private AgendamentoService agendamentoService;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private ProfessorRepository professorRepository;

    @Autowired
    private ProfessorDisponibilidadeRepository disponibilidadeRepository;

    @Autowired
    private ProfessorMateriaRepository professorMateriaRepository;

    @Autowired
    private MateriaRepository materiaRepository;

    @Autowired
    private AgendamentoRepository agendamentoRepository;

    private UUID aluno1Id;
    private UUID aluno2Id;
    private UUID professorId;

    @BeforeEach
    void preparar() {
        agendamentoRepository.deleteAll();

        aluno1Id = criarUsuario(TipoUsuario.ALUNO).getId();
        aluno2Id = criarUsuario(TipoUsuario.ALUNO).getId();

        Usuario professorUsuario = criarUsuario(TipoUsuario.PROFESSOR);

        Professor professor = new Professor();
        professor.setUsuario(professorUsuario);
        professor.setAtendeOnline(true);
        professor.setAtendePresencial(false);
        professor.setVerificado(false);
        professor.setCriadoEm(OffsetDateTime.now());
        professor = professorRepository.save(professor);
        professorId = professor.getId();

        ProfessorDisponibilidade disponibilidade = new ProfessorDisponibilidade();
        disponibilidade.setProfessor(professor);
        disponibilidade.setDiaSemana(DIA);
        disponibilidade.setHorario(HORARIO);
        disponibilidadeRepository.save(disponibilidade);

        Materia materia = materiaRepository.findFirstByNomeIgnoreCase(MATERIA)
                .orElseGet(() -> {
                    Materia nova = new Materia();
                    nova.setNome(MATERIA);
                    nova.setAtiva(true);
                    nova.setCriadoEm(OffsetDateTime.now());
                    return materiaRepository.save(nova);
                });

        ProfessorMateria vinculo = new ProfessorMateria();
        vinculo.setProfessor(professor);
        vinculo.setMateria(materia);
        vinculo.setNivel("Iniciante");
        professorMateriaRepository.save(vinculo);
    }

    @Test
    void segundaReservaDoMesmoHorario_retornaConflito() {
        agendamentoService.solicitar(aluno1Id, requisicao());

        assertThatThrownBy(() -> agendamentoService.solicitar(aluno2Id, requisicao()))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(erro ->
                        assertThat(((ResponseStatusException) erro).getStatusCode()).isEqualTo(HttpStatus.CONFLICT));

        assertThat(ativosNoSlot()).isEqualTo(1);
    }

    @Test
    void duasReservasSimultaneas_apenasUmaVence() throws Exception {
        CountDownLatch largada = new CountDownLatch(1);
        ExecutorService pool = Executors.newFixedThreadPool(2);

        Future<Object> primeira = pool.submit(tarefa(aluno1Id, largada));
        Future<Object> segunda = pool.submit(tarefa(aluno2Id, largada));

        largada.countDown();

        Object resultado1 = primeira.get();
        Object resultado2 = segunda.get();
        pool.shutdown();

        long sucessos = Stream.of(resultado1, resultado2)
                .filter(AgendamentoResponse.class::isInstance)
                .count();
        assertThat(sucessos).isEqualTo(1);

        Stream.of(resultado1, resultado2)
                .filter(ResponseStatusException.class::isInstance)
                .map(ResponseStatusException.class::cast)
                .forEach(erro -> assertThat(erro.getStatusCode()).isEqualTo(HttpStatus.CONFLICT));

        assertThat(ativosNoSlot()).isEqualTo(1);
    }

    private Callable<Object> tarefa(UUID alunoId, CountDownLatch largada) {
        return () -> {
            largada.await();
            try {
                return agendamentoService.solicitar(alunoId, requisicao());
            } catch (Exception excecao) {
                return excecao;
            }
        };
    }

    private AgendarRequest requisicao() {
        return new AgendarRequest(professorId, DIA, HORARIO, "ONLINE", MATERIA);
    }

    private long ativosNoSlot() {
        return agendamentoRepository.findByProfessorIdAndStatusIn(professorId,
                        List.of(StatusAgendamento.SOLICITADO, StatusAgendamento.CONFIRMADO))
                .stream()
                .filter(agendamento -> agendamento.getDiaSemana().equals(DIA)
                        && agendamento.getHorario().equals(HORARIO))
                .count();
    }

    private Usuario criarUsuario(TipoUsuario tipo) {
        Usuario usuario = Usuario.builder()
                .nomeCompleto("Teste " + tipo)
                .email(tipo + "-" + UUID.randomUUID() + "@test.com")
                .senhaHash("hash")
                .tipo(tipo)
                .criadoEm(OffsetDateTime.now())
                .statusConta(StatusConta.ATIVO)
                .build();
        return usuarioRepository.save(usuario);
    }
}
