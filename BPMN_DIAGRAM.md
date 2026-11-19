# 📊 Diagramas de processos — ConectaPro

Diagramas revisados conforme a implementação da branch `entrega1611`.

## 1. Processo de agendamento

O aluno escolhe um professor ativo, matéria, modalidade e horário disponível. O sistema valida o horário, a antecedência mínima configurada pelo professor e se o horário já está ocupado. O agendamento começa como `SOLICITADO`; o professor pode confirmar ou recusar. Aluno ou professor podem cancelar, desde que faltem pelo menos 60 minutos para o início.

```mermaid
graph TD
    A([Início]) --> B[Aluno busca professor e consulta o perfil]
    B --> C[Escolhe matéria, modalidade e horário]
    C --> D{Professor ativo e horário em ProfessorDisponibilidade?}
    D -- Não --> E[Informar indisponibilidade]
    E --> C
    D -- Sim --> F{Horário futuro, respeita antecedência do professor e está livre?}
    F -- Não --> G[Informar conflito ou antecedência insuficiente]
    G --> C
    F -- Sim --> H[Criar Agendamento: SOLICITADO]
    H --> I[Notificar professor]
    I --> J{Professor aprova?}
    J -- Sim --> K[Atualizar Agendamento: CONFIRMADO]
    J -- Não --> L[Recusar e atualizar Agendamento: CANCELADO]
    L --> Z([Fim])
    K --> M{Aluno ou professor solicita cancelamento?}
    M -- Não --> Z
    M -- Sim --> N{Faltam pelo menos 60 minutos para a aula?}
    N -- Não --> O[Impedir cancelamento: antecedência mínima de 1 hora]
    O --> M
    N -- Sim --> P[Atualizar Agendamento: CANCELADO e liberar horário]
    P --> Q[Notificar a outra parte e registrar auditoria]
    Q --> Z
```

**Mudança:** o fluxo não inclui cobrança do aluno; acrescenta a regra de cancelamento com uma hora de antecedência e usa `Agendamento`/`ProfessorDisponibilidade`.

---

## 2. Processo de configuração, análise e assinatura do professor

```mermaid
graph TD
    A([Início]) --> B[Professor cria conta e aceita os termos]
    B --> C[Definir status da conta: EM_ANALISE]
    C --> D[Professor envia certificado ou justificativa sem certificado]
    D --> E[Admin analisa o cadastro e a comprovação]
    E --> F{Aprovar cadastro?}
    F -- Não --> G[Definir status: REJEITADO e registrar motivo]
    G --> H[Professor corrige dados/comprovação e reenvia]
    H --> C
    F -- Sim --> I[Marcar comprovação como aprovada/verificada]
    I --> J[Definir status da conta: PENDENTE_PAGAMENTO]
    J --> K[Professor inicia pagamento da assinatura]
    K --> L{Mercado Pago confirma o pagamento?}
    L -- Não --> M[Pagamento não aprovado; permitir nova tentativa]
    M --> K
    L -- Sim --> N[Registrar Pagamento aprovado]
    N --> O[Definir status da conta: ATIVO]
    O --> P[Liberar perfil do professor nas buscas]
    P --> Z([Fim])
```

**Mudança:** a análise do administrador e o envio de certificado ou justificativa antecedem o pagamento; reprovação informa o motivo e permite reenvio.

---

## 3. Processo de busca e filtro

```mermaid
graph TD
    A([Aluno inicia busca]) --> B[Informa filtros de matéria, modalidade e localização]
    B --> C[Consultar professores com conta ATIVO]
    C --> D[Aplicar filtros e ordenar resultados]
    D --> E{Há professores compatíveis?}
    E -- Sim --> F[Exibir resultados e perfis]
    E -- Não --> G[Informar que não há resultados]
    F --> H([Fim])
    G --> H
```

**Mudança:** removi a afirmação de assinatura em dia como entidade/status separado; a elegibilidade de busca é expressa por `StatusConta.ATIVO`.

---

## 4. Pagamento da assinatura do professor

### 4.1. Checkout e confirmação

```mermaid
graph TD
    A([Professor aprovado]) --> B[Conta em PENDENTE_PAGAMENTO]
    B --> C[Professor solicita checkout da assinatura]
    C --> D[Mercado Pago processa o pagamento]
    D --> E{Status do pagamento?}
    E -- Aprovado --> F[Salvar Pagamento como APROVADO]
    F --> G[Atualizar conta para ATIVO]
    G --> H[Perfil disponível nas buscas]
    E -- Pendente ou em processamento --> I[Manter pagamento aguardando confirmação]
    I --> D
    E -- Recusado ou cancelado --> J[Registrar status do Pagamento]
    J --> K[Professor pode tentar novamente]
    K --> C
```

