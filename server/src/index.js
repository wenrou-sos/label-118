import express from 'express';
import cors from 'cors';
import dayjs from 'dayjs';
import {
  db,
  initMockData,
  nextId,
  getMerchantById,
  getStallById,
  getAdminById,
  getEquipmentById,
  getLeaseByStallId,
  getParticipationsByActivityId,
  enrichStall,
  enrichLease,
  enrichCategoryRequest,
  enrichRentBill,
  enrichComplaint,
  enumerateActivity,
  enrichRepair,
  enrichOpeningRecord,
  enrichFireInspection,
  enrichWasteRecord,
} from './db.js';

const app = express();
const PORT = process.env.PORT || 3001;

initMockData();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: '美食街物业运营管理平台 API 运行正常 (内存模式)' });
});

const stallRoutes = express.Router();

stallRoutes.get('/', (req, res) => {
  const { hygieneLevel, status } = req.query;
  let list = db.stalls;
  if (hygieneLevel) list = list.filter((s) => s.hygieneLevel === hygieneLevel);
  if (status) list = list.filter((s) => s.status === status);
  list = list.sort((a, b) => a.stallNumber.localeCompare(b.stallNumber));
  res.json(list.map(enrichStall));
});

stallRoutes.get('/lease/warning', (req, res) => {
  const days = parseInt(req.query.days) || 30;
  const warningDate = dayjs().add(days, 'day').toDate();
  const leases = db.leases
    .filter((l) => {
      const d = dayjs(l.endDate);
      return d.isBefore(warningDate) && d.isAfter(dayjs()) && l.status === 'active';
    })
    .sort((a, b) => new Date(a.endDate) - new Date(b.endDate));
  res.json(leases.map(enrichLease));
});

stallRoutes.get('/category-requests', (req, res) => {
  const list = [...db.categoryRequests].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(list.map(enrichCategoryRequest));
});

