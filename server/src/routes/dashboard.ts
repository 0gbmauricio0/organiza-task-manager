import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticate } from '../middleware/auth';

const router = Router();

// GET /api/dashboard/stats
router.get('/stats', authenticate, async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const now = new Date();
  
  // Início do dia atual (00:00:00) para calcular tarefas completadas hoje
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  try {
    // 1. Total de tarefas
    const totalTasks = await prisma.task.count({
      where: { userId }
    });

    // 2. Concluídas hoje
    const completedToday = await prisma.task.count({
      where: {
        userId,
        status: 'COMPLETED',
        updatedAt: {
          gte: startOfToday
        }
      }
    });

    // 3. Atrasadas (PENDING e dueDate no passado)
    const overdueTasks = await prisma.task.count({
      where: {
        userId,
        status: 'PENDING',
        dueDate: {
          lt: now,
          not: null
        }
      }
    });

    // 4. Pendentes no total
    const pendingTasks = await prisma.task.count({
      where: {
        userId,
        status: 'PENDING'
      }
    });

    // 5. Distribuição por Categoria
    const categoriesWithCount = await prisma.category.findMany({
      where: { userId },
      include: {
        _count: {
          select: { tasks: true }
        }
      }
    });

    const categoryDistribution = categoriesWithCount.map(cat => ({
      id: cat.id,
      name: cat.name,
      color: cat.color,
      count: cat._count.tasks
    }));

    // 6. Produtividade nos últimos 7 dias (histórico para gráfico premium)
    const last7DaysStats = [];
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date();
      dayStart.setDate(now.getDate() - i);
      dayStart.setHours(0, 0, 0, 0);

      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);

      const count = await prisma.task.count({
        where: {
          userId,
          status: 'COMPLETED',
          updatedAt: {
            gte: dayStart,
            lte: dayEnd
          }
        }
      });

      last7DaysStats.push({
        date: dayStart.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric' }),
        count
      });
    }

    return res.json({
      totalTasks,
      completedToday,
      overdueTasks,
      pendingTasks,
      categoryDistribution,
      last7DaysStats
    });
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao carregar estatísticas do dashboard.' });
  }
});

export default router;
