import express from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const { status, type } = req.query;
    const where = {};
    if (status) where.status = status;
    if (type) where.type = type;

    const complaints = await prisma.complaint.findMany({
      where,
      include: {
        stall: true,
        assignee: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(complaints);
  } catch (e) {
    next(e);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const complaint = await prisma.complaint.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        stall: true,
        assignee: true,
      },
    });
    if (!complaint) return res.status(404).json({ error: '投诉不存在' });
    res.json(complaint);
  } catch (e) {
    next(e);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const complaint = await prisma.complaint.create({ data: req.body });
    res.json(complaint);
  } catch (e) {
    next(e);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const complaint = await prisma.complaint.update({
      where: { id: parseInt(req.params.id) },
      data: req.body,
    });
    res.json(complaint);
  } catch (e) {
    next(e);
  }
});

router.put('/:id/assign', async (req, res, next) => {
  try {
    const { assigneeId } = req.body;
    const complaint = await prisma.complaint.update({
      where: { id: parseInt(req.params.id) },
      data: {
        assigneeId,
        status: 'processing',
      },
    });
    res.json(complaint);
  } catch (e) {
    next(e);
  }
});

router.put('/:id/complete', async (req, res, next) => {
  try {
    const { handleResult } = req.body;
    const complaint = await prisma.complaint.update({
      where: { id: parseInt(req.params.id) },
      data: {
        handleResult,
        handleAt: new Date(),
        status: 'completed',
      },
    });
    res.json(complaint);
  } catch (e) {
    next(e);
  }
});

router.put('/:id/revisit', async (req, res, next) => {
  try {
    const { revisitResult } = req.body;
    const complaint = await prisma.complaint.update({
      where: { id: parseInt(req.params.id) },
      data: {
        revisitResult,
        revisitAt: new Date(),
        status: 'revisited',
      },
    });
    res.json(complaint);
  } catch (e) {
    next(e);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await prisma.complaint.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ success: true });
  } catch (e) {
    next(e);
  }
});

router.get('/statistics/summary', async (req, res, next) => {
  try {
    const pending = await prisma.complaint.count({ where: { status: 'pending' } });
    const processing = await prisma.complaint.count({ where: { status: 'processing' } });
    const completed = await prisma.complaint.count({ where: { status: 'completed' } });
    const revisited = await prisma.complaint.count({ where: { status: 'revisited' } });

    const types = ['菜品质量', '卫生问题', '服务态度', '价格争议', '其他'];
    const typeStats = {};
    for (const t of types) {
      typeStats[t] = await prisma.complaint.count({ where: { type: t } });
    }

    res.json({ pending, processing, completed, revisited, typeStats });
  } catch (e) {
    next(e);
  }
});

export default router;
