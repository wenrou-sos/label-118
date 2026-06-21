import express from 'express';
import { PrismaClient } from '@prisma/client';
import dayjs from 'dayjs';

const prisma = new PrismaClient();
const router = express.Router();

router.get('/summary', async (req, res, next) => {
  try {
    const stallCount = await prisma.stall.count();
    const merchantCount = await prisma.merchant.count();
    const activeLeases = await prisma.lease.count({ where: { status: 'active' } });

    const today = dayjs().startOf('day').toDate();
    const todayOpenings = await prisma.openingRecord.count({ where: { date: today } });

    const warningDate = dayjs().add(30, 'day').toDate();
    const expiringLeases = await prisma.lease.count({
      where: {
        endDate: { lte: warningDate, gte: new Date() },
        status: 'active',
      },
    });

    const unpaidBills = await prisma.rentBill.count({ where: { status: 'unpaid' } });
    const pendingComplaints = await prisma.complaint.count({ where: { status: 'pending' } });
    const pendingRepairs = await prisma.equipmentRepair.count({ where: { status: 'pending' } });

    const ongoingActivities = await prisma.activity.count({ where: { status: 'ongoing' } });

    const hygieneA = await prisma.stall.count({ where: { hygieneLevel: 'A' } });
    const hygieneB = await prisma.stall.count({ where: { hygieneLevel: 'B' } });
    const hygieneC = await prisma.stall.count({ where: { hygieneLevel: 'C' } });

    const publishedNotices = await prisma.notice.count({ where: { status: 'published' } });

    res.json({
      stallCount,
      merchantCount,
      activeLeases,
      todayOpenings,
      expiringLeases,
      unpaidBills,
      pendingComplaints,
      pendingRepairs,
      ongoingActivities,
      publishedNotices,
      hygiene: { A: hygieneA, B: hygieneB, C: hygieneC },
    });
  } catch (e) {
    next(e);
  }
});

router.get('/recent-activities', async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const complaints = await prisma.complaint.findMany({
      take: limit,
      include: { stall: true },
      orderBy: { createdAt: 'desc' },
    });

    const repairs = await prisma.equipmentRepair.findMany({
      take: limit,
      include: { stall: true, equipment: true },
      orderBy: { createdAt: 'desc' },
    });

    const activities = await prisma.activity.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    const notices = await prisma.notice.findMany({
      take: limit,
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
    });

    res.json({ complaints, repairs, activities, notices });
  } catch (e) {
    next(e);
  }
});

export default router;
