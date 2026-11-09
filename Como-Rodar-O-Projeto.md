# ConectaPro

Marketplace educacional para conectar professores particulares e alunos.

## Pré-requisitos

- Java 21
- Node 24

## Back-end

```bash
cd ~/Projetos/ConectaPro
./mvnw -B dependency:go-offline
set -a
source ./.env
set +a
./mvnw spring-boot:run
```

API: `http://localhost:8080/api`

## Front-end

```bash
cd ~/Projetos/ConectaPro/frontend
npm install
npm run dev
```

App: `http://localhost:5173`
