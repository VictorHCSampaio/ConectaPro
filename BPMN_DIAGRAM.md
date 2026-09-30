# 📊 Diagrama BPMN - Processos ConectaPro

## 1️⃣ Processo de Contratação (Aluno/Responsável)

```mermaid
graph TD
    A["🟢 Aluno Acessa Plataforma"] --> B["📝 Registrar ou Login"]
    B --> C["🔍 Buscar Professor<br/>(Matéria + CEP)"]
    C --> D["🎯 Filtrar Resultados<br/>(Preço, Disponibilidade)"]
    D --> E["👤 Visualizar Perfil<br/>Completo"]
    E --> F["💬 Solicitar Aula"]
    F --> G["💳 Efetuar Pagamento<br/>(Mercado Pago)"]
    G --> H{Pagamento<br/>Aprovado?}
    H -->|Sim| I["✅ Contratação Confirmada"]
    H -->|Não| J["❌ Pagamento Rejeitado"]
    I --> K["📧 Email de Confirmação"]
    K --> L["🎉 Aula Agendada"]
    J --> M["⚠️ Tentar Novamente"]
    M --> G
    
    style A fill:#90EE90
    style L fill:#90EE90
    style I fill:#87CEEB
    style J fill:#FFB6C6
```

---

## 2️⃣ Processo de Configuração de Perfil (Professor)

```mermaid
graph TD
    A["🟢 Professor Acessa Plataforma"] --> B["📝 Registrar ou Login"]
    B --> C["👨‍🏫 Criar Perfil Profissional"]
    C --> D["📚 Adicionar Disciplinas<br/>(Matérias + Nível)"]
    D --> E["📅 Definir Disponibilidade<br/>(Dias e Horários)"]
    E --> F["🏠 Configurar Endereço<br/>(CEP + Localização)"]
    F --> G["💰 Definir Preços<br/>(Particular + Instituições)"]
    G --> H["📸 Upload de Avatar<br/>(AWS S3)"]
    H --> I["✅ Perfil Ativo<br/>Visível na Busca"]
    
    style A fill:#FFD700
    style I fill:#FFD700
    style D fill:#87CEEB
    style G fill:#87CEEB
```

---

## 3️⃣ Processo de Busca e Filtro (Sistema)

```mermaid
graph TD
    A["🟢 Aluno Inicia Busca"] --> B["📍 Validar CEP<br/>(ViaCEP)"]
    B --> C{CEP<br/>Válido?}
    C -->|Sim| D["🗺️ Calcular Coordenadas"]
    C -->|Não| E["❌ CEP Inválido"]
    E --> F["⚠️ Solicitar Novo CEP"]
    F --> B
    D --> G["🔍 Buscar Professores<br/>no Banco de Dados"]
    G --> H["📏 Calcular Distância<br/>em KM"]
    H --> I["⬆️ Ordenar por<br/>Proximidade"]
    I --> J["🎯 Aplicar Filtros<br/>(Matéria, Preço)"]
    J --> K["📊 Exibir Resultados<br/>ao Aluno"]
    
    style A fill:#90EE90
    style K fill:#90EE90
    style E fill:#FFB6C6
    style D fill:#87CEEB
    style H fill:#87CEEB
```

---

## 4️⃣ Processo de Pagamento (Integração Mercado Pago)

```mermaid
graph TD
    A["🟢 Aluno Clica em Pagar"] --> B["💳 Preparar Dados<br/>de Cobrança"]
    B --> C["🔗 Enviar para<br/>Mercado Pago"]
    C --> D{Status da<br/>Transação?}
    D -->|Aprovado| E["✅ Registrar Pagamento<br/>no Banco de Dados"]
    D -->|Recusado| F["❌ Pagamento Recusado"]
    D -->|Pendente| G["⏳ Aguardando Confirmação"]
    E --> H["📧 Enviar Email<br/>de Confirmação<br/>(SendGrid)"]
    F --> I["⚠️ Notificar Aluno"]
    G --> J["⏳ Aguardar Callback"]
    H --> K["🎉 Contratação Ativa"]
    I --> L["🔄 Permitir Novo Pagamento"]
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

```mermaid
graph TD
    A["🟢 Novo Usuário"] --> B["📝 Preencher Cadastro<br/>(Email + Senha)"]
    B --> C["✅ Registrar Usuário<br/>no Banco de Dados"]
    C --> D["🔐 Gerar QR Code TOTP"]
    D --> E["📱 Usuário Escaneia<br/>QR Code"]
    E --> F["✔️ Confirmar TOTP"]
    F --> G["🟢 Login - Email + Senha"]
    G --> H["📱 Inserir Código TOTP<br/>(6 dígitos)"]
    H --> I{Código<br/>Válido?}
    I -->|Sim| J["✅ Sessão Iniciada<br/>(JWT + Session)"]
    I -->|Não| K["❌ Código Inválido"]
    K --> L["🔄 Solicitar Novo Código"]
    L --> H
    J --> M["🚪 Acesso à Plataforma"]
    
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
        P1["Registrar"] --> P2["Criar Perfil"] --> P3["Definir Aulas"] --> P4["✅ Ativo"]
    end
    
    subgraph Aluno["👤 ALUNO"]
        A1["Registrar"] --> A2["Buscar"] --> A3["Filtrar"] --> A4["Selecionar"] --> A5["Pagar"]
    end
    
    subgraph Sistema["⚙️ SISTEMA"]
        S1["Validar CEP<br/>ViaCEP"] --> S2["Calcular<br/>Distância"] --> S3["Buscar<br/>BD"] --> S4["Ordenar &<br/>Filtrar"]
    end
    
    subgraph Pagamento["💳 PAGAMENTO"]
        PAG1["Mercado Pago"] --> PAG2["Registrar"] --> PAG3["Email<br/>SendGrid"]
    end
    
    P4 -.->|Disponível| A2
    A2 --> S1
    S4 --> A3
    A5 --> PAG1
    PAG3 --> A6["✅ Contrato Ativo"]
    
    style Professor fill:#FFD700
    style Aluno fill:#87CEEB
    style Sistema fill:#90EE90
    style Pagamento fill:#FF6B6B
