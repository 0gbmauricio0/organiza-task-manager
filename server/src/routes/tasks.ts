import { Router, Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { authenticate } from '../middleware/auth';

const router = Router();

// Zod schemas para validação
const createTaskSchema = z.object({
  title: z.string().min(1, 'O título é obrigatório'),
  description: z.string().optional().nullable(),
  dueDate: z.string().optional().nullable().transform(val => val ? new Date(val) : null),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional().default('MEDIUM'),
  categoryId: z.number().optional().nullable(),
  tags: z.array(z.string()).optional().default([])
});

const updateTaskSchema = z.object({
  title: z.string().min(1, 'O título é obrigatório').optional(),
  description: z.string().optional().nullable(),
  dueDate: z.string().optional().nullable().transform(val => val ? new Date(val) : null),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  status: z.enum(['PENDING', 'COMPLETED']).optional(),
  categoryId: z.number().optional().nullable(),
  tags: z.array(z.string()).optional()
});

// GET /api/tasks (Filtros e ordenação avançada)
router.get('/', authenticate, async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { q, categoryId, priority, status, tag, sortBy, sortOrder } = req.query;

  try {
    const whereClause: any = { userId };

    // Filtro por busca textual (título ou descrição)
    if (q) {
      whereClause.OR = [
        { title: { contains: String(q) } },
        { description: { contains: String(q) } }
      ];
    }

    // Filtro por categoria
    if (categoryId) {
      whereClause.categoryId = Number(categoryId);
    }

    // Filtro por prioridade
    if (priority) {
      whereClause.priority = String(priority);
    }

    // Filtro por status
    if (status) {
      whereClause.status = String(status);
    }

    // Filtro por tag (nome da tag)
    if (tag) {
      whereClause.tags = {
        some: {
          name: String(tag)
        }
      };
    }

    // Ordenação
    let orderByClause: any = { createdAt: 'desc' }; // Padrão
    if (sortBy) {
      const field = String(sortBy);
      const order = String(sortOrder || 'asc').toLowerCase() === 'desc' ? 'desc' : 'asc';
      
      if (field === 'dueDate' || field === 'createdAt' || field === 'title') {
        orderByClause = { [field]: order };
      } else if (field === 'priority') {
        // Ordenação manual de prioridades não é nativa simples em SQLite pelo Prisma sem case,
        // mas podemos ordenar primeiro por prioridade e depois processar, ou ordenar pelo campo de texto.
        // Como o SQLite ordena alfabeticamente (HIGH, LOW, MEDIUM), podemos aproximar ou manter ordenado no DB.
        orderByClause = { priority: order };
      }
    }

    const tasks = await prisma.task.findMany({
      where: whereClause,
      include: {
        category: true,
        tags: true
      },
      orderBy: orderByClause
    });

    return res.json(tasks);
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao buscar tarefas.' });
  }
});

// GET /api/tasks/:id
router.get('/:id', authenticate, async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const taskId = Number(req.params.id);

  try {
    const task = await prisma.task.findFirst({
      where: { id: taskId, userId },
      include: {
        category: true,
        tags: true
      }
    });

    if (!task) {
      return res.status(404).json({ message: 'Tarefa não encontrada.' });
    }

    return res.json(task);
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao buscar detalhe da tarefa.' });
  }
});

// POST /api/tasks (Criação de tarefa com criação/conexão dinâmica de tags)
router.post('/', authenticate, async (req: Request, res: Response) => {
  const userId = req.user!.id;

  try {
    const data = createTaskSchema.parse(req.body);
    const { tags, ...taskData } = data;

    // Processamento dinâmico de tags: encontrar ou criar cada uma
    const tagConnections = [];
    if (tags && tags.length > 0) {
      for (const tagName of tags) {
        const cleanedName = tagName.trim().toLowerCase();
        if (cleanedName) {
          let tagInstance = await prisma.tag.findFirst({
            where: { name: cleanedName, userId }
          });

          if (!tagInstance) {
            tagInstance = await prisma.tag.create({
              data: { name: cleanedName, userId }
            });
          }
          tagConnections.push({ id: tagInstance.id });
        }
      }
    }

    const task = await prisma.task.create({
      data: {
        ...taskData,
        userId,
        tags: {
          connect: tagConnections
        }
      },
      include: {
        category: true,
        tags: true
      }
    });

    return res.status(201).json(task);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    return res.status(500).json({ message: 'Erro ao criar tarefa.' });
  }
});

// PUT /api/tasks/:id (Atualização de dados e tags)
router.put('/:id', authenticate, async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const taskId = Number(req.params.id);

  try {
    const data = updateTaskSchema.parse(req.body);
    const { tags, ...taskData } = data;

    // Verificar se a tarefa pertence ao usuário
    const existingTask = await prisma.task.findFirst({
      where: { id: taskId, userId }
    });

    if (!existingTask) {
      return res.status(404).json({ message: 'Tarefa não encontrada ou acesso negado.' });
    }

    // Se tags forem enviadas, atualizamos a relação de muitos-para-muitos
    let tagsUpdate: any = undefined;
    if (tags !== undefined) {
      const tagConnections = [];
      for (const tagName of tags) {
        const cleanedName = tagName.trim().toLowerCase();
        if (cleanedName) {
          let tagInstance = await prisma.tag.findFirst({
            where: { name: cleanedName, userId }
          });

          if (!tagInstance) {
            tagInstance = await prisma.tag.create({
              data: { name: cleanedName, userId }
            });
          }
          tagConnections.push({ id: tagInstance.id });
        }
      }
      // Limpa as tags anteriores e conecta as novas
      tagsUpdate = {
        set: [],
        connect: tagConnections
      };
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        ...taskData,
        tags: tagsUpdate
      },
      include: {
        category: true,
        tags: true
      }
    });

    return res.json(updatedTask);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    return res.status(500).json({ message: 'Erro ao atualizar tarefa.' });
  }
});

// DELETE /api/tasks/:id
router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const taskId = Number(req.params.id);

  try {
    const existingTask = await prisma.task.findFirst({
      where: { id: taskId, userId }
    });

    if (!existingTask) {
      return res.status(404).json({ message: 'Tarefa não encontrada ou acesso negado.' });
    }

    await prisma.task.delete({
      where: { id: taskId }
    });

    return res.json({ message: 'Tarefa excluída com sucesso.' });
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao excluir tarefa.' });
  }
});

export default router;