**Mudança:** o diagrama representa apenas o `Pagamento` da assinatura do professor, sem entidades de plano/assinatura, renovação de mensalidade ou pagamento de aula pelo aluno.

---

## 5. Autenticação com 2FA (TOTP)

```mermaid
graph TD
    A([Usuário inicia cadastro]) --> B[Informa nome, e-mail e senha; aceita os termos]
    B --> C[Registrar usuário]
    C --> D[Configurar TOTP e apresentar QR Code]
    D --> E[Usuário vincula aplicativo autenticador]
    E --> F[Usuário confirma o código TOTP]
    F --> G[Login com e-mail e senha]
    G --> H{TOTP está ativo?}
    H -- Não --> I[Concluir autenticação]
    H -- Sim --> J[Solicitar código TOTP]
    J --> K{Código válido?}
    K -- Sim --> I
    K -- Não --> L[Informar código inválido]
    L --> J
    I --> M([Acesso conforme status e permissões da conta])
```

**Mudança:** explicitei o aceite dos termos no cadastro; o fluxo de TOTP foi mantido, com os nomes atualizados.

---

## 6. Visão geral dos processos

```mermaid
flowchart LR
    subgraph Professor
      P1[Cadastro] --> P2[EM_ANALISE]
      P2 -->|Aprovado| P3[PENDENTE_PAGAMENTO]
      P3 -->|Pagamento aprovado| P4[ATIVO]
    end
    subgraph Aluno
      A1[Cadastro/login] --> A2[Buscar professor ATIVO]
      A2 --> A3[Consultar disponibilidade]
      A3 --> A4[Solicitar Agendamento]
    end
    subgraph Sistema
      S1[Filtrar e exibir professores] --> S2[Validar disponibilidade e antecedência]
      S2 --> S3[Agendamento SOLICITADO]
      S3 --> S4[Professor confirma ou cancela]
    end
    subgraph Pagamento
      PG1[Pagamento da assinatura pelo professor]
    end
    P3 --> PG1
    PG1 -->|Aprovado| P4
    P4 -. Perfil disponível .-> A2
    A2 --> S1
    A4 --> S2
    S3 --> S4
```

**Mudança:** removi split, taxa da plataforma e pagamento pelo aluno; o único pagamento representado é o da assinatura do professor.

---

## 7. Sequência de interações

```mermaid
sequenceDiagram
    actor Professor
    actor Aluno
    participant Frontend
    participant Backend
    participant Banco
    participant MercadoPago

    Professor->>Frontend: Cadastra conta e aceita termos
    Frontend->>Backend: POST /auth/register
    Backend->>Banco: Criar Usuario com status EM_ANALISE
    Professor->>Frontend: Envia certificado ou justificativa
    Frontend->>Backend: Enviar comprovação
    Backend->>Banco: Salvar dados de comprovação
    Backend-->>Professor: Aguardar análise administrativa
    Backend->>Banco: Aprovação muda conta para PENDENTE_PAGAMENTO
    Professor->>Frontend: Solicita checkout da assinatura
    Frontend->>Backend: Criar checkout
    Backend->>MercadoPago: Criar preferência de pagamento
    MercadoPago-->>Professor: Checkout
    MercadoPago->>Backend: Webhook de pagamento
    Backend->>Banco: Atualizar Pagamento
    Backend->>Banco: Pagamento aprovado ativa Usuario

    Aluno->>Frontend: Busca professor por filtros
    Frontend->>Backend: GET /professores
    Backend->>Banco: Consultar professores ATIVOS
    Banco-->>Backend: Professores compatíveis
    Backend-->>Frontend: Resultados
    Aluno->>Frontend: Escolhe horário e solicita agendamento
    Frontend->>Backend: POST /agendamentos
    Backend->>Banco: Validar disponibilidade e salvar SOLICITADO
    Backend-->>Professor: Notificação de novo agendamento
    Professor->>Frontend: Aprova solicitação
    Frontend->>Backend: Aprovar Agendamento
    Backend->>Banco: Atualizar para CONFIRMADO
    Backend-->>Aluno: Notificação de confirmação
```

**Mudança:** atualizei a sequência para aprovação do professor, `POST /agendamentos` e confirmação pelo professor; removi checkout/split da aula.

