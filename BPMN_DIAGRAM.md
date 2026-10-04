# 📊 Diagrama BPMN - Processos ConectaPro

## 1️⃣ Processo de Agendamento e Contratação (Aluno/Responsável)

_Responsável: Victor H C Sampaio - RGM 11231101604_

```mermaid
graph TD
    subgraph Aluno["👤 Aluno"]
        A["🟢 Aluno Acessa Plataforma"]
        B["📝 Registrar ou Login"]
        C["🔍 Buscar Professor<br/>(Matéria + CEP)"]
        D["🎯 Filtrar Resultados<br/>(Preço, Disponibilidade)"]
        E["👤 Visualizar Perfil<br/>Completo"]
        F["📅 Visualizar Disponibilidade<br/>de Horários do Professor"]
        G["🗓️ Marcar/Reservar Horário"]
        O["⚠️ Tentar Novamente"]
    end

    subgraph MercadoPago["💳 Mercado Pago"]
        H["💳 Efetuar Pagamento<br/>(Valor Aula + R$ 5 Taxa)"]
        I{Pagamento<br/>Aprovado?}
        K["❌ Pagamento Rejeitado"]
    end

    subgraph Sistema["⚙️ Sistema"]
        J["✅ Contratação Confirmada"]
        L["📧 Email de Confirmação"]
        M["🎉 Aula Agendada"]
        N["📱 Notificação ao Professor"]
    end

    A --> B
    B --> C
    C --> D
    D --> E
    E --> F
    F --> G
    G --> H
    H --> I
    I -->|Sim| J
    I -->|Não| K
    J --> L
    L --> M
    M --> N
    K --> O
    O --> H

    style A fill:#90EE90
    style J fill:#90EE90
    style M fill:#90EE90
    style H fill:#87CEEB
    style K fill:#FFB6C6
```

---

## 2️⃣ Processo de Configuração de Perfil e Assinatura (Professor)

_Responsável: Victor H C Sampaio - RGM 11231101604_

```mermaid
graph TD
    subgraph Professor["👨‍🏫 Professor"]
        A["🟢 Professor Acessa Plataforma"]
        B["📝 Registrar ou Login"]
        C["👨‍🏫 Criar Perfil Profissional"]
        D["🎯 Definir Objetivo de Ensino<br/>(Particulares, Instituições ou Ambos)"]
        E["📚 Adicionar Disciplinas<br/>(Matérias + Nível)"]
        F["🔬 Detalhar Especialidades<br/>(Ex: Dev Web, Backend, Geometria)"]
        G["💼 Adicionar Experiência Profissional<br/>(Opcional: locais que lecionou, tempo de carreira)"]
        H["🎓 Inserir Certificações e Diplomas<br/>(Opcional)"]
        I["📅 Configurar Grade de Disponibilidade<br/>(Horários reservados são ocultados)"]
        J["🏠 Configurar Endereço<br/>(CEP + Localização)"]
        K["💰 Definir Preço da Aula<br/>e/ou Pretensão Salarial"]
        L["📸 Upload de Avatar<br/>(AWS S3)"]
        M["💳 Assinar Plano /<br/>Pagar Mensalidade"]
        Q["⚠️ Tentar Novamente"]
    end

    subgraph MercadoPago["💳 Mercado Pago"]
        N{Pagamento<br/>Aprovado?}
        P["❌ Pagamento Rejeitado"]
    end

    subgraph Sistema["⚙️ Sistema"]
        O["✅ Perfil Ativo e<br/>Visível na Busca"]
    end

    A --> B
    B --> C
    C --> D
    D --> E
    E --> F
    F --> G
    G --> H
    H --> I
    I --> J
    J --> K
    K --> L
    L --> M
    M --> N
    N -->|Sim| O
    N -->|Não| P
    P --> Q
    Q --> M

    style A fill:#DAA520
    style O fill:#DAA520
    style D fill:#87CEEB
    style F fill:#87CEEB
    style I fill:#87CEEB
    style K fill:#87CEEB
    style P fill:#FFB6C6
```

---

## 3️⃣ Processo de Busca e Filtro (Sistema)

_Responsável: Allan C D Guedes - RGM 11231103051_

