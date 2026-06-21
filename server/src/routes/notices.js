import express from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const { status, priority, isTop } = req.query;
    const where = {};
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (isTop !== undefined) where.isTop = isTop === 'true';

    const notices = await prisma.notice.findMany({
      where,
      include: {
        publisher: {
          select: { name: true, role: true },
        },
      },
      orderBy: [
        { isTop: 'desc' },
        { createdAt: 'desc' },
      ],
    });
    res.json(notices);
  } catch (e) {
    next(e);
  }
});

router.get('/latest', async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const notices = await prisma.notice.findMany({
      where: { status: 'published' },
      include: {
        publisher: {
          select: { name: true, role: true },
        },
      },
      orderBy: [
        { isTop: 'desc' },
        { createdAt: 'desc' },
      ],
      take: limit,
    });
    res.json(notices);
  } catch (e) {
    next(e);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const notice = await prisma.notice.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        publisher: {
          select: { name: true, role: true },
        },
      },
    });
    if (!notice) return res.status(404).json({ error: '通知不存在' });
    res.json(notice);
  } catch (e) {
    next(e);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { title, content, priority, publisherId, isTop } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: '标题和内容不能为空' });
    }
    const notice = await prisma.notice.create({
      data: {
        title,
        content,
        priority: priority || 'normal',
        publisherId: publisherId || null,
        isTop: isTop || false,
        status: 'published',
      },
      include: {
        publisher: {
          select: { name: true, role: true },
        },
      },
    });
    res.json(notice);
  } catch (e) {
    next(e);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const notice = await prisma.notice.update({
      where: { id: parseInt(req.params.id) },
      data: req.body,
      include: {
        publisher: {
          select: { name: true, role: true },
        },
      },
    });
    res.json(notice);
  } catch (e) {
    next(e);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await prisma.notice.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ success: true });
  } catch (e) {
    next(e);
  }
});

export default router;
