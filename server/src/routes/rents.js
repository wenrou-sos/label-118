import express from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const { status, stallId, merchantId } = req.query;
    const where = {};
    if (status) where.status = status;
    if (stallId) where.stallId = parseInt(stallId);
    if (merchantId) where.merchantId = parseInt(merchantId);

    const bills = await prisma.rentBill.findMany({
      where,
      include: { stall: true, merchant: true },
      orderBy: { billMonth: 'desc' },
    });
    res.json(bills);
  } catch (e) {
    next(e);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const bill = await prisma.rentBill.create({ data: req.body });
    res.json(bill);
  } catch (e) {
    next(e);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const bill = await prisma.rentBill.update({
      where: { id: parseInt(req.params.id) },
      data: req.body,
    });
    res.json(bill);
  } catch (e) {
    next(e);
  }
});

router.put('/:id/pay', async (req, res, next) => {
  try {
    const bill = await prisma.rentBill.update({
      where: { id: parseInt(req.params.id) },
      data: {
        status: 'paid',
        paidDate: new Date(),
      },
    });
    res.json(bill);
  } catch (e) {
    next(e);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await prisma.rentBill.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ success: true });
  } catch (e) {
    next(e);
  }
});

router.get('/statistics', async (req, res, next) => {
  try {
    const total = await prisma.rentBill.count();
    const paid = await prisma.rentBill.count({ where: { status: 'paid' } });
    const unpaid = await prisma.rentBill.count({ where: { status: 'unpaid' } });
    const paidAmount = await prisma.rentBill.aggregate({
      where: { status: 'paid' },
      _sum: { amount: true },
    });
    const unpaidAmount = await prisma.rentBill.aggregate({
      where: { status: 'unpaid' },
      _sum: { amount: true },
    });
    res.json({
      total,
      paid,
      unpaid,
      paidAmount: paidAmount._sum.amount || 0,
      unpaidAmount: unpaidAmount._sum.amount || 0,
    });
  } catch (e) {
    next(e);
  }
});

export default router;
