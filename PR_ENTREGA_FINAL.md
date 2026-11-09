## 1. Identificação


* **Aluno(s):**
Allan C D Guedes - 11231103501
Victor H C Sampaio - 11231101604
Henrique C M Costa - 11222100629
* **Projeto (PFC):** ConectaPro
* **Branch:** feat/testes-integracao


## 2. Resumo da entrega


Implementação da suíte de testes de integração ponta a ponta para os controladores `MateriaController` e `UsuarioController`. Os cenários garantem o funcionamento cruzado de rotas protegidas, autenticação baseada em sessão (cookies JSESSIONID) e validação de regras de negócio com persistência confirmada no banco de dados H2.
## 3. Configuração do ambiente de teste


* **Estratégia:** @SpringBootTest RANDOM_PORT + RestClient e MockMvc (ambos)
* **Banco de teste:** H2 em memória
* **Arquivo de configuração:** src/test/resources/application-test.properties
* **Isolamento de dados:** e-mails únicos gerados dinamicamente com System.nanoTime()
* **Componentes mockados e motivo:** nenhum (garantia de integração real de todas as camadas)


## 4. Matriz de endpoints cobertos


| # | Método | Rota | Controller | Caminho feliz (status) | Erro(s) (status) | Efeito verificado |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | GET | /materias | MateriaController | 200 | N/A | Lista de matérias retornada |
| 2 | GET | /materias/{id} | MateriaController | 200 | 404 | Campos corretos da matéria |
| 3 | POST | /materias | MateriaController | 201 | 401, 403 | Persistência no BD e listagem |
| 4 | POST | /auth/register | UsuarioController | 200 | 400 | Persistência e secret retornado |
| 5 | POST | /auth/login | UsuarioController | 200 | 401 | Header Set-Cookie: JSESSIONID |
| 6 | GET | /auth/sessao | UsuarioController | 200 | 401 | Dados extraídos do cookie |
| 7 | POST | /auth/logout | UsuarioController | 204 | 401 | Encerramento de sessão |


**Total de endpoints cobertos:** 7
## 5. Cenários de integração implementados


| # | Endpoint | Cenário | Tipo | Status | Verificado além do status | Arquivo de teste | Método de teste |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | GET /materias | Lista matérias | Feliz | 200 | Lista retornada | MateriaControllerIT | getAll_deveRetornar200ComLista |
| 2 | GET /materias/{id} | Matéria existente | Feliz | 200 | Campos no corpo | MateriaControllerIT | getPorId_existente_deveRetornar200ComCampos |
| 3 | GET /materias/{id} | Matéria inexistente | Erro | 404 | Mensagem de erro | MateriaControllerIT | getPorId_inexistente_deveRetornar404 |
| 4 | POST /materias | Fluxo cruzado | Relacionamento | 201 | Lista do GET atualizada | MateriaControllerIT | fluxoCriarMateria_apareceNaListagem |
| 5 | POST /materias | Criar como admin | Feliz | 201 | Corpo + BD | MateriaControllerIT | criar_comoAdmin_deveRetornar201EPersistir |
| 6 | POST /materias | Criar sem sessão | Segurança | 401 | Bloqueio | MateriaControllerIT | criar_semSessao_deveRetornar401 |
| 7 | POST /materias | Criar comum | Segurança | 403 | Bloqueio | MateriaControllerIT | criar_comUsuarioNaoAdmin_deveRetornar403 |
| 8 | POST /auth/register | Email duplicado | Erro | 400 | Mensagem | UsuarioControllerIntegrationTest | registrar_comEmailDuplicado_deveRetornar400 |
| 9 | POST /auth/register | Dados válidos | Feliz | 200 | secret, qrUri, BD | UsuarioControllerIntegrationTest | registrar_comDadosValidos_deveRetornar200EPersistir |
| 10 | POST /auth/login | Login sucesso | Feliz | 200 | Corpo + Set-Cookie | UsuarioControllerIntegrationTest | login_comCredenciaisValidas_deveRetornar200EHeaderSetCookie |
| 11 | GET /auth/sessao | Sessão ativa | Segurança | 200 | Dados do usuário | UsuarioControllerIntegrationTest | sessao_aposLogin_deveRetornar200 |
| 12 | POST /auth/logout | Fim da sessão | Feliz | 204 | Sem corpo | UsuarioControllerIntegrationTest | logout_aposLogin_deveRetornar204 |


**Total de cenários de integração:** 12
## 6. Arquivos criados ou alterados


| Arquivo (caminho completo) | Criado / Alterado | Qtd. de testes |
| --- | --- | --- |
| src/test/java/com/grupo/tfc/conectapro/controller/MateriaControllerIT.java | Criado | 7 |
| src/test/java/com/grupo/tfc/conectapro/controller/UsuarioControllerIntegrationTest.java | Alterado | 5 |


**Total de arquivos de teste:** 2   |   **Total de testes de integração:** 12
## 7. Como executar os testes


```
mvn clean test

```


## 8. Evidências


* **Resultado da execução:**


```text
[INFO] Tests run: 39, Failures: 0, Errors: 0, Skipped: 0

```


* **Link do CI (se houver):** não se aplica


## 9. Decisões e dificuldades


* **Segurança:** A suite cobre o bloqueio de requisições não autenticadas (401), bloqueio de acesso indevido (403) para perfis sem privilégios de Admin, e garante o fluxo completo de emissão e consumo de cookies JSESSIONID via rotas de `/auth`.
* **Bugs encontrados pelos testes (se houver):** nenhum
* **Dificuldades:** O principal desafio enfrentado pela equipe foi a consolidação de diferentes estratégias de teste dentro do mesmo ambiente. Lidamos com a necessidade de harmonizar testes via `MockMvc` com chamadas HTTP reais baseadas em `RestClient`, garantindo que a anotação `@SpringBootTest(webEnvironment = RANDOM_PORT)` mantivesse a infraestrutura sem conflitos. Além disso, o gerenciamento do ciclo de vida da sessão (capturar o cookie JSESSIONID no login e injetá-lo nos headers de GET /sessao e POST /logout) exigiu rigor arquitetural.


## 10. Checklist de entrega


* [x] Todos os testes passam com o comando da seção 7, mais de uma vez seguida
* [x] Todos os endpoints dos controllers escolhidos estão na matriz da seção 4
* [x] Cada cenário listado na seção 5 existe no código
* [x] Cada arquivo criado ou alterado está listado na seção 6
* [x] Mínimos da Seção 3.1 do enunciado atendidos (pelo menos 12 testes de integração)
* [x] Nenhum teste com @Disabled, sem asserção ou com Thread.sleep
* [x] Service e repository são reais nos testes de integração
* [x] Professor adicionado como reviewer

