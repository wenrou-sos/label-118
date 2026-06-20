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

    const activities = await prisma.activity.findMany({
      where,
      include: {
        participations: {
          include: {
            stall: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(activities);
  } catch (e) {
    next(e);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const activity = await prisma.activity.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        participations: {
          include: {
            stall: true,
          },
        },
      },
    });
    if (!activity) return res.status(404).json({ error: '活动不存在' });
    res.json(activity);
  } catch (e) {
    next(e);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const activity = await prisma.activity.create({ data: req.body });
    res.json(activity);
  } catch (e) {
    next(e);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const activity = await prisma.activity.update({
      where: { id: parseInt(req.params.id) },
      data: req.body,
    });
    res.json(activity);
  } catch (e) {
    next(e);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await prisma.activityParticipation.deleteMany({
      where: { activityId: parseInt(req.params.id) },
    });
    await prisma.activity.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ success: true });
  } catch (e) {
    next(e);
  }
});

router.get('/:id/participations', async (req, res, next) => {
  try {
    const participations = await prisma.activityParticipation.findMany({
      where: { activityId: parseInt(req.params.id) },
      include: {
        stall: true,
      },
    });
    res.json(participations);
  } catch (e) {
    next(e);
  }
});

router.post('/:id/participations', async (req, res, next) => {
  try {
    const { stallId } = req.body;
    const participation = await prisma.activityParticipation.create({
      data: {
        activityId: parseInt(req.params.id),
        stallId,
      },
    });
    res.json(participation);
  } catch (e) {
    next(e);
  }
});

router.delete('/:id/participations/:participationId', async (req, res, next) => {
  try {
    await prisma.activityParticipation.delete({
      where: { id: parseInt(req.params.participationId) },
    });
    res.json({ success: true });
  } catch (e) {
    next(e);
  }
});

router.put('/participations/:id', async (req, res, next) => {
  try {
    const participation = await prisma.activityParticipation.update({
      where: { id: parseInt(req.params.id) },
      data: req.body,
    });
    res.json(participation);
  } catch (e) {
    next(e);
  }
});

router.get('/statistics/analysis', async (req, res, next) => {
  try {
    const total = await prisma.activity.count();
    const completed = await prisma.activity.count({ where: { status: 'completed' } });
    const ongoing = await prisma.activity.count({ where: { status: 'ongoing' } });
    const planning = await prisma.activity.count({ where: { status: 'planning' } });

    const types = ['美食节', '周末特惠', '打卡集章', '夜市集市', '其他'];
    const typeStats = {};
    for (const t of types) {
      typeStats[t] = await prisma.activity.count({ where: { type: t } });
    }

    const visitorTrend = await prisma.activity.findMany({
      where: { status: 'completed' },
      select: {
        name: true,
        expectedVisitors: true,
        actualVisitors: true,
        startDate: true,
      },
      orderBy: { startDate: 'asc' },
    });

    res.json({
      total,
      completed,
      ongoing,
      planning,
      typeStats,
      visitorTrend,
    });
  } catch (e) {
    next(e);
  }
});

export default router;
