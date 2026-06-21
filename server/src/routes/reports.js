import express from 'express';
import { PrismaClient } from '@prisma/client';
import ExcelJS from 'exceljs';
import dayjs from 'dayjs';

const prisma = new PrismaClient();
const router = express.Router();

function setResponseHeaders(res, filename) {
  const encodedFilename = encodeURIComponent(filename);
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename*=UTF-8''${encodedFilename}`
  );
}

async function writeWorkbook(res, workbook) {
  const buffer = await workbook.xlsx.writeBuffer();
  res.send(buffer);
}

function addHeaderRow(worksheet, headers, fillColor = 'FFF79E63') {
  const row = worksheet.addRow(headers);
  row.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: fillColor } };
  row.alignment = { horizontal: 'center', vertical: 'middle' };
  row.height = 24;
  headers.forEach((_, idx) => {
    worksheet.getColumn(idx + 1).alignment = { horizontal: 'center', vertical: 'middle' };
  });
}

function autoSizeColumns(worksheet) {
  worksheet.columns.forEach((column) => {
    let maxLength = 10;
    column.eachCell({ includeEmpty: true }, (cell) => {
      const columnLength = cell.value ? cell.value.toString().length : 10;
      if (columnLength > maxLength) maxLength = columnLength;
    });
    column.width = Math.min(maxLength + 4, 40);
  });
}

router.get('/rents', async (req, res, next) => {
  try {
    const { status } = req.query;
    const where = {};
    if (status && status !== 'all') where.status = status;

    const bills = await prisma.rentBill.findMany({
      where,
      include: { stall: true, merchant: true },
      orderBy: { billMonth: 'desc' },
    });

    const total = bills.length;
    const paid = bills.filter((b) => b.status === 'paid').length;
    const unpaid = bills.filter((b) => b.status === 'unpaid').length;
    const paidAmount = bills.filter((b) => b.status === 'paid').reduce((sum, b) => sum + b.amount, 0);
    const unpaidAmount = bills.filter((b) => b.status === 'unpaid').reduce((sum, b) => sum + b.amount, 0);

    const workbook = new ExcelJS.Workbook();
    workbook.creator = '美食街物业运营管理平台';
    workbook.created = new Date();

    const summarySheet = workbook.addWorksheet('统计汇总');
    addHeaderRow(summarySheet, ['统计项', '数量/金额']);
    const summaryData = [
      ['账单总数', total],
      ['已缴费', paid],
      ['待缴费', unpaid],
      ['已收金额 (元)', paidAmount.toFixed(2)],
      ['待收金额 (元)', unpaidAmount.toFixed(2)],
      ['收缴率', total > 0 ? `${((paid / total) * 100).toFixed(2)}%` : '0%'],
    ];
    summaryData.forEach(([k, v]) => {
      const row = summarySheet.addRow([k, v]);
      row.getCell(1).font = { bold: true };
    });
    autoSizeColumns(summarySheet);

    const listSheet = workbook.addWorksheet('账单列表');
    addHeaderRow(listSheet, [
      '摊位编号',
      '摊位名称',
      '商户名称',
      '账期',
      '金额 (元)',
      '状态',
      '缴费截止日',
      '缴费时间',
      '备注',
    ]);
    bills.forEach((b) => {
      listSheet.addRow([
        b.stall?.stallNumber || '-',
        b.stall?.name || '-',
        b.merchant?.name || '-',
        b.billMonth,
        b.amount,
        b.status === 'paid' ? '已缴费' : '待缴费',
        b.dueDate ? dayjs(b.dueDate).format('YYYY-MM-DD') : '-',
        b.paidDate ? dayjs(b.paidDate).format('YYYY-MM-DD HH:mm') : '-',
        b.remark || '-',
      ]);
    });
    autoSizeColumns(listSheet);

    const filename = `租金账单报表_${dayjs().format('YYYYMMDD_HHmmss')}.xlsx`;
    setResponseHeaders(res, filename);
    await writeWorkbook(res, workbook);
  } catch (e) {
    next(e);
  }
});

router.get('/complaints', async (req, res, next) => {
  try {
    const complaints = await prisma.complaint.findMany({
      include: { stall: true, assignee: true },
      orderBy: { createdAt: 'desc' },
    });

    const pending = complaints.filter((c) => c.status === 'pending').length;
    const processing = complaints.filter((c) => c.status === 'processing').length;
    const completed = complaints.filter((c) => c.status === 'completed').length;
    const revisited = complaints.filter((c) => c.status === 'revisited').length;

    const types = ['菜品质量', '卫生问题', '服务态度', '价格争议', '其他'];
    const typeStats = {};
    for (const t of types) typeStats[t] = complaints.filter((c) => c.type === t).length;

    const workbook = new ExcelJS.Workbook();
    workbook.creator = '美食街物业运营管理平台';
    workbook.created = new Date();

    const summarySheet = workbook.addWorksheet('统计汇总');
    addHeaderRow(summarySheet, ['统计项', '数量']);
    const statusSummary = [
      ['投诉总数', complaints.length],
      ['待处理', pending],
      ['处理中', processing],
      ['已完成', completed],
      ['已回访', revisited],
      ['处理完成率', complaints.length > 0 ? `${(((completed + revisited) / complaints.length) * 100).toFixed(2)}%` : '0%'],
    ];
    statusSummary.forEach(([k, v]) => {
      const row = summarySheet.addRow([k, v]);
      row.getCell(1).font = { bold: true };
    });
    summarySheet.addRow([]);
    const headerRow2 = summarySheet.addRow(['投诉类型分布统计']);
    headerRow2.getCell(1).font = { bold: true, size: 12 };
    summarySheet.addRow(['类型', '数量', '占比']);
    types.forEach((t) => {
      const count = typeStats[t] || 0;
      summarySheet.addRow([t, count, complaints.length > 0 ? `${((count / complaints.length) * 100).toFixed(2)}%` : '0%']);
    });
    autoSizeColumns(summarySheet);

    const listSheet = workbook.addWorksheet('投诉列表');
    addHeaderRow(listSheet, [
      '投诉类型',
      '投诉内容',
      '关联摊位',
      '投诉人',
      '联系电话',
      '处理人',
      '状态',
      '处理结果',
      '回访结果',
      '提交时间',
      '处理时间',
    ]);
    complaints.forEach((c) => {
      listSheet.addRow([
        c.type,
        c.description,
        c.stall ? `${c.stall.stallNumber} - ${c.stall.name}` : '未关联',
        c.customerName || '匿名',
        c.customerPhone || '-',
        c.assignee ? `${c.assignee.name} (${c.assignee.role})` : '未派单',
        (() => {
          const m = { pending: '待处理', processing: '处理中', completed: '已完成', revisited: '已回访' };
          return m[c.status] || c.status;
        })(),
        c.handleResult || '-',
        c.revisitResult || '-',
        dayjs(c.createdAt).format('YYYY-MM-DD HH:mm'),
        c.handleAt ? dayjs(c.handleAt).format('YYYY-MM-DD HH:mm') : '-',
      ]);
    });
    autoSizeColumns(listSheet);

    const filename = `投诉统计报表_${dayjs().format('YYYYMMDD_HHmmss')}.xlsx`;
    setResponseHeaders(res, filename);
    await writeWorkbook(res, workbook);
  } catch (e) {
    next(e);
  }
});

router.get('/activities/:id/sales', async (req, res, next) => {
  try {
    const activityId = parseInt(req.params.id);
    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
      include: {
        participations: {
          include: { stall: true },
        },
      },
    });
    if (!activity) return res.status(404).json({ error: '活动不存在' });

    const participations = activity.participations || [];
    const totalBefore = participations.reduce((sum, p) => sum + (p.beforeSales || 0), 0);
    const totalDuring = participations.reduce((sum, p) => sum + (p.duringSales || 0), 0);
    const totalGrowth = totalBefore > 0 ? totalDuring - totalBefore : 0;
    const growthRate = totalBefore > 0 ? ((totalGrowth / totalBefore) * 100).toFixed(2) : 0;

    const workbook = new ExcelJS.Workbook();
    workbook.creator = '美食街物业运营管理平台';
    workbook.created = new Date();

    const summarySheet = workbook.addWorksheet('销售汇总');
    addHeaderRow(summarySheet, ['项目', '数值']);
    const summaryData = [
      ['活动名称', activity.name],
      ['活动类型', activity.type],
      ['活动时间', `${dayjs(activity.startDate).format('YYYY-MM-DD')} 至 ${dayjs(activity.endDate).format('YYYY-MM-DD')}`],
      ['参与商户数', participations.length],
      ['活动前总销售额 (元)', totalBefore.toFixed(2)],
      ['活动期间总销售额 (元)', totalDuring.toFixed(2)],
      ['销售额增长 (元)', totalGrowth.toFixed(2)],
      ['增长率', `${growthRate}%`],
      ['预计客流量', activity.expectedVisitors || 0],
      ['实际客流量', activity.actualVisitors || 0],
    ];
    summaryData.forEach(([k, v]) => {
      const row = summarySheet.addRow([k, v]);
      row.getCell(1).font = { bold: true };
    });
    autoSizeColumns(summarySheet);

    const salesSheet = workbook.addWorksheet('商户销售明细');
    addHeaderRow(salesSheet, [
      '摊位编号',
      '摊位名称',
      '报名时间',
      '活动前销售额 (元)',
      '活动期间销售额 (元)',
      '销售额增长 (元)',
      '增长率',
    ]);
    participations.forEach((p) => {
      const before = p.beforeSales || 0;
      const during = p.duringSales || 0;
      const growth = during - before;
      const rate = before > 0 ? ((growth / before) * 100).toFixed(2) + '%' : '-';
      salesSheet.addRow([
        p.stall?.stallNumber || '-',
        p.stall?.name || '-',
        dayjs(p.signupAt).format('YYYY-MM-DD HH:mm'),
        before.toFixed(2),
        during.toFixed(2),
        growth.toFixed(2),
        rate,
      ]);
    });
    autoSizeColumns(salesSheet);

    const filename = `活动销售数据_${activity.name}_${dayjs().format('YYYYMMDD_HHmmss')}.xlsx`;
    setResponseHeaders(res, filename);
    await writeWorkbook(res, workbook);
  } catch (e) {
    next(e);
  }
});

router.get('/repairs', async (req, res, next) => {
  try {
    const repairs = await prisma.equipmentRepair.findMany({
      include: { equipment: true, stall: true, assignee: true },
      orderBy: { createdAt: 'desc' },
    });

    const pending = repairs.filter((r) => r.status === 'pending').length;
    const processing = repairs.filter((r) => r.status === 'processing').length;
    const completed = repairs.filter((r) => r.status === 'completed').length;
    const publicCount = repairs.filter((r) => r.isPublic).length;
    const privateCount = repairs.filter((r) => !r.isPublic).length;
    const completionRate = repairs.length > 0 ? ((completed / repairs.length) * 100).toFixed(2) : 0;

    const workbook = new ExcelJS.Workbook();
    workbook.creator = '美食街物业运营管理平台';
    workbook.created = new Date();

    const summarySheet = workbook.addWorksheet('统计汇总');
    addHeaderRow(summarySheet, ['统计项', '数量']);
    const statusSummary = [
      ['报修总数', repairs.length],
      ['待派工', pending],
      ['维修中', processing],
      ['已完成', completed],
      ['完成率', `${completionRate}%`],
      ['公共区域报修', publicCount],
      ['商户内部报修', privateCount],
    ];
    statusSummary.forEach(([k, v]) => {
      const row = summarySheet.addRow([k, v]);
      row.getCell(1).font = { bold: true };
    });
    autoSizeColumns(summarySheet);

    const listSheet = workbook.addWorksheet('报修列表');
    addHeaderRow(listSheet, [
      '报修类型',
      '设备/摊位',
      '位置',
      '故障描述',
      '报修人',
      '维修人员',
      '状态',
      '维修结果',
      '提交时间',
      '完成时间',
    ]);
    repairs.forEach((r) => {
      const target = r.equipment
        ? r.equipment.name
        : r.stall
        ? `${r.stall.stallNumber} - ${r.stall.name}`
        : '-';
      const location = r.equipment ? r.equipment.location : r.stall ? r.stall.location : '-';
      listSheet.addRow([
        r.isPublic ? '公共区域' : '商户内部',
        target,
        location,
        r.description,
        r.reporter || '匿名',
        r.assignee ? `${r.assignee.name} (${r.assignee.role})` : '未派工',
        (() => {
          const m = { pending: '待派工', processing: '维修中', completed: '已完成' };
          return m[r.status] || r.status;
        })(),
        r.handleResult || '-',
        dayjs(r.createdAt).format('YYYY-MM-DD HH:mm'),
        r.completedAt ? dayjs(r.completedAt).format('YYYY-MM-DD HH:mm') : '-',
      ]);
    });
    autoSizeColumns(listSheet);

    const filename = `设备报修报表_${dayjs().format('YYYYMMDD_HHmmss')}.xlsx`;
    setResponseHeaders(res, filename);
    await writeWorkbook(res, workbook);
  } catch (e) {
    next(e);
  }
});

router.get('/weekly-report', async (req, res, next) => {
  try {
    const endDate = dayjs().endOf('day').toDate();
    const startDate = dayjs().subtract(6, 'day').startOf('day').toDate();

    const stallCount = await prisma.stall.count();
    const merchantCount = await prisma.merchant.count();
    const activeLeases = await prisma.lease.count({ where: { status: 'active' } });

    const weekOpenings = await prisma.openingRecord.count({
      where: { date: { gte: startDate, lte: endDate } },
    });

    const warningDate = dayjs().add(30, 'day').toDate();
    const expiringLeases = await prisma.lease.count({
      where: { endDate: { lte: warningDate, gte: new Date() }, status: 'active' },
    });

    const totalBills = await prisma.rentBill.count();
    const paidBills = await prisma.rentBill.count({ where: { status: 'paid' } });
    const paidAmount = await prisma.rentBill.aggregate({
      where: { status: 'paid' },
      _sum: { amount: true },
    });
    const unpaidAmount = await prisma.rentBill.aggregate({
      where: { status: 'unpaid' },
      _sum: { amount: true },
    });

    const weekComplaints = await prisma.complaint.count({
      where: { createdAt: { gte: startDate, lte: endDate } },
    });
    const completedComplaints = await prisma.complaint.count({
      where: { status: { in: ['completed', 'revisited'] } },
    });
    const totalComplaints = await prisma.complaint.count();

    const weekRepairs = await prisma.equipmentRepair.count({
      where: { createdAt: { gte: startDate, lte: endDate } },
    });
    const completedRepairs = await prisma.equipmentRepair.count({ where: { status: 'completed' } });
    const totalRepairs = await prisma.equipmentRepair.count();

    const ongoingActivities = await prisma.activity.count({ where: { status: 'ongoing' } });
    const publishedNotices = await prisma.notice.count({ where: { status: 'published' } });
    const topNotices = await prisma.notice.findMany({
      where: { status: 'published', isTop: true },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    const workbook = new ExcelJS.Workbook();
    workbook.creator = '美食街物业运营管理平台';
    workbook.created = new Date();

    const overviewSheet = workbook.addWorksheet('运营总览');
    addHeaderRow(overviewSheet, ['指标', '数值'], 'FFF5222D');
    const overviewRow = overviewSheet.addRow(['美食街运营周报', '']);
    overviewRow.font = { bold: true, size: 14 };
    overviewRow.alignment = { horizontal: 'center' };
    overviewSheet.mergeCells(`A${overviewRow.number}:B${overviewRow.number}`);
    overviewSheet.addRow(['报表周期', `${dayjs(startDate).format('YYYY-MM-DD')} 至 ${dayjs(endDate).format('YYYY-MM-DD')}`]);
    overviewSheet.addRow(['生成时间', dayjs().format('YYYY-MM-DD HH:mm:ss')]);
    overviewSheet.addRow([]);

    const overviewData = [
      ['核心运营指标', ''],
      ['摊位总数', stallCount],
      ['商户数量', merchantCount],
      ['在营租约', activeLeases],
      ['本周开店记录', weekOpenings],
      ['30天内到期租约', expiringLeases],
      ['', ''],
      ['租金收缴', ''],
      ['账单总数', totalBills],
      ['已缴费账单', paidBills],
      ['收缴率', totalBills > 0 ? `${((paidBills / totalBills) * 100).toFixed(2)}%` : '0%'],
      ['累计已收金额 (元)', (paidAmount._sum.amount || 0).toFixed(2)],
      ['待收金额 (元)', (unpaidAmount._sum.amount || 0).toFixed(2)],
      ['', ''],
      ['顾客服务', ''],
      ['本周新增投诉', weekComplaints],
      ['投诉总数', totalComplaints],
      ['已处理投诉', completedComplaints],
      ['投诉处理率', totalComplaints > 0 ? `${((completedComplaints / totalComplaints) * 100).toFixed(2)}%` : '0%'],
      ['', ''],
      ['设备运维', ''],
      ['本周新增报修', weekRepairs],
      ['报修总数', totalRepairs],
      ['已完成报修', completedRepairs],
      ['报修完成率', totalRepairs > 0 ? `${((completedRepairs / totalRepairs) * 100).toFixed(2)}%` : '0%'],
      ['', ''],
      ['活动与通知', ''],
      ['进行中活动', ongoingActivities],
      ['发布的通知公告', publishedNotices],
    ];
    overviewData.forEach(([k, v]) => {
      const row = overviewSheet.addRow([k, v]);
      if (v === '') {
        row.getCell(1).font = { bold: true, size: 12, color: { argb: 'FFF5222D' } };
      } else if (k && !['报表周期', '生成时间'].includes(k)) {
        row.getCell(1).font = { bold: true };
      }
    });
    autoSizeColumns(overviewSheet);

    if (topNotices.length > 0) {
      const noticeSheet = workbook.addWorksheet('重要通知');
      addHeaderRow(noticeSheet, ['标题', '优先级', '发布人', '发布时间']);
      for (const n of topNotices) {
        const pub = n.publisherId
          ? await prisma.admin.findUnique({ where: { id: n.publisherId } })
          : null;
        noticeSheet.addRow([
          n.title,
          (() => {
            const m = { high: '重要', normal: '普通', low: '一般' };
            return m[n.priority] || n.priority;
          })(),
          pub?.name || '系统管理员',
          dayjs(n.createdAt).format('YYYY-MM-DD HH:mm'),
        ]);
      }
      autoSizeColumns(noticeSheet);
    }

    const filename = `运营周报_${dayjs(startDate).format('YYYYMMDD')}_${dayjs(endDate).format('YYYYMMDD')}.xlsx`;
    setResponseHeaders(res, filename);
    await writeWorkbook(res, workbook);
  } catch (e) {
    next(e);
  }
});

export default router;