stallRoutes.post('/category-requests', (req, res) => {
  const stall = getStallById(req.body.stallId);
  if (!stall) return res.status(400).json({ error: '摊位不存在' });
  const merchant = getMerchantById(stall.merchantId);
  const newReq = {
    id: nextId(),
    stallId: req.body.stallId,
    merchantId: stall.merchantId,
    oldCategory: merchant?.businessCategory || '',
    newCategory: req.body.newCategory,
    reason: req.body.reason,
    status: 'pending',
    approvedBy: null,
    approvedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  db.categoryRequests.unshift(newReq);
  res.json(enrichCategoryRequest(newReq));
});

stallRoutes.put('/category-requests/:id/approve', (req, res) => {
  const id = parseInt(req.params.id);
  const idx = db.categoryRequests.findIndex((r) => r.id === id);
  if (idx < 0) return res.status(404).json({ error: '申请不存在' });
  db.categoryRequests[idx].status = 'approved';
  db.categoryRequests[idx].approvedBy = req.body.approvedBy || '管理员';
  db.categoryRequests[idx].approvedAt = new Date();
  db.categoryRequests[idx].updatedAt = new Date();
  const merchantId = db.categoryRequests[idx].merchantId;
  const mIdx = db.merchants.findIndex((m) => m.id === merchantId);
  if (mIdx >= 0) {
    db.merchants[mIdx].businessCategory = db.categoryRequests[idx].newCategory;
    db.merchants[mIdx].updatedAt = new Date();
  }
  res.json(enrichCategoryRequest(db.categoryRequests[idx]));
});

stallRoutes.put('/category-requests/:id/reject', (req, res) => {
  const id = parseInt(req.params.id);
  const idx = db.categoryRequests.findIndex((r) => r.id === id);
  if (idx < 0) return res.status(404).json({ error: '申请不存在' });
  db.categoryRequests[idx].status = 'rejected';
  db.categoryRequests[idx].approvedBy = req.body.approvedBy || '管理员';
  db.categoryRequests[idx].approvedAt = new Date();
  db.categoryRequests[idx].updatedAt = new Date();
  res.json(enrichCategoryRequest(db.categoryRequests[idx]));
});

stallRoutes.get('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const stall = getStallById(id);
  if (!stall) return res.status(404).json({ error: '摊位不存在' });
  const enriched = enrichStall(stall);
  enriched.rentBills = db.rentBills
    .filter((b) => b.stallId === id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map(enrichRentBill);
  enriched.categoryRequests = db.categoryRequests
    .filter((r) => r.stallId === id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(enriched);
});

stallRoutes.post('/', (req, res) => {
  const data = {
    id: nextId(),
    ...req.body,
    status: req.body.status || 'normal',
    hygieneLevel: req.body.hygieneLevel || 'B',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  db.stalls.push(data);
  res.json(enrichStall(data));
});

stallRoutes.put('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const idx = db.stalls.findIndex((s) => s.id === id);
  if (idx < 0) return res.status(404).json({ error: '摊位不存在' });
  db.stalls[idx] = { ...db.stalls[idx], ...req.body, updatedAt: new Date() };
  res.json(enrichStall(db.stalls[idx]));
});

stallRoutes.delete('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  db.stalls = db.stalls.filter((s) => s.id !== id);
  res.json({ success: true });
});

app.use('/api/stalls', stallRoutes);

const merchantRoutes = express.Router();
merchantRoutes.get('/', (req, res) => {
  const list = [...db.merchants].sort((a, b) => a.name.localeCompare(b.name));
  const result = list.map((m) => ({
    ...m,
    stalls: db.stalls.filter((s) => s.merchantId === m.id),
  }));
  res.json(result);
});
merchantRoutes.get('/:id', (req, res) => {
  const m = getMerchantById(parseInt(req.params.id));
  if (!m) return res.status(404).json({ error: '商户不存在' });
  res.json({
    ...m,
    stalls: db.stalls.filter((s) => s.merchantId === m.id),
    lease: getLeaseByStallId(m.id),
  });
});
merchantRoutes.post('/', (req, res) => {
  const data = { id: nextId(), ...req.body, createdAt: new Date(), updatedAt: new Date() };
  db.merchants.push(data);
  res.json(data);
});
merchantRoutes.put('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const idx = db.merchants.findIndex((m) => m.id === id);
  if (idx < 0) return res.status(404).json({ error: '商户不存在' });
  db.merchants[idx] = { ...db.merchants[idx], ...req.body, updatedAt: new Date() };
  res.json(db.merchants[idx]);
});
merchantRoutes.delete('/:id', (req, res) => {
  db.merchants = db.merchants.filter((m) => m.id !== parseInt(req.params.id));
  res.json({ success: true });
});
app.use('/api/merchants', merchantRoutes);

const rentRoutes = express.Router();
rentRoutes.get('/', (req, res) => {
  const { status, stallId, merchantId } = req.query;
  let list = db.rentBills;
  if (status) list = list.filter((b) => b.status === status);
  if (stallId) list = list.filter((b) => b.stallId === parseInt(stallId));
  if (merchantId) list = list.filter((b) => b.merchantId === parseInt(merchantId));
  list = [...list].sort((a, b) => b.billMonth.localeCompare(a.billMonth));
  res.json(list.map(enrichRentBill));
});
rentRoutes.post('/', (req, res) => {
  const data = {
    id: nextId(),
    ...req.body,
    status: 'unpaid',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  db.rentBills.unshift(data);
  res.json(enrichRentBill(data));
});
rentRoutes.put('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const idx = db.rentBills.findIndex((b) => b.id === id);
  if (idx < 0) return res.status(404).json({ error: '账单不存在' });
  db.rentBills[idx] = { ...db.rentBills[idx], ...req.body, updatedAt: new Date() };
  res.json(enrichRentBill(db.rentBills[idx]));
});
rentRoutes.put('/:id/pay', (req, res) => {
  const id = parseInt(req.params.id);
  const idx = db.rentBills.findIndex((b) => b.id === id);
  if (idx < 0) return res.status(404).json({ error: '账单不存在' });
  db.rentBills[idx].status = 'paid';
  db.rentBills[idx].paidDate = new Date();
  db.rentBills[idx].updatedAt = new Date();
  res.json(enrichRentBill(db.rentBills[idx]));
});
rentRoutes.delete('/:id', (req, res) => {
  db.rentBills = db.rentBills.filter((b) => b.id !== parseInt(req.params.id));
  res.json({ success: true });
});
rentRoutes.get('/statistics', (req, res) => {
  const total = db.rentBills.length;
  const paid = db.rentBills.filter((b) => b.status === 'paid').length;
  const unpaid = db.rentBills.filter((b) => b.status === 'unpaid').length;
  const paidAmount = db.rentBills.filter((b) => b.status === 'paid').reduce((s, b) => s + b.amount, 0);
  const unpaidAmount = db.rentBills.filter((b) => b.status === 'unpaid').reduce((s, b) => s + b.amount, 0);
  res.json({ total, paid, unpaid, paidAmount, unpaidAmount });
});
app.use('/api/rents', rentRoutes);