```mermaid
graph TD
    subgraph Aluno["👤 Aluno"]
        A["🟢 Aluno Inicia Busca"]
        F["⚠️ Solicitar Novo CEP"]
    end

    subgraph Sistema["⚙️ Sistema"]
        B["📍 Validar CEP<br/>(ViaCEP)"]
        C{CEP<br/>Válido?}
        D["🗺️ Calcular Coordenadas"]
        E["❌ CEP Inválido"]
        G["🔍 Buscar Professores Ativos<br/>no Banco de Dados com Assinatura em Dia"]
        H["📏 Calcular Distância<br/>em KM"]
        I["⬆️ Ordenar por<br/>Proximidade"]
        J["🎯 Aplicar Filtros<br/>(Matéria, Preço)"]
        K["📊 Exibir Resultados<br/>ao Aluno"]
    end

    A --> B
    B --> C
    C -->|Sim| D
    C -->|Não| E
    E --> F
    F --> B
    D --> G
    G --> H
    H --> I
    I --> J
    J --> K

    style A fill:#90EE90
    style K fill:#90EE90
    style E fill:#FFB6C6
    style D fill:#87CEEB
    style H fill:#87CEEB
```

---

## 4️⃣ Processo de Pagamento da Mensalidade (Integração Mercado Pago)

_Responsável: Henrique C M Costa - RGM 11222100629_

### 4.1 - Pagamento da Mensalidade (Professor)

```mermaid
graph TD
    subgraph Professor["👨‍🏫 Professor"]
        A["🟢 Professor Escolhe Plano<br/>(Mensal, Trimestral ou Anual)"]
        N["🔄 Renovar Assinatura / Novo Pagamento"]
    end

    subgraph Sistema["⚙️ Sistema"]
        B["💳 Preparar Dados<br/>de Cobrança"]
        C["🔗 Enviar para<br/>Mercado Pago"]
        E["✅ Registrar Assinatura<br/>no Banco de Dados"]
        H["📧 Enviar Email de Confirmação<br/>(SendGrid)"]
        I["⚠️ Notificar Professor do Erro"]
        J["⏳ Aguardar Callback (Webhook)"]
        K["🎉 Perfil Ativado na Busca"]
        L["🔄 Permitir Nova Tentativa<br/>(Imediata)"]
        M["📅 Fim do Período Contratado"]
    end

    subgraph MercadoPago["💳 Mercado Pago"]
        D{Status da<br/>Transação?}
        F["❌ Pagamento Recusado"]
        G["⏳ Aguardando Confirmação"]
    end

    A --> B
    B --> C
    C --> D
    D -->|Aprovado| E
    D -->|Recusado| F
    D -->|Pendente| G
    E --> H
    F --> I
    G --> J
    H --> K
    I --> L
    K --> M
    M --> N
    J --> D
    L --> A
    N --> A

    style A fill:#DAA520
    style K fill:#DAA520
    style E fill:#87CEEB
    style F fill:#FFB6C6
    style H fill:#87CEEB
    style M fill:#6A5ACD
```

---

### 4.2 - Pagamento do Agendamento de Aula (Aluno)

```mermaid
graph TD
    subgraph Aluno["👤 Aluno"]
        A["🟢 Aluno Clica em Reservar/Pagar"]
    end

    subgraph Sistema["⚙️ Sistema"]
        B["💳 Preparar Cobrança<br/>(Valor Aula + R$ 5 Taxa)"]
        C["🔗 Enviar para<br/>Mercado Pago (Split/Checkout)"]
        E["✅ Registrar Agendamento<br/>no Banco de Dados"]
        H["📧 Notificar Aluno e Professor<br/>(SendGrid)"]
        I["⚠️ Notificar Aluno"]
        J["⏳ Aguardar Callback (Webhook)"]
        K["🎉 Aula Agendada e Confirmada"]
        L["🔄 Permitir Novo Pagamento"]
    end

    subgraph MercadoPago["💳 Mercado Pago"]
        D{Status da<br/>Transação?}
        F["❌ Pagamento Recusado"]
        G["⏳ Aguardando Confirmação"]
    end

    A --> B
    B --> C
    C --> D
    D -->|Aprovado| E
    D -->|Recusado| F
    D -->|Pendente| G
    E --> H
    F --> I
    G --> J
    H --> K
    I --> L
    J --> D
    L --> A

    style A fill:#90EE90
    style K fill:#90EE90
    style E fill:#87CEEB
    style F fill:#FFB6C6
    style H fill:#87CEEB
```

---

## 5️⃣ Processo de Autenticação com 2FA (TOTP)

_Responsável: Allan C D Guedes - RGM 11231103051_

