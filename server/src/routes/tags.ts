import { Router, Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { authenticate } from '../middleware/auth';

const router = Router();

const createTagSchema = z.object({
  name: z.string().min(1, 'O nome da tag é obrigatório')
});

// GET /api/tags
router.get('/', authenticate, async (req: Request, res: Response) => {
  const userId = req.user!.id;
  try {
    const tags = await prisma.tag.findMany({
      where: { userId }
    });
    return res.json(tags);
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao buscar tags.' });
  }
});

// POST /api/tags
router.post('/', authenticate, async (req: Request, res: Response) => {
  const userId = req.user!.id;
  try {
    const { name } = createTagSchema.parse(req.body);
    const cleanedName = name.trim().toLowerCase();

    const existingTag = await prisma.tag.findFirst({
      where: { name: cleanedName, userId }
    });

    if (existingTag) {
      return res.status(400).json({ message: 'Esta tag já existe.' });
    }

    const tag = await prisma.tag.create({
      data: {
        name: cleanedName,
        userId
      }
    });

    return res.status(201).json(tag);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    return res.status(500).json({ message: 'Erro ao criar tag.' });
  }
});

// DELETE /api/tags/:id
router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const tagId = Number(req.params.id);

  try {
    const tag = await prisma.tag.findFirst({
      where: { id: tagId, userId }
    });

    if (!tag) {
      return res.status(404).json({ message: 'Tag não encontrada ou acesso negado.' });
    }

    await prisma.tag.delete({
      where: { id: tagId }
    });

    return res.json({ message: 'Tag deletada com sucesso.' });
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao deletar tag.' });
  }
});

export default router;