---

## Matriz de responsabilidades (RACI)

| Atividade | Aluno | Professor | Administrador | Sistema | Mercado Pago | AWS S3 |
| --- | --- | --- | --- | --- | --- | --- |
| Criar conta e aceitar termos | R | R |  | A |  |  |
| Enviar certificado/justificativa |  | R |  | A |  | ✓ |
| Analisar e aprovar/rejeitar cadastro |  |  | R | A |  |  |
| Pagar assinatura |  | R |  | A | ✓ |  |
| Buscar professores e solicitar agendamento | R |  |  | A |  |  |
| Confirmar ou cancelar agendamento |  | R |  | A |  |  |
| Registrar mensagens, denúncias e notificações | R | R |  | A |  |  |
| Consultar auditoria/moderação |  |  | R | A |  |  |

**R = Responsável | A = Accountable (responsável final)**

**Mudança:** removi a linha de pagamento de aula/split e acrescentei análise de professor, moderação e suporte.

---

## Estados possíveis no sistema

### Status da conta

```mermaid
stateDiagram-v2
    [*] --> EM_ANALISE: Cadastro de professor
    [*] --> ATIVO: Cadastro de aluno
    EM_ANALISE --> PENDENTE_PAGAMENTO: Administrador aprova
    EM_ANALISE --> REJEITADO: Administrador rejeita e informa motivo
    REJEITADO --> EM_ANALISE: Professor corrige e reenvia
    PENDENTE_PAGAMENTO --> ATIVO: Pagamento da assinatura aprovado
    ATIVO --> BANIDO: Administrador bane a conta
    EM_ANALISE --> EXCLUIDO: Exclusão da conta
    REJEITADO --> EXCLUIDO: Exclusão da conta
    PENDENTE_PAGAMENTO --> EXCLUIDO: Exclusão da conta
    ATIVO --> EXCLUIDO: Exclusão da conta
```

### Status do agendamento

```mermaid
stateDiagram-v2
    [*] --> SOLICITADO: Aluno solicita horário
    SOLICITADO --> CONFIRMADO: Professor aprova
    SOLICITADO --> CANCELADO: Professor recusa ou uma das partes cancela
    CONFIRMADO --> CANCELADO: Uma das partes cancela com 1h ou mais de antecedência
    CANCELADO --> [*]
```

**Mudança:** substituí estados antigos de assinatura e reserva pelos estados reais `StatusConta` e `StatusAgendamento`, incluindo `EXCLUIDO` que também existe no enum.

---

## Caso de uso principal: solicitar aula

**Atores:** aluno, professor e sistema ConectaPro.

**Pré-condições:** aluno autenticado; professor com conta `ATIVO`; professor com matéria, modalidade e horário disponíveis.

**Fluxo principal:**
1. Aluno busca professor por filtros e consulta seu perfil.
2. Aluno escolhe matéria, modalidade e horário.
3. Sistema valida que o horário está em `ProfessorDisponibilidade`, está livre, é futuro e respeita a antecedência mínima configurada pelo professor.
4. Sistema cria `Agendamento` com status `SOLICITADO` e notifica o professor.
5. Professor aprova; sistema muda o status para `CONFIRMADO` e notifica o aluno.
6. Qualquer uma das partes pode cancelar com no mínimo uma hora de antecedência; o sistema muda o status para `CANCELADO`, libera o horário e notifica a outra parte.

**Pós-condições:** o agendamento fica em `CONFIRMADO` ou `CANCELADO`; nenhum pagamento de aula é cobrado pela plataforma.

**Mudança:** retirei pagamento do aluno e contratação B2B/split; descrevi a validação, aprovação e cancelamento conforme o fluxo de agendamento.

---

## Notas técnicas

- Autenticação com JWT e TOTP (2FA).
- Papéis definidos no modelo: `ALUNO`, `PROFESSOR` e `ADMIN`.
- Pagamento persistido em `Pagamento`; o checkout é da assinatura do professor.
- Entidades de agendamento: `Agendamento` e `ProfessorDisponibilidade`.
- Estados de agendamento: `SOLICITADO`, `CONFIRMADO` e `CANCELADO`.
- Estados de conta incluem `EM_ANALISE`, `REJEITADO`, `PENDENTE_PAGAMENTO`, `ATIVO`, `EXCLUIDO` e `BANIDO`.
- Cancelamento de agendamento exige pelo menos uma hora de antecedência.
