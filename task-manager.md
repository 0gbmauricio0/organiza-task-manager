# Plano de Projeto - Task Manager (Gerenciador de Tarefas)

## Overview
Este projeto é um gerenciador de tarefas completo com dashboard analítico de progresso pessoal, filtros avançados, categorização e autenticação segura de usuários.

## Project Type
WEB (React frontend + Express API backend + SQLite Database)

## Success Criteria
- O usuário consegue criar uma conta e fazer login com segurança.
- O painel exibe estatísticas precisas em tempo real (total, concluídas hoje, atrasadas).
- O usuário consegue filtrar e ordenar tarefas de forma avançada.
- O design é premium, responsivo e não utiliza roxo/violeta.
- Passa em todas as validações de segurança e auditorias de UX do kit.

## Tech Stack
- **Frontend:** React 19 (com Vite), TypeScript, Vanilla CSS para estilização (com design premium e animações), TanStack Query para estados e cache.
- **Backend:** Node.js, Express, TypeScript, Zod para validações de requisição.
- **Banco de Dados:** SQLite com Prisma ORM (modo WAL ativo).

## File Structure
```
c:\Users\Aluno\Documents\Projetos antigravity/
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── styles/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
├── server/
│   ├── prisma/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   └── index.ts
│   ├── package.json
│   └── tsconfig.json
└── task-manager.md
```

## Task Breakdown

### Tarefa 1: Setup do Backend e Banco de Dados (P0)
- **Agente:** `database-architect`
- **Skill:** `database-design`
- **Input:** Requisitos do banco de dados (usuários, tarefas, categorias, tags).
- **Output:** Projeto `server/` inicializado com TypeScript, Prisma, SQLite e o arquivo `schema.prisma` gerado.
- **Verify:** Executar as migrações iniciais do Prisma e validar a criação do banco SQLite local (`npx prisma migrate dev`).

### Tarefa 2: Endpoints de Autenticação e Middleware JWT (P0)
- **Agente:** `security-auditor`
- **Skill:** `api-patterns`
- **Input:** Schema do Prisma com modelo de Usuário.
- **Output:** Endpoints de registro, login, logout e validação de sessão usando cookies httpOnly e JWT.
- **Verify:** Chamar os endpoints com credenciais válidas/inválidas e certificar-se de que os cookies de autenticação são definidos e limpos adequadamente.

### Tarefa 3: Endpoints de Tarefas e Dashboard (P1)
- **Agente:** `backend-specialist`
- **Skill:** `api-patterns`
- **Input:** Sessão autenticada do usuário.
- **Output:** CRUD de tarefas, tags e categorias + rota do painel (`/api/dashboard/stats`).
- **Verify:** Executar buscas filtradas usando parâmetros de query (ex: por categoria ou prazo) e validar se a API retorna as tarefas ordenadas de acordo.

### Tarefa 4: Setup do Frontend e Autenticação (P1)
- **Agente:** `frontend-specialist`
- **Skill:** `frontend-architecture`
- **Input:** API do backend pronta.
- **Output:** Projeto React Vite com rotas públicas (Login/Registro) e privadas (Dashboard).
- **Verify:** Logar na aplicação através do frontend e checar se o estado global é preenchido com os dados do usuário.

### Tarefa 5: Dashboard e Gerenciamento de Tarefas com Filtros (P2)
- **Agente:** `frontend-specialist`
- **Skill:** `frontend-design`
- **Input:** API do backend e estado do frontend.
- **Output:** Interface do painel de controle com cards de estatísticas, listas de tarefas, filtros inteligentes e modals de criação/edição. Estilos em Vanilla CSS premium (sem roxo/violeta).
- **Verify:** Interagir com os filtros de categorias/tags, ordenar tarefas por data ou prioridade e marcar tarefas como concluídas, garantindo que o dashboard se atualize automaticamente.

---

## Phase X: Verification
- [ ] Rodar testes automatizados locais.
- [ ] Executar auditoria de UX: `python .agents/skills/frontend-design/scripts/ux_audit.py client`
- [ ] Executar escaneamento de segurança: `python .agents/skills/vulnerability-scanner/scripts/security_scan.py server`
- [ ] Executar compilação de produção (`npm run build` no cliente e servidor) sem avisos de erro.