const complaintRoutes = express.Router();
complaintRoutes.get('/', (req, res) => {
  const { status, type } = req.query;
  let list = db.complaints;
  if (status) list = list.filter((c) => c.status === status);
  if (type) list = list.filter((c) => c.type === type);
  list = [...list].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(list.map(enrichComplaint));
});
complaintRoutes.get('/statistics/summary', (req, res) => {
  const pending = db.complaints.filter((c) => c.status === 'pending').length;
  const processing = db.complaints.filter((c) => c.status === 'processing').length;
  const completed = db.complaints.filter((c) => c.status === 'completed').length;
  const revisited = db.complaints.filter((c) => c.status === 'revisited').length;
  const types = ['菜品质量', '卫生问题', '服务态度', '价格争议', '其他'];
  const typeStats = {};
  for (const t of types) typeStats[t] = db.complaints.filter((c) => c.type === t).length;
  res.json({ pending, processing, completed, revisited, typeStats });
});
complaintRoutes.get('/:id', (req, res) => {
  const c = db.complaints.find((x) => x.id === parseInt(req.params.id));
  if (!c) return res.status(404).json({ error: '投诉不存在' });
  res.json(enrichComplaint(c));
});
complaintRoutes.post('/', (req, res) => {
  const data = {
    id: nextId(),
    ...req.body,
    status: 'pending',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  db.complaints.unshift(data);
  res.json(enrichComplaint(data));
});
complaintRoutes.put('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const idx = db.complaints.findIndex((c) => c.id === id);
  if (idx < 0) return res.status(404).json({ error: '投诉不存在' });
  db.complaints[idx] = { ...db.complaints[idx], ...req.body, updatedAt: new Date() };
  res.json(enrichComplaint(db.complaints[idx]));
});
complaintRoutes.put('/:id/assign', (req, res) => {
  const id = parseInt(req.params.id);
  const idx = db.complaints.findIndex((c) => c.id === id);
  if (idx < 0) return res.status(404).json({ error: '投诉不存在' });
  db.complaints[idx].assigneeId = req.body.assigneeId;
  db.complaints[idx].status = 'processing';
  db.complaints[idx].updatedAt = new Date();
  res.json(enrichComplaint(db.complaints[idx]));
});
complaintRoutes.put('/:id/complete', (req, res) => {
  const id = parseInt(req.params.id);
  const idx = db.complaints.findIndex((c) => c.id === id);
  if (idx < 0) return res.status(404).json({ error: '投诉不存在' });
  db.complaints[idx].handleResult = req.body.handleResult;
  db.complaints[idx].handleAt = new Date();
  db.complaints[idx].status = 'completed';
  db.complaints[idx].updatedAt = new Date();
  res.json(enrichComplaint(db.complaints[idx]));
});
complaintRoutes.put('/:id/revisit', (req, res) => {
  const id = parseInt(req.params.id);
  const idx = db.complaints.findIndex((c) => c.id === id);
  if (idx < 0) return res.status(404).json({ error: '投诉不存在' });
  db.complaints[idx].revisitResult = req.body.revisitResult;
  db.complaints[idx].revisitAt = new Date();
  db.complaints[idx].status = 'revisited';
  db.complaints[idx].updatedAt = new Date();
  res.json(enrichComplaint(db.complaints[idx]));
});
complaintRoutes.delete('/:id', (req, res) => {
  db.complaints = db.complaints.filter((c) => c.id !== parseInt(req.params.id));
  res.json({ success: true });
});
app.use('/api/complaints', complaintRoutes);

