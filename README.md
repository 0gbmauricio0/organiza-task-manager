# ⚡ Organiza - Gerenciador de Tarefas Premium

> Um painel de produtividade pessoal moderno e premium para organizar suas tarefas com inteligência.

![Versão](https://img.shields.io/badge/versão-1.0.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![Express](https://img.shields.io/badge/Express-4.x-black?logo=express)
![SQLite](https://img.shields.io/badge/SQLite-3.x-003B57?logo=sqlite)
![Licença](https://img.shields.io/badge/licença-MIT-green)

---

## 📋 Sobre o Projeto

O **Organiza** é um gerenciador de tarefas fullstack com interface premium e painel de controle analítico. Projetado para quem quer ter uma visão completa da própria rotina, com categorias, prioridades, tags e métricas visuais em tempo real.

### ✨ Funcionalidades Principais

- **Dashboard analítico** com métricas em tempo real:
  - Total de tarefas criadas
  - Concluídas hoje
  - Tarefas atrasadas
  - Pendentes no total
  - Histórico de produtividade dos últimos 7 dias
- **Criação de tarefas** com:
  - Título e descrição detalhada
  - Data limite (prazo)
  - Prioridade (Alta, Média, Baixa)
  - Categoria colorida (Trabalho, Casa, Estudos, e personalizadas)
  - Tags livres com palavras-chave
- **Filtros e ordenação avançados**:
  - Busca por texto (título e descrição)
  - Filtro por categoria, prioridade, status e tag
  - Ordenação por data de criação, prazo ou ordem alfabética
- **Autenticação segura** com JWT em cookies HttpOnly
- **Modo claro / escuro** com alternância instantânea
- **Design responsivo** para desktop e mobile

---

## 🛠️ Stack Tecnológica

| Camada        | Tecnologia                                |
| ------------- | ----------------------------------------- |
| **Frontend**  | React 18, TypeScript, Vite 5              |
| **Estilo**    | Vanilla CSS (Glassmorphism, animações)    |
| **Estado**    | TanStack Query (React Query) v5           |
| **Roteamento**| React Router DOM v6                       |
| **Ícones**    | Lucide React                              |
| **Backend**   | Node.js, Express 4, TypeScript            |
| **Validação** | Zod                                       |
| **Banco**     | SQLite (modo WAL) + Prisma ORM            |
| **Auth**      | JWT + Bcryptjs + Cookies HttpOnly         |

---

## 📁 Estrutura do Projeto

```
organiza/
├── client/                  # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/      # Dashboard, Login, Register
│   │   ├── context/         # AuthContext (estado global)
│   │   ├── lib/             # Utilitários (api.ts)
│   │   └── styles/          # CSS Premium (index, auth, dashboard)
│   ├── index.html
│   └── vite.config.ts
│
└── server/                  # Backend (Express + Prisma)
    ├── prisma/
    │   └── schema.prisma    # Schema do banco de dados
    └── src/
        ├── routes/          # auth, tasks, categories, tags, dashboard
        ├── middleware/       # Autenticação JWT
        └── index.ts         # Ponto de entrada da API
```

---

## 🚀 Como Rodar Localmente

### Pré-requisitos

- [Node.js](https://nodejs.org/) v18 ou superior
- [npm](https://www.npmjs.com/) v9 ou superior

### 1. Clonar o repositório

```bash
git clone https://github.com/SEU_USUARIO/organiza.git
cd organiza
```

### 2. Configurar o Backend

```bash
cd server
npm install

# Copiar variáveis de ambiente
cp .env.example .env
# Edite o .env e configure o JWT_SECRET com um valor seguro

# Criar banco de dados e aplicar migrações
npx prisma migrate dev

# Iniciar servidor em modo desenvolvimento
npm run dev
```

O servidor estará disponível em: `http://localhost:3001`

### 3. Configurar o Frontend

```bash
cd ../client
npm install

# Iniciar o cliente em modo desenvolvimento
npm run dev
```

O app estará disponível em: `http://localhost:5173`

---

## 🔌 Endpoints da API

### Autenticação (`/api/auth`)
| Método | Rota         | Descrição                  |
| ------ | ------------ | -------------------------- |
| POST   | `/register`  | Cadastrar novo usuário     |
| POST   | `/login`     | Entrar com e-mail e senha  |
| POST   | `/logout`    | Encerrar sessão            |
| GET    | `/me`        | Dados do usuário atual     |

### Tarefas (`/api/tasks`)
| Método | Rota    | Descrição                         |
| ------ | ------- | --------------------------------- |
| GET    | `/`     | Listar tarefas (com filtros)      |
| POST   | `/`     | Criar nova tarefa                 |
| PUT    | `/:id`  | Atualizar tarefa                  |
| DELETE | `/:id`  | Excluir tarefa                    |

**Query params de filtro:** `?q=busca&categoryId=1&priority=HIGH&status=PENDING&tag=urgente&sortBy=dueDate&sortOrder=asc`

### Categorias e Tags
| Método | Rota               | Descrição              |
| ------ | ------------------ | ---------------------- |
| GET    | `/api/categories`  | Listar categorias      |
| POST   | `/api/categories`  | Criar categoria        |
| GET    | `/api/tags`        | Listar tags            |
| POST   | `/api/tags`        | Criar tag              |

### Dashboard
| Método | Rota                    | Descrição              |
| ------ | ----------------------- | ---------------------- |
| GET    | `/api/dashboard/stats`  | Métricas do painel     |

---

## 🔐 Variáveis de Ambiente

Crie um arquivo `.env` na pasta `server/` com as seguintes variáveis:

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="sua-chave-secreta-segura-aqui"
PORT=3001
CLIENT_URL="http://localhost:5173"
NODE_ENV="development"
```

> ⚠️ **Nunca commite o arquivo `.env` com dados reais em repositórios públicos.**

---

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. Commite suas mudanças (`git commit -m 'feat: adiciona nova funcionalidade'`)
4. Faça push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

---

## 📄 Licença

Distribuído sob a licença **MIT**. Veja o arquivo `LICENSE` para mais informações.

---

<p align="center">
  Feito com ⚡ e muito café
</p>