```

---

## 7️⃣ Sequência de Interações (Detalhado)

```mermaid
sequenceDiagram
    actor Student as 👤 Aluno
    participant Frontend as 🖥️ Frontend React
    participant Backend as 🔧 Backend Spring Boot
    participant Database as 🗄️ PostgreSQL
    participant ViaCEP as 📍 ViaCEP
    participant MercadoPago as 💳 Mercado Pago
    
    Student->>Frontend: 1. Registrar/Login
    Frontend->>Backend: POST /auth/register
    Backend->>Database: Salvar usuário
    Database-->>Backend: Usuário criado
    
    Student->>Frontend: 2. Buscar professor por CEP
    Frontend->>Backend: GET /professores (CEP)
    Backend->>ViaCEP: Validar e obter coordenadas
    ViaCEP-->>Backend: Coordenadas
    Backend->>Database: SELECT professores
    Database-->>Backend: Lista de professores
    Backend->>Backend: Calcular distância
    Backend-->>Frontend: Lista ordenada por distância
    
    Student->>Frontend: 3. Visualizar perfil
    Frontend->>Backend: GET /professores/{id}
    Backend->>Database: SELECT professor detalhes
    Database-->>Backend: Dados completos
    Backend-->>Frontend: Perfil do professor
    
    Student->>Frontend: 4. Efetuar pagamento
    Frontend->>MercadoPago: POST /checkout
    MercadoPago-->>Frontend: URL de pagamento
    Student->>MercadoPago: Inserir dados cartão
    MercadoPago-->>Backend: Webhook de confirmação
    Backend->>Database: Registrar pagamento
    Database-->>Backend: Pagamento salvo
    Backend-->>Frontend: ✅ Sucesso
```

---

## 📊 Matriz de Responsabilidades (RACI)

| Atividade | Aluno | Professor | Sistema | Mercado Pago | AWS S3 | ViaCEP | SendGrid |
|-----------|-------|-----------|---------|--------------|--------|--------|----------|
| Registrar | R | R | A | | | | |
| Criar Perfil | | R | A | | | | |
| Upload Avatar | | R | A | ✓ | | | |
| Buscar Professor | R | | A | | | | |
| Validar CEP | | | A | | | ✓ | |
| Calcular Distância | | | A | | | | |
| Pagar Assinatura | R | | A | ✓ | | | |
| Enviar Email | | | A | | | | ✓ |
| Auditoria | | | A | | | | |

**R = Responsável | A = Accountable | C = Consulta | I = Informado**

---

## 🔄 Estados Possíveis de Uma Contratação

```mermaid
stateDiagram-v2
    [*] --> Buscando: Aluno busca
    Buscando --> PerfisVisualizados: Professores encontrados
    PerfisVisualizados --> Selecionado: Aluno escolhe
    Selecionado --> Pagando: Clica em contratar
    Pagando --> PendentePagamento: Aguardando processamento
    PendentePagamento --> Ativa: ✅ Pagamento confirmado
    PendentePagamento --> Cancelada: ❌ Pagamento rejeitado
    Ativa --> EmAndamento: Aula agendada
    EmAndamento --> Concluida: Aula finalizada
    Cancelada --> [*]
    Concluida --> [*]
```

---

## 🎯 Caso de Uso Principal

**Título:** Contratar Professor Particular

**Atores:** Aluno, Professor, Sistema ConectaPro

**Pré-condições:**
- Aluno registrado e autenticado
- Professor tem perfil completo e ativo
- Sistema tem conexão com ViaCEP e Mercado Pago

**Fluxo Principal:**
1. Aluno acessa a plataforma
2. Aluno busca professor por matéria e CEP
3. Sistema valida CEP com ViaCEP
4. Sistema calcula distância até cada professor
5. Sistema exibe professores ordenados por proximidade
6. Aluno visualiza detalhes do perfil
7. Aluno clica em "Contratar"
8. Aluno efetua pagamento via Mercado Pago
9. Sistema registra a contratação
10. Sistema envia email de confirmação via SendGrid
11. Aula é agendada

**Pós-condições:**
- Contratação ativa no sistema
- Emails enviados para aluno e professor
- Histórico registrado na auditoria

---

## 📝 Notas Técnicas

- **Autenticação:** JWT + Session + TOTP (2FA)
- **Autorização:** Role-based (PROFESSOR, ALUNO, ADMIN)
- **Auditoria:** Todas as ações críticas são registradas
- **Transações:** Uso de `@Transactional` para garantir consistência
- **Localização:** Cálculo de distância via Haversine formula
- **Segurança:** BCrypt para senhas, CORS habilitado, HTTPS obrigatório