```mermaid
graph TD
    subgraph Usuario["👤 Usuário"]
        A["🟢 Novo Usuário"]
        B["📝 Preencher Cadastro<br/>(Email + Senha)"]
        E["📱 Usuário Escaneia<br/>QR Code"]
        F["✔️ Confirmar TOTP"]
        G["🟢 Login - Email + Senha"]
        H["📱 Inserir Código TOTP<br/>(6 dígitos)"]
        M["🚪 Acesso à Plataforma"]
    end

    subgraph Sistema["⚙️ Sistema"]
        C["✅ Registrar Usuário<br/>no Banco de Dados"]
        D["🔐 Gerar QR Code TOTP"]
        I{Código<br/>Válido?}
        J["✅ Sessão Iniciada<br/>(JWT + Session)"]
        K["❌ Código Inválido"]
        L["🔄 Solicitar Novo Código"]
    end

    A --> B
    B --> C
    C --> D
    D --> E
    E --> F
    F --> G
    G --> H
    H --> I
    I -->|Sim| J
    I -->|Não| K
    K --> L
    L --> H
    J --> M

    style A fill:#90EE90
    style M fill:#90EE90
    style J fill:#87CEEB
    style K fill:#FFB6C6
```

---

## 6️⃣ Processo Completo de Fluxo (Visão Geral)

```mermaid
graph LR
    subgraph Professor["👨‍🏫 PROFESSOR"]
        P1["Registrar"] --> P2["Criar Perfil"] --> P3["Pagar Assinatura"] --> P4["✅ Perfil Ativo"]
    end

    subgraph Aluno["👤 ALUNO"]
        A1["Registrar"] --> A2["Buscar Prof."] --> A3["Ver Grade de Horários"] --> A4["Reservar & Pagar (Split/ Contrato)"]
    end

    subgraph Sistema["⚙️ SISTEMA"]
        S1["Validar CEP<br/>ViaCEP"] --> S2["Calcular<br/>Distância"] --> S3["Buscar<br/>BD (Prof. Ativos)"] --> S4["Ordenar &<br/>Filtrar"]
    end

    subgraph Pagamento["💳 MERCADO PAGO<br/>(Central Financeira)"]
        PAG1["Assinatura Mensal<br/>(Professor)"]
        PAG2["Aula Particular + Taxa<br/>(Aluno)"]
        PAG3["Salário / Contrato B2B<br/>(Escola/Universidade)"]
    end

    P3 --> PAG1
    PAG1 -->|Aprova| P4
    P4 -.->|Visível para| A2
    A2 --> S1
    S3 --> A3
    A4 --> PAG2
    A4 --> PAG3
    PAG2 -->|Aprova| A5["🎉 Aula/Contrato<br/>Agendado"]
    PAG3 -->|Aprova| A5
    A5 -.->|Notifica| P4

    style Professor fill:#DAA520
    style Cliente fill:#87CEEB
    style Sistema fill:#90EE90
    style Pagamentos fill:#FF6B6B
```

---

## 7️⃣ Sequência de Interações (Detalhado)

```mermaid
sequenceDiagram
    actor Teacher as 👨‍🏫 Professor
    actor Client as 👤 Aluno / Escola
    participant Frontend as 🖥️ Frontend
    participant Backend as 🔧 Backend
    participant Database as 🗄️ PostgreSQL
    participant ViaCEP as 📍 ViaCEP
    participant MercadoPago as 💳 Mercado Pago

    %% Fluxo 1: Assinatura do Professor
    Teacher->>Frontend: 1. Criar Perfil Completo
    Frontend->>MercadoPago: POST /checkout (Mensalidade)
    MercadoPago-->>Frontend: URL de pagamento
    Teacher->>MercadoPago: Inserir dados do cartão
    MercadoPago-->>Backend: Webhook de confirmação (Mensalidade)
    Backend->>Database: Atualizar status do professor (ATIVO)

    %% Fluxo 2: Busca e Validação
    Client->>Frontend: 2. Buscar professor por CEP
    Frontend->>Backend: GET /professores (CEP)
    Backend->>ViaCEP: Validar e obter coordenadas
    ViaCEP-->>Backend: Coordenadas validadas
    Backend->>Database: SELECT professores WHERE status='ATIVO'
    Database-->>Backend: Lista de professores ativos
    Backend->>Backend: Calcular distância
    Backend-->>Frontend: Lista ordenada por proximidade

    %% Fluxo 3: Reserva e Pagamento (Split)
    Client->>Frontend: 3. Visualizar Grade e Reservar
    Frontend->>Backend: POST /reserva (Bloqueia horário)
    Backend->>MercadoPago: POST /checkout_split (Aula + Taxa R$5)
    MercadoPago-->>Frontend: URL de pagamento
    Client->>MercadoPago: Inserir dados do cartão
    MercadoPago-->>Backend: Webhook de confirmação (Split)
    Backend->>Database: Salvar agendamento / contrato
    Backend-->>Teacher: Notificação de aula/contrato fechado
    Backend-->>Frontend: ✅ Reserva Confirmada
```