const activityRoutes = express.Router();
activityRoutes.get('/', (req, res) => {
  const { status, type } = req.query;
  let list = db.activities;
  if (status) list = list.filter((a) => a.status === status);
  if (type) list = list.filter((a) => a.type === type);
  list = [...list].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(list.map(enumerateActivity));
});
activityRoutes.get('/statistics/analysis', (req, res) => {
  const total = db.activities.length;
  const completed = db.activities.filter((a) => a.status === 'completed').length;
  const ongoing = db.activities.filter((a) => a.status === 'ongoing').length;
  const planning = db.activities.filter((a) => a.status === 'planning').length;
  const types = ['美食节', '周末特惠', '打卡集章', '夜市集市', '其他'];
  const typeStats = {};
  for (const t of types) typeStats[t] = db.activities.filter((a) => a.type === t).length;
  const visitorTrend = db.activities
    .filter((a) => a.status === 'completed')
    .map((a) => ({
      name: a.name,
      expectedVisitors: a.expectedVisitors,
      actualVisitors: a.actualVisitors,
      startDate: a.startDate,
    }))
    .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
  res.json({ total, completed, ongoing, planning, typeStats, visitorTrend });
});
activityRoutes.get('/:id', (req, res) => {
  const a = db.activities.find((x) => x.id === parseInt(req.params.id));
  if (!a) return res.status(404).json({ error: '活动不存在' });
  res.json(enumerateActivity(a));
});
activityRoutes.post('/', (req, res) => {
  const data = {
    id: nextId(),
    ...req.body,
    status: 'planning',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  db.activities.unshift(data);
  res.json(enumerateActivity(data));
});
activityRoutes.put('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const idx = db.activities.findIndex((a) => a.id === id);
  if (idx < 0) return res.status(404).json({ error: '活动不存在' });
  db.activities[idx] = { ...db.activities[idx], ...req.body, updatedAt: new Date() };
  res.json(enumerateActivity(db.activities[idx]));
});
activityRoutes.delete('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  db.activityParticipations = db.activityParticipations.filter((p) => p.activityId !== id);
  db.activities = db.activities.filter((a) => a.id !== id);
  res.json({ success: true });
});
activityRoutes.get('/:id/participations', (req, res) => {
  const list = db.activityParticipations
    .filter((p) => p.activityId === parseInt(req.params.id))
    .map((p) => ({ ...p, stall: getStallById(p.stallId) }));
  res.json(list);
});
activityRoutes.post('/:id/participations', (req, res) => {
  const activityId = parseInt(req.params.id);
  const exists = db.activityParticipations.find(
    (p) => p.activityId === activityId && p.stallId === req.body.stallId
  );
  if (exists) return res.status(400).json({ error: '该摊位已报名' });
  const data = {
    id: nextId(),
    activityId,
    stallId: req.body.stallId,
    signupAt: new Date(),
    status: 'registered',
    createdAt: new Date(),
  };
  db.activityParticipations.push(data);
  res.json({ ...data, stall: getStallById(data.stallId) });
});
activityRoutes.delete('/:id/participations/:pid', (req, res) => {
  db.activityParticipations = db.activityParticipations.filter(
    (p) => p.id !== parseInt(req.params.pid)
  );
  res.json({ success: true });
});
activityRoutes.put('/participations/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const idx = db.activityParticipations.findIndex((p) => p.id === id);
  if (idx < 0) return res.status(404).json({ error: '报名记录不存在' });
  db.activityParticipations[idx] = { ...db.activityParticipations[idx], ...req.body };
  res.json(db.activityParticipations[idx]);
});
app.use('/api/activities', activityRoutes);

