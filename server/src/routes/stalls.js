import express from 'express';
import { PrismaClient } from '@prisma/client';
import dayjs from 'dayjs';

const prisma = new PrismaClient();
const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const { hygieneLevel, status } = req.query;
    const where = {};
    if (hygieneLevel) where.hygieneLevel = hygieneLevel;
    if (status) where.status = status;

    const stalls = await prisma.stall.findMany({
      where,
      include: {
        merchant: true,
        lease: true,
      },
      orderBy: { stallNumber: 'asc' },
    });
    res.json(stalls);
  } catch (e) {
    next(e);
  }
});

router.get('/lease/warning', async (req, res, next) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const warningDate = dayjs().add(days, 'day').toDate();
    const leases = await prisma.lease.findMany({
      where: {
        endDate: { lte: warningDate, gte: new Date() },
        status: 'active',
      },
      include: {
        stall: true,
        merchant: true,
      },
      orderBy: { endDate: 'asc' },
    });
    res.json(leases);
  } catch (e) {
    next(e);
  }
});

router.get('/category-requests', async (req, res, next) => {
  try {
    const requests = await prisma.categoryRequest.findMany({
      include: { stall: true, merchant: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(requests);
  } catch (e) {
    next(e);
  }
});

router.post('/category-requests', async (req, res, next) => {
  try {
    const request = await prisma.categoryRequest.create({ data: req.body });
    res.json(request);
  } catch (e) {
    next(e);
  }
});

router.put('/category-requests/:id/approve', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { approvedBy } = req.body;
    const request = await prisma.categoryRequest.update({
      where: { id: parseInt(id) },
      data: {
        status: 'approved',
        approvedBy,
        approvedAt: new Date(),
      },
      include: { stall: true, merchant: true },
    });
    await prisma.merchant.update({
      where: { id: request.merchantId },
      data: { businessCategory: request.newCategory },
    });
    res.json(request);
  } catch (e) {
    next(e);
  }
});

router.put('/category-requests/:id/reject', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { approvedBy } = req.body;
    const request = await prisma.categoryRequest.update({
      where: { id: parseInt(id) },
      data: { status: 'rejected', approvedBy, approvedAt: new Date() },
    });
    res.json(request);
  } catch (e) {
    next(e);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const stall = await prisma.stall.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        merchant: true,
        lease: {
          include: {
            documents: {
              orderBy: [{ version: 'desc' }, { createdAt: 'desc' }],
            },
          },
        },
        rentBills: { orderBy: { createdAt: 'desc' } },
        categoryRequests: { orderBy: { createdAt: 'desc' } },
      },
    });
    if (!stall) return res.status(404).json({ error: '摊位不存在' });
    res.json(stall);
  } catch (e) {
    next(e);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const stall = await prisma.stall.create({ data: req.body });
    res.json(stall);
  } catch (e) {
    next(e);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const stall = await prisma.stall.update({
      where: { id: parseInt(req.params.id) },
      data: req.body,
    });
    res.json(stall);
  } catch (e) {
    next(e);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await prisma.stall.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ success: true });
  } catch (e) {
    next(e);
  }
});

export default router;
