import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

// Importando as rotas
import authRoutes from './routes/auth';
import taskRoutes from './routes/tasks';
import categoryRoutes from './routes/categories';
import tagRoutes from './routes/tags';
import dashboardRoutes from './routes/dashboard';

// Carregar variáveis de ambiente
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Middleware de CORS
app.use(cors({
  origin: CLIENT_URL,
  credentials: true
}));

// Middlewares padrão
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Rota de status básica
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// Iniciando o servidor
app.listen(PORT, () => {
  console.log(`[servidor] API rodando em http://localhost:${PORT}`);
});