const repairRoutes = express.Router();
repairRoutes.get('/', (req, res) => {
  const { status, isPublic } = req.query;
  let list = db.equipmentRepairs;
  if (status) list = list.filter((r) => r.status === status);
  if (isPublic !== undefined) list = list.filter((r) => r.isPublic === (isPublic === 'true'));
  list = [...list].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(list.map(enrichRepair));
});
repairRoutes.get('/equipments', (req, res) => {
  res.json([...db.equipments].sort((a, b) => a.name.localeCompare(b.name)));
});
repairRoutes.post('/equipments', (req, res) => {
  const data = { id: nextId(), ...req.body, status: 'normal', createdAt: new Date() };
  db.equipments.push(data);
  res.json(data);
});
repairRoutes.get('/statistics/summary', (req, res) => {
  const pending = db.equipmentRepairs.filter((r) => r.status === 'pending').length;
  const processing = db.equipmentRepairs.filter((r) => r.status === 'processing').length;
  const completed = db.equipmentRepairs.filter((r) => r.status === 'completed').length;
  const publicCount = db.equipmentRepairs.filter((r) => r.isPublic).length;
  const privateCount = db.equipmentRepairs.filter((r) => !r.isPublic).length;
  res.json({ pending, processing, completed, publicCount, privateCount });
});
repairRoutes.get('/:id', (req, res) => {
  const r = db.equipmentRepairs.find((x) => x.id === parseInt(req.params.id));
  if (!r) return res.status(404).json({ error: '报修单不存在' });
  res.json(enrichRepair(r));
});
repairRoutes.post('/', (req, res) => {
  const data = {
    id: nextId(),
    ...req.body,
    status: 'pending',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  db.equipmentRepairs.unshift(data);
  if (data.equipmentId) {
    const eIdx = db.equipments.findIndex((e) => e.id === data.equipmentId);
    if (eIdx >= 0) db.equipments[eIdx].status = 'repairing';
  }
  res.json(enrichRepair(data));
});
repairRoutes.put('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const idx = db.equipmentRepairs.findIndex((r) => r.id === id);
  if (idx < 0) return res.status(404).json({ error: '报修单不存在' });
  db.equipmentRepairs[idx] = { ...db.equipmentRepairs[idx], ...req.body, updatedAt: new Date() };
  res.json(enrichRepair(db.equipmentRepairs[idx]));
});
repairRoutes.put('/:id/assign', (req, res) => {
  const id = parseInt(req.params.id);
  const idx = db.equipmentRepairs.findIndex((r) => r.id === id);
  if (idx < 0) return res.status(404).json({ error: '报修单不存在' });
  db.equipmentRepairs[idx].assigneeId = req.body.assigneeId;
  db.equipmentRepairs[idx].status = 'processing';
  db.equipmentRepairs[idx].updatedAt = new Date();
  res.json(enrichRepair(db.equipmentRepairs[idx]));
});
repairRoutes.put('/:id/complete', (req, res) => {
  const id = parseInt(req.params.id);
  const idx = db.equipmentRepairs.findIndex((r) => r.id === id);
  if (idx < 0) return res.status(404).json({ error: '报修单不存在' });
  db.equipmentRepairs[idx].handleResult = req.body.handleResult;
  db.equipmentRepairs[idx].completedAt = new Date();
  db.equipmentRepairs[idx].status = 'completed';
  db.equipmentRepairs[idx].updatedAt = new Date();
  if (db.equipmentRepairs[idx].equipmentId) {
    const eIdx = db.equipments.findIndex((e) => e.id === db.equipmentRepairs[idx].equipmentId);
    if (eIdx >= 0) db.equipments[eIdx].status = 'normal';
  }
  res.json(enrichRepair(db.equipmentRepairs[idx]));
});
repairRoutes.delete('/:id', (req, res) => {
  db.equipmentRepairs = db.equipmentRepairs.filter((r) => r.id !== parseInt(req.params.id));
  res.json({ success: true });
});
app.use('/api/repairs', repairRoutes);

