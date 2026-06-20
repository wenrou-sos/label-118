import express from 'express';
import { PrismaClient } from '@prisma/client';
import dayjs from 'dayjs';

const prisma = new PrismaClient();
const router = express.Router();

router.get('/openings', async (req, res, next) => {
  try {
    const { date, stallId } = req.query;
    const where = {};
    if (date) {
      where.date = dayjs(date).toDate();
    }
    if (stallId) where.stallId = parseInt(stallId);

    const records = await prisma.openingRecord.findMany({
      where,
      include: { stall: true },
      orderBy: { date: 'desc' },
    });
    res.json(records);
  } catch (e) {
    next(e);
  }
});

router.post('/openings', async (req, res, next) => {
  try {
    const record = await prisma.openingRecord.create({ data: req.body });
    res.json(record);
  } catch (e) {
    next(e);
  }
});

router.put('/openings/:id/close', async (req, res, next) => {
  try {
    const { closeTime } = req.body;
    const record = await prisma.openingRecord.update({
      where: { id: parseInt(req.params.id) },
      data: { closeTime: closeTime || new Date() },
    });
    res.json(record);
  } catch (e) {
    next(e);
  }
});

router.get('/fire-inspections', async (req, res, next) => {
  try {
    const { date, stallId } = req.query;
    const where = {};
    if (date) {
      where.date = dayjs(date).toDate();
    }
    if (stallId) where.stallId = parseInt(stallId);

    const inspections = await prisma.fireInspection.findMany({
      where,
      include: { stall: true },
      orderBy: { date: 'desc' },
    });
    res.json(inspections);
  } catch (e) {
    next(e);
  }
});

router.post('/fire-inspections', async (req, res, next) => {
  try {
    const inspection = await prisma.fireInspection.create({ data: req.body });
    res.json(inspection);
  } catch (e) {
    next(e);
  }
});

router.get('/waste-records', async (req, res, next) => {
  try {
    const { date, stallId, wasteType } = req.query;
    const where = {};
    if (date) {
      where.date = dayjs(date).toDate();
    }
    if (stallId) where.stallId = parseInt(stallId);
    if (wasteType) where.wasteType = wasteType;

    const records = await prisma.wasteRecord.findMany({
      where,
      include: { stall: true },
      orderBy: { date: 'desc' },
    });
    res.json(records);
  } catch (e) {
    next(e);
  }
});

router.post('/waste-records', async (req, res, next) => {
  try {
    const record = await prisma.wasteRecord.create({ data: req.body });
    res.json(record);
  } catch (e) {
    next(e);
  }
});

router.get('/admins', async (req, res, next) => {
  try {
    const admins = await prisma.admin.findMany({
      orderBy: { name: 'asc' },
    });
    res.json(admins);
  } catch (e) {
    next(e);
  }
});

export default router;
