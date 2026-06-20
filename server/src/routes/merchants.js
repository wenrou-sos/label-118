import express from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const merchants = await prisma.merchant.findMany({
      include: { stalls: true },
      orderBy: { name: 'asc' },
    });
    res.json(merchants);
  } catch (e) {
    next(e);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const merchant = await prisma.merchant.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { stalls: true, lease: true },
    });
    if (!merchant) return res.status(404).json({ error: '商户不存在' });
    res.json(merchant);
  } catch (e) {
    next(e);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const merchant = await prisma.merchant.create({ data: req.body });
    res.json(merchant);
  } catch (e) {
    next(e);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const merchant = await prisma.merchant.update({
      where: { id: parseInt(req.params.id) },
      data: req.body,
    });
    res.json(merchant);
  } catch (e) {
    next(e);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await prisma.merchant.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ success: true });
  } catch (e) {
    next(e);
  }
});

export default router;