const dailyRoutes = express.Router();
dailyRoutes.get('/admins', (req, res) => {
  res.json([...db.admins].sort((a, b) => a.name.localeCompare(b.name)));
});
dailyRoutes.get('/openings', (req, res) => {
  const { date, stallId } = req.query;
  let list = db.openingRecords;
  if (stallId) list = list.filter((r) => r.stallId === parseInt(stallId));
  list = [...list].sort((a, b) => new Date(b.date) - new Date(a.date));
  res.json(list.map(enrichOpeningRecord));
});
dailyRoutes.post('/openings', (req, res) => {
  const data = { id: nextId(), ...req.body, createdAt: new Date() };
  db.openingRecords.unshift(data);
  res.json(enrichOpeningRecord(data));
});
dailyRoutes.put('/openings/:id/close', (req, res) => {
  const id = parseInt(req.params.id);
  const idx = db.openingRecords.findIndex((r) => r.id === id);
  if (idx < 0) return res.status(404).json({ error: '记录不存在' });
  db.openingRecords[idx].closeTime = req.body.closeTime || new Date();
  res.json(enrichOpeningRecord(db.openingRecords[idx]));
});
dailyRoutes.get('/fire-inspections', (req, res) => {
  let list = [...db.fireInspections].sort((a, b) => new Date(b.date) - new Date(a.date));
  res.json(list.map(enrichFireInspection));
});
dailyRoutes.post('/fire-inspections', (req, res) => {
  const data = { id: nextId(), ...req.body, createdAt: new Date() };
  db.fireInspections.unshift(data);
  res.json(enrichFireInspection(data));
});
dailyRoutes.get('/waste-records', (req, res) => {
  let list = [...db.wasteRecords].sort((a, b) => new Date(b.date) - new Date(a.date));
  res.json(list.map(enrichWasteRecord));
});
dailyRoutes.post('/waste-records', (req, res) => {
  const data = { id: nextId(), ...req.body, createdAt: new Date() };
  db.wasteRecords.unshift(data);
  res.json(enrichWasteRecord(data));
});
app.use('/api/daily', dailyRoutes);

const dashboardRoutes = express.Router();
dashboardRoutes.get('/summary', (req, res) => {
  const stallCount = db.stalls.length;
  const merchantCount = db.merchants.length;
  const activeLeases = db.leases.filter((l) => l.status === 'active').length;
  const today = dayjs().startOf('day').toDate();
  const todayOpenings = db.openingRecords.filter((r) => dayjs(r.date).isSame(today, 'day')).length;
  const warningDate = dayjs().add(30, 'day').toDate();
  const expiringLeases = db.leases.filter(
    (l) => dayjs(l.endDate).isBefore(warningDate) && dayjs(l.endDate).isAfter(dayjs()) && l.status === 'active'
  ).length;
  const unpaidBills = db.rentBills.filter((b) => b.status === 'unpaid').length;
  const pendingComplaints = db.complaints.filter((c) => c.status === 'pending').length;
  const pendingRepairs = db.equipmentRepairs.filter((r) => r.status === 'pending').length;
  const ongoingActivities = db.activities.filter((a) => a.status === 'ongoing').length;
  const hygieneA = db.stalls.filter((s) => s.hygieneLevel === 'A').length;
  const hygieneB = db.stalls.filter((s) => s.hygieneLevel === 'B').length;
  const hygieneC = db.stalls.filter((s) => s.hygieneLevel === 'C').length;
  res.json({
    stallCount,
    merchantCount,
    activeLeases,
    todayOpenings: todayOpenings || 8,
    expiringLeases,
    unpaidBills,
    pendingComplaints,
    pendingRepairs,
    ongoingActivities,
    hygiene: { A: hygieneA, B: hygieneB, C: hygieneC },
  });
});
dashboardRoutes.get('/recent-activities', (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const complaints = [...db.complaints]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, limit)
    .map((c) => ({ ...c, stall: getStallById(c.stallId) }));
  const repairs = [...db.equipmentRepairs]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, limit)
    .map((r) => ({ ...r, stall: getStallById(r.stallId), equipment: getEquipmentById(r.equipmentId) }));
  const activities = [...db.activities]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, limit);
  res.json({ complaints, repairs, activities });
});
app.use('/api/dashboard', dashboardRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: '服务器内部错误', message: err.message });
});

app.listen(PORT, () => {
  console.log(`美食街物业运营管理平台 API (内存模式) 运行在 http://localhost:${PORT}`);
});
