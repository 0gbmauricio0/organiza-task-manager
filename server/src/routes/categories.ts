import { Router, Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { authenticate } from '../middleware/auth';

const router = Router();

const createCategorySchema = z.object({
  name: z.string().min(1, 'O nome da categoria é obrigatório'),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Formato de cor hexadecimal inválido (deve ser #RRGGBB)').optional()
});

// GET /api/categories
router.get('/', authenticate, async (req: Request, res: Response) => {
  const userId = req.user!.id;
  try {
    const categories = await prisma.category.findMany({
      where: { userId }
    });
    return res.json(categories);
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao buscar categorias.' });
  }
});

// POST /api/categories
router.post('/', authenticate, async (req: Request, res: Response) => {
  const userId = req.user!.id;
  try {
    const { name, color } = createCategorySchema.parse(req.body);

    const existingCategory = await prisma.category.findFirst({
      where: { name: { equals: name }, userId }
    });

    if (existingCategory) {
      return res.status(400).json({ message: 'Uma categoria com este nome já existe.' });
    }

    const category = await prisma.category.create({
      data: {
        name,
        color: color || '#3b82f6',
        userId
      }
    });

    return res.status(201).json(category);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    return res.status(500).json({ message: 'Erro ao criar categoria.' });
  }
});

// DELETE /api/categories/:id
router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const categoryId = Number(req.params.id);

  try {
    const category = await prisma.category.findFirst({
      where: { id: categoryId, userId }
    });

    if (!category) {
      return res.status(404).json({ message: 'Categoria não encontrada ou acesso negado.' });
    }

    await prisma.category.delete({
      where: { id: categoryId }
    });

    return res.json({ message: 'Categoria deletada com sucesso.' });
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao deletar categoria.' });
  }
});

export default router;