---

## 📊 Matriz de Responsabilidades (RACI)

| Atividade                      | Aluno/Escola | Professor | Sistema | Mercado Pago | AWS S3 | ViaCEP | SendGrid |
| ------------------------------ | ------------ | --------- | ------- | ------------ | ------ | ------ | -------- |
| Registrar Conta                | R            | R         | A       |              |        |        |          |
| Criar Perfil Completo          |              | R         | A       |              |        |        |          |
| Upload de Avatar/Certificados  |              | R         | A       |              | ✓      |        |          |
| Pagar Mensalidade (Assinatura) |              | R         | A       | ✓            |        |        |          |
| Buscar Professor por Filtros   | R            |           | A       |              |        |        |          |
| Validar CEP e Distância        |              |           | A       |              |        | ✓      |          |
| Reservar Horário na Grade      | R            |           | A       |              |        |        |          |
| Pagar Aula + Taxa (Split)      | R            |           | A       | ✓            |        |        |          |
| Enviar Emails/Notificações     |              |           | A       |              |        |        | ✓        |
| Auditoria de Transações        |              |           | A       |              |        |        |          |

**R = Responsável | A = Accountable (Aprovador) | C = Consultado | I = Informado**

---

## 🔄 Estados Possíveis no Sistema

### Status da Assinatura do Professor

```mermaid
stateDiagram-v2
    [*] --> ContaCriada: Registro inicial
    ContaCriada --> AguardandoPagamento: Perfil preenchido
    AguardandoPagamento --> Ativo: ✅ Mensalidade Paga
    Ativo --> Inadimplente: Falha na renovação
    Inadimplente --> Oculto: Removido das buscas
    Oculto --> Ativo: Nova tentativa aprovada
```

### Status da Reserva de Aula (Aluno/Escola)

```mermaid
stateDiagram-v2
    [*] --> Buscando: Cliente pesquisa
    Buscando --> VisualizandoGrade: Escolhe professor
    VisualizandoGrade --> ProcessandoPagamento: Reserva horário
    ProcessandoPagamento --> Agendado: ✅ Pagamento Split Aprovado
    ProcessandoPagamento --> Cancelado: ❌ Pagamento Recusado
    Agendado --> Concluido: Aula/Contrato finalizado
```

---

## 🎯 Caso de Uso Principal

**Título:** Contratar Professor (Aula Particular ou Instituição)

**Atores:** Aluno/Escola (Cliente), Professor, Sistema ConectaPro

**Pré-condições:**

- Cliente e Professor registrados e autenticados.
- Professor pagou a mensalidade e está com o status "ATIVO" (Visível na busca).
- Professor possui horários disponíveis em sua Grade.

**Fluxo Principal:**

1. Cliente acessa a plataforma e busca professor por matéria/CEP.
2. Sistema valida CEP (ViaCEP) e exibe professores ativos ordenados por proximidade.
3. Cliente acessa o perfil do professor, visualiza certificações e a grade de horários.
4. Cliente seleciona os horários desejados e clica em "Reservar e Pagar".
5. Sistema direciona para o checkout do Mercado Pago (com regra de Split).
6. Cliente efetua o pagamento (Valor do Professor + R$ 5,00 de Taxa da Plataforma).
7. Mercado Pago aprova a transação e repassa os valores correspondentes.
8. Sistema bloqueia o horário na grade do professor.
9. Sistema notifica (via SendGrid) ambas as partes sobre a confirmação da aula/contrato.

**Pós-condições:**

- Aula agendada ou contrato B2B firmado.
- Receita distribuída (Professor recebe o valor da hora/aula; Plataforma retém a taxa).
- Horários removidos da grade de disponibilidade pública do professor.

---

## 📝 Notas Técnicas

- **Autenticação:** JWT + Session + TOTP (2FA)
- **Autorização:** Role-based (PROFESSOR, ALUNO, ESCOLA, ADMIN)
- **Auditoria:** Todas as ações críticas (pagamentos, cadastros, reservas) são registradas.
- **Transações:** Uso de `@Transactional` para garantir consistência no banco de dados.
- **Localização:** Cálculo de distância via Haversine formula (PostGIS/GeoJSON recomendado para o futuro).
- **Segurança:** BCrypt para senhas, CORS habilitado, HTTPS obrigatório.
- **Pagamentos:** Integração com Mercado Pago via API de Checkout Pro com funcionalidade de Split de Pagamentos.
