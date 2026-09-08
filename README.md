# ConectaPro

Marketplace de aulas particulares: professor cria um perfil, escola ou família busca, filtra e compara antes de entrar em contato.

TCC — Universidade de Mogi das Cruzes.

## Sumário

- [O problema](#o-problema)
- [Estado atual](#estado-atual)
- [Telas implementadas](#telas-implementadas)
- [Stack](#stack)
- [Rodando o projeto](#rodando-o-projeto)
- [Estrutura de pastas do frontend](#estrutura-de-pastas-do-frontend)
- [Próximas versões](#próximas-versões)

## O problema

Achar professor particular hoje é indicação de boca a boca ou grupo de WhatsApp. Não dá pra comparar formação, preço e avaliação antes de fechar. Do lado do professor, divulgar aula também depende de rede de contatos, sem um lugar único onde escolas e famílias o encontrem.

## Estado atual

| Módulo | Onde | Situação |
|---|---|---|
| Frontend | `frontend/` | 3 telas navegáveis e funcionais, dados mocados em memória |
| Backend | raiz do repo | esqueleto do Spring Boot Initializr, sem controller/entidade/banco |

Hoje dá pra navegar o site inteiro e ver como ele se comporta, mas nenhuma ação (cadastro, login, busca) persiste ou sai do navegador.

## Telas implementadas

### `/` — Landing page

- Header fixo com logo, navegação e "Entrar"/"Cadastrar"; abaixo de 768px vira menu hambúrguer
- Hero com busca por matéria e CEP/localização, mais uma linha de "matérias populares" que preenche o campo ao clicar
- Card de professor de exemplo com estrelas preenchidas proporcionalmente à nota (4.3 preenche 86% da quinta estrela, não arredonda pra estrela cheia)
- Seção "Como funciona" com os 3 passos do fluxo

### `/professores` — Busca de professores

Lista os 9 professores de `frontend/src/lib/mockTeachers.ts`. Filtros:

| Filtro | Comportamento |
|---|---|
| Matéria | checkboxes, múltipla escolha; nenhuma marcada mostra todo mundo |
| Modalidade | rádio, online ou presencial; sem opção "as duas" |
| Valor da hora-aula | slider de dois cursores, R$ 40 a R$ 120 |
| Somente verificados | switch liga/desliga |

Mais busca livre por nome/matéria e ordenação (relevância, menor preço, maior avaliação). Tudo roda no navegador dentro de um `useMemo`, sem paginação nem chamada de rede. Filtro sem resultado mostra estado vazio com botão de limpar.

"Ver perfil" leva pro `/login` — a página de perfil ainda não existe, então virou um gate provisório, não uma regra de produto definitiva.

### `/login` e `/register` — Autenticação

As duas rotas renderizam o mesmo componente (`AuthPage.tsx`), que decide o conteúdo pela URL atual. Isso é proposital: o card não desmonta ao trocar de rota, o que permite animar a troca.

Decisões que valem registrar:
- o painel roxo desliza fisicamente de coluna ao trocar de tela (`framer-motion`, prop `layout="position"`)
- o conteúdo do formulário troca instantaneamente, sem crossfade — animar a troca dos campos fazia o formulário de registro aparecer por cima do de login por uma fração de segundo, então tiramos
- a altura do card não muda entre login e registro: os dois formulários ficam sempre no DOM ocupando o mesmo espaço de grid, um deles com `visibility: hidden`, reservando sempre a altura do maior (registro)

Validação em `frontend/src/lib/validation.ts`: e-mail válido, senha com 8+ caracteres, confirmação igual à senha, termos aceitos no registro. Submit simula rede com `setTimeout` e mostra sucesso; nada é salvo.

## Stack

**Frontend** — `frontend/`

| Peça | Versão / lib | Por quê |
|---|---|---|
| React + TypeScript | React 19 | tipos pros formulários e filtros (`ModalityOption`, `Teacher`) |
| Vite | 8 | dev server e build |
| Tailwind CSS | v4 | tokens de cor, sombra e animação em `src/index.css` via `@theme`/`@utility` |
| React Router | 7 | 4 rotas: `/`, `/professores`, `/login`, `/register` |
| Framer Motion | — | só na troca de coluna do login/registro; resto das animações é CSS puro |
| lucide-react | — | ícones |

**Backend** — raiz do repo

Java 21, Spring Boot 4.1, Spring Data JPA, Lombok, Maven. Sem banco de dados configurado ainda.

## Rodando o projeto

### Frontend
```bash
cd frontend
npm install
npm run dev        # http://localhost:5173
```
```bash
npm run build       # tsc -b && vite build, falha se houver erro de tipo
npm run lint         # oxlint
npm run preview      # serve o resultado de npm run build
```

### Backend
```bash
./mvnw spring-boot:run     # Linux/macOS/WSL
mvnw.cmd spring-boot:run   # Windows
```
Sobe em `http://localhost:8080`, mas hoje não responde nenhuma rota própria — só confirma que o Spring Boot inicializa.

## Estrutura de pastas do frontend

```
frontend/src/
├── App.tsx                     # define as 4 rotas
├── pages/
│   ├── LandingPage.tsx
│   ├── SearchTeachersPage.tsx
│   └── AuthPage.tsx
├── components/
│   ├── landing/                # SiteHeader, SiteFooter, HeroSection, HowItWorks...
│   ├── search/                 # TeacherSearchBar, FilterPanel, TeacherResultCard
│   ├── auth/                   # LoginForm, RegisterForm, AccentPanel, FormFeedback
│   └── ui/                     # Button, Input, Checkbox, Radio, Switch, RangeSlider, StarRating...
├── hooks/useForm.ts             # estado + validação genérica de formulário
├── lib/
│   ├── validation.ts
│   ├── mockTeachers.ts         # os 9 professores de exemplo
│   └── cn.ts                   # helper pra combinar classes do Tailwind
└── types/
    ├── auth.ts
    └── teacher.ts
```

`SiteHeader` e `SiteFooter` moram em `components/landing/` mas são reaproveitados também na busca de professores.

## Próximas versões

**v0.2 — Backend de verdade**
API Spring Boot com endpoints de professores, autenticação e cadastro. `frontend/.env.example` já reserva `VITE_API_URL` pra quando o frontend trocar `mockTeachers.ts` por chamadas reais.

**v0.3 — Perfil do professor**
Página de perfil individual — hoje "Ver perfil" só redireciona pro login porque ela não existe.

**v0.4 — Escala**
Paginação na busca de professores, se a base crescer além do que cabe numa lista simples.
