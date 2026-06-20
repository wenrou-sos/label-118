import express from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const { status, isPublic } = req.query;
    const where = {};
    if (status) where.status = status;
    if (isPublic !== undefined) where.isPublic = isPublic === 'true';

    const repairs = await prisma.equipmentRepair.findMany({
      where,
      include: {
        equipment: true,
        stall: true,
        assignee: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(repairs);
  } catch (e) {
    next(e);
  }
});

router.get('/equipments', async (req, res, next) => {
  try {
    const equipments = await prisma.equipment.findMany({
      orderBy: { name: 'asc' },
    });
    res.json(equipments);
  } catch (e) {
    next(e);
  }
});

router.post('/equipments', async (req, res, next) => {
  try {
    const equipment = await prisma.equipment.create({ data: req.body });
    res.json(equipment);
  } catch (e) {
    next(e);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const repair = await prisma.equipmentRepair.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        equipment: true,
        stall: true,
        assignee: true,
      },
    });
    if (!repair) return res.status(404).json({ error: '报修单不存在' });
    res.json(repair);
  } catch (e) {
    next(e);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const repair = await prisma.equipmentRepair.create({ data: req.body });
    if (repair.equipmentId) {
      await prisma.equipment.update({
        where: { id: repair.equipmentId },
        data: { status: 'repairing' },
      });
    }
    res.json(repair);
  } catch (e) {
    next(e);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const repair = await prisma.equipmentRepair.update({
      where: { id: parseInt(req.params.id) },
      data: req.body,
    });
    res.json(repair);
  } catch (e) {
    next(e);
  }
});

router.put('/:id/assign', async (req, res, next) => {
  try {
    const { assigneeId } = req.body;
    const repair = await prisma.equipmentRepair.update({
      where: { id: parseInt(req.params.id) },
      data: {
        assigneeId,
        status: 'processing',
      },
    });
    res.json(repair);
  } catch (e) {
    next(e);
  }
});

router.put('/:id/complete', async (req, res, next) => {
  try {
    const { handleResult } = req.body;
    const repair = await prisma.equipmentRepair.update({
      where: { id: parseInt(req.params.id) },
      data: {
        handleResult,
        completedAt: new Date(),
        status: 'completed',
      },
    });
    if (repair.equipmentId) {
      await prisma.equipment.update({
        where: { id: repair.equipmentId },
        data: { status: 'normal' },
      });
    }
    res.json(repair);
  } catch (e) {
    next(e);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await prisma.equipmentRepair.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ success: true });
  } catch (e) {
    next(e);
  }
});

router.get('/statistics/summary', async (req, res, next) => {
  try {
    const pending = await prisma.equipmentRepair.count({ where: { status: 'pending' } });
    const processing = await prisma.equipmentRepair.count({ where: { status: 'processing' } });
    const completed = await prisma.equipmentRepair.count({ where: { status: 'completed' } });
    const publicCount = await prisma.equipmentRepair.count({ where: { isPublic: true } });
    const privateCount = await prisma.equipmentRepair.count({ where: { isPublic: false } });

    res.json({ pending, processing, completed, publicCount, privateCount });
  } catch (e) {
    next(e);
  }
});

export default router;
