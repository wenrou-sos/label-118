import dayjs from 'dayjs';

let idCounter = 100;
const nextId = () => ++idCounter;

export const db = {
  admins: [],
  stalls: [],
  merchants: [],
  leases: [],
  rentBills: [],
  categoryRequests: [],
  openingRecords: [],
  fireInspections: [],
  wasteRecords: [],
  complaints: [],
  activities: [],
  activityParticipations: [],
  equipments: [],
  equipmentRepairs: [],
};

export function initMockData() {
  idCounter = 100;

  db.admins = [
    { id: 1, name: '张经理', role: '运营主管', phone: '13800138001', department: '运营部', createdAt: new Date() },
    { id: 2, name: '李主管', role: '物业管理员', phone: '13800138002', department: '物业部', createdAt: new Date() },
    { id: 3, name: '王师傅', role: '维修组组长', phone: '13800138003', department: '维修组', createdAt: new Date() },
    { id: 4, name: '赵小姐', role: '客服专员', phone: '13800138004', department: '客服部', createdAt: new Date() },
  ];

  db.merchants = [
    { id: 1, name: '老北京炸酱面', contactPerson: '王老板', phone: '13900139001', idCard: '110101199001011234', businessCategory: '面食', createdAt: new Date(), updatedAt: new Date() },
    { id: 2, name: '川味麻辣烫', contactPerson: '李老板', phone: '13900139002', idCard: '110101199001012345', businessCategory: '小吃', createdAt: new Date(), updatedAt: new Date() },
    { id: 3, name: '粤式茶餐厅', contactPerson: '张老板', phone: '13900139003', idCard: '110101199001013456', businessCategory: '茶餐厅', createdAt: new Date(), updatedAt: new Date() },
    { id: 4, name: '日式料理', contactPerson: '刘老板', phone: '13900139004', idCard: '110101199001014567', businessCategory: '日料', createdAt: new Date(), updatedAt: new Date() },
    { id: 5, name: '韩式烤肉', contactPerson: '金老板', phone: '13900139005', idCard: '110101199001015678', businessCategory: '烧烤', createdAt: new Date(), updatedAt: new Date() },
    { id: 6, name: '甜品工坊', contactPerson: '陈老板', phone: '13900139006', idCard: '110101199001016789', businessCategory: '甜品', createdAt: new Date(), updatedAt: new Date() },
    { id: 7, name: '鲜果吧', contactPerson: '周老板', phone: '13900139007', idCard: '110101199001017890', businessCategory: '饮品', createdAt: new Date(), updatedAt: new Date() },
    { id: 8, name: '汉堡之家', contactPerson: '吴老板', phone: '13900139008', idCard: '110101199001018901', businessCategory: '快餐', createdAt: new Date(), updatedAt: new Date() },
  ];

  db.stalls = [
    { id: 1, stallNumber: 'A-001', name: '老北京炸酱面摊位', location: 'A区1号', area: 25, status: 'normal', hygieneLevel: 'A', merchantId: 1, createdAt: new Date(), updatedAt: new Date() },
    { id: 2, stallNumber: 'A-002', name: '川味麻辣烫摊位', location: 'A区2号', area: 20, status: 'normal', hygieneLevel: 'B', merchantId: 2, createdAt: new Date(), updatedAt: new Date() },
    { id: 3, stallNumber: 'A-003', name: '粤式茶餐厅摊位', location: 'A区3号', area: 40, status: 'normal', hygieneLevel: 'A', merchantId: 3, createdAt: new Date(), updatedAt: new Date() },
    { id: 4, stallNumber: 'B-001', name: '日式料理摊位', location: 'B区1号', area: 35, status: 'normal', hygieneLevel: 'A', merchantId: 4, createdAt: new Date(), updatedAt: new Date() },
    { id: 5, stallNumber: 'B-002', name: '韩式烤肉摊位', location: 'B区2号', area: 30, status: 'normal', hygieneLevel: 'B', merchantId: 5, createdAt: new Date(), updatedAt: new Date() },
    { id: 6, stallNumber: 'B-003', name: '甜品工坊摊位', location: 'B区3号', area: 15, status: 'normal', hygieneLevel: 'A', merchantId: 6, createdAt: new Date(), updatedAt: new Date() },
    { id: 7, stallNumber: 'C-001', name: '鲜果吧摊位', location: 'C区1号', area: 12, status: 'normal', hygieneLevel: 'C', merchantId: 7, createdAt: new Date(), updatedAt: new Date() },
    { id: 8, stallNumber: 'C-002', name: '汉堡之家摊位', location: 'C区2号', area: 22, status: 'normal', hygieneLevel: 'B', merchantId: 8, createdAt: new Date(), updatedAt: new Date() },
  ];

  db.leases = [
    { id: 1, stallId: 1, merchantId: 1, startDate: dayjs().subtract(1, 'month').toDate(), endDate: dayjs().add(11, 'month').toDate(), monthlyRent: 5000, deposit: 10000, status: 'active', createdAt: new Date(), updatedAt: new Date() },
    { id: 2, stallId: 2, merchantId: 2, startDate: dayjs().subtract(2, 'month').toDate(), endDate: dayjs().add(15, 'day').toDate(), monthlyRent: 5500, deposit: 10000, status: 'active', createdAt: new Date(), updatedAt: new Date() },
    { id: 3, stallId: 3, merchantId: 3, startDate: dayjs().subtract(3, 'month').toDate(), endDate: dayjs().add(10, 'month').toDate(), monthlyRent: 6000, deposit: 15000, status: 'active', createdAt: new Date(), updatedAt: new Date() },
    { id: 4, stallId: 4, merchantId: 4, startDate: dayjs().subtract(4, 'month').toDate(), endDate: dayjs().add(5, 'day').toDate(), monthlyRent: 6500, deposit: 15000, status: 'active', createdAt: new Date(), updatedAt: new Date() },
    { id: 5, stallId: 5, merchantId: 5, startDate: dayjs().subtract(5, 'month').toDate(), endDate: dayjs().add(20, 'day').toDate(), monthlyRent: 7000, deposit: 15000, status: 'active', createdAt: new Date(), updatedAt: new Date() },
    { id: 6, stallId: 6, merchantId: 6, startDate: dayjs().subtract(6, 'month').toDate(), endDate: dayjs().add(8, 'month').toDate(), monthlyRent: 5500, deposit: 10000, status: 'active', createdAt: new Date(), updatedAt: new Date() },
    { id: 7, stallId: 7, merchantId: 7, startDate: dayjs().subtract(7, 'month').toDate(), endDate: dayjs().add(25, 'day').toDate(), monthlyRent: 6000, deposit: 10000, status: 'active', createdAt: new Date(), updatedAt: new Date() },
    { id: 8, stallId: 8, merchantId: 8, startDate: dayjs().subtract(8, 'month').toDate(), endDate: dayjs().add(9, 'month').toDate(), monthlyRent: 6500, deposit: 10000, status: 'active', createdAt: new Date(), updatedAt: new Date() },
  ];

  db.rentBills = [];
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 3; j++) {
      db.rentBills.push({
        id: nextId(),
        stallId: i + 1,
        merchantId: i + 1,
        billMonth: dayjs().subtract(j, 'month').format('YYYY-MM'),
        amount: 5000 + i * 500,
        status: j === 0 ? 'unpaid' : 'paid',
        dueDate: dayjs().subtract(j, 'month').endOf('month').toDate(),
        paidDate: j === 0 ? null : dayjs().subtract(j, 'month').date(10).toDate(),
        remark: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  }

  db.categoryRequests = [
    {
      id: 1,
      stallId: 2,
      merchantId: 2,
      oldCategory: '小吃',
      newCategory: '火锅',
      reason: '想增加火锅品类，吸引更多顾客',
      status: 'pending',
      approvedBy: null,
      approvedAt: null,
      createdAt: dayjs().subtract(1, 'day').toDate(),
      updatedAt: dayjs().subtract(1, 'day').toDate(),
    },
    {
      id: 2,
      stallId: 6,
      merchantId: 6,
      oldCategory: '甜品',
      newCategory: '奶茶甜品',
      reason: '新增奶茶产品线',
      status: 'pending',
      approvedBy: null,
      approvedAt: null,
      createdAt: dayjs().subtract(2, 'day').toDate(),
      updatedAt: dayjs().subtract(2, 'day').toDate(),
    },
  ];

  for (let i = 0; i < 8; i++) {
    db.openingRecords.push({
      id: nextId(),
      stallId: i + 1,
      date: dayjs().subtract(1, 'day').toDate(),
      openTime: dayjs().subtract(1, 'day').hour(8).minute(i * 5).toDate(),
      closeTime: dayjs().subtract(1, 'day').hour(22).minute(0).toDate(),
      createdAt: new Date(),
    });
  }

  db.fireInspections = [
    { id: nextId(), stallId: 1, gasValveClosed: true, firePassageClear: true, photoUrl: null, inspector: '李主管', date: dayjs().subtract(1, 'day').toDate(), remark: '', createdAt: new Date() },
    { id: nextId(), stallId: 2, gasValveClosed: true, firePassageClear: false, photoUrl: null, inspector: '李主管', date: dayjs().subtract(1, 'day').toDate(), remark: '消防通道堆放杂物', createdAt: new Date() },
    { id: nextId(), stallId: 3, gasValveClosed: true, firePassageClear: true, photoUrl: null, inspector: '李主管', date: dayjs().subtract(1, 'day').toDate(), remark: '', createdAt: new Date() },
    { id: nextId(), stallId: 4, gasValveClosed: true, firePassageClear: true, photoUrl: null, inspector: '李主管', date: dayjs().subtract(1, 'day').toDate(), remark: '', createdAt: new Date() },
    { id: nextId(), stallId: 5, gasValveClosed: true, firePassageClear: true, photoUrl: null, inspector: '李主管', date: dayjs().subtract(1, 'day').toDate(), remark: '', createdAt: new Date() },
    { id: nextId(), stallId: 6, gasValveClosed: true, firePassageClear: true, photoUrl: null, inspector: '李主管', date: dayjs().subtract(1, 'day').toDate(), remark: '', createdAt: new Date() },
    { id: nextId(), stallId: 7, gasValveClosed: false, firePassageClear: true, photoUrl: null, inspector: '李主管', date: dayjs().subtract(1, 'day').toDate(), remark: '燃气阀门未关闭！', createdAt: new Date() },
    { id: nextId(), stallId: 8, gasValveClosed: true, firePassageClear: true, photoUrl: null, inspector: '李主管', date: dayjs().subtract(1, 'day').toDate(), remark: '', createdAt: new Date() },
  ];

  for (let i = 0; i < 8; i++) {
    db.wasteRecords.push({
      id: nextId(),
      stallId: i + 1,
      wasteType: '餐厨垃圾',
      weight: 5 + i * 2,
      collector: '清运公司A',
      date: dayjs().subtract(1, 'day').toDate(),
      remark: i === 2 ? '桶数较多' : '',
      createdAt: new Date(),
    });
  }

  db.complaints = [
    {
      id: 1,
      stallId: 2,
      type: '菜品质量',
      description: '麻辣烫菜品不新鲜，吃起来有异味',
      customerName: '顾客王先生',
      customerPhone: '13700137001',
      status: 'pending',
      assigneeId: null,
      handleResult: null,
      handleAt: null,
      revisitResult: null,
      revisitAt: null,
      createdAt: dayjs().subtract(2, 'hour').toDate(),
      updatedAt: dayjs().subtract(2, 'hour').toDate(),
    },
    {
      id: 2,
      stallId: 7,
      type: '卫生问题',
      description: '桌面油腻，椅子上有污渍',
      customerName: '顾客李女士',
      customerPhone: '13700137002',
      status: 'processing',
      assigneeId: 4,
      handleResult: null,
      handleAt: null,
      revisitResult: null,
      revisitAt: null,
      createdAt: dayjs().subtract(5, 'hour').toDate(),
      updatedAt: dayjs().subtract(5, 'hour').toDate(),
    },
    {
      id: 3,
      stallId: null,
      type: '服务态度',
      description: '某摊位服务员态度恶劣，问问题爱理不理',
      customerName: '顾客张先生',
      customerPhone: '13700137003',
      status: 'completed',
      assigneeId: 4,
      handleResult: '已对涉事员工进行批评教育，员工已认识到错误',
      handleAt: dayjs().subtract(2, 'hour').toDate(),
      revisitResult: '顾客对处理结果表示满意',
      revisitAt: dayjs().subtract(1, 'hour').toDate(),
      createdAt: dayjs().subtract(1, 'day').toDate(),
      updatedAt: dayjs().subtract(1, 'hour').toDate(),
    },
    {
      id: 4,
      stallId: 4,
      type: '价格争议',
      description: '菜单标价38元，结账时收了48元',
      customerName: '顾客刘女士',
      customerPhone: '13700137004',
      status: 'pending',
      assigneeId: null,
      handleResult: null,
      handleAt: null,
      revisitResult: null,
      revisitAt: null,
      createdAt: dayjs().subtract(30, 'minute').toDate(),
      updatedAt: dayjs().subtract(30, 'minute').toDate(),
    },
    {
      id: 5,
      stallId: 5,
      type: '卫生问题',
      description: '操作台上有苍蝇飞',
      customerName: '顾客陈先生',
      customerPhone: '13700137005',
      status: 'pending',
      assigneeId: null,
      handleResult: null,
      handleAt: null,
      revisitResult: null,
      revisitAt: null,
      createdAt: dayjs().subtract(15, 'minute').toDate(),
      updatedAt: dayjs().subtract(15, 'minute').toDate(),
    },
  ];

  db.activities = [
    {
      id: 1,
      name: '夏日美食节',
      type: '美食节',
      startDate: dayjs().add(5, 'day').toDate(),
      endDate: dayjs().add(12, 'day').toDate(),
      description: '汇聚各地特色美食，全场8折起，更有精彩文艺表演',
      expectedVisitors: 5000,
      actualVisitors: null,
      status: 'planning',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 2,
      name: '周末夜市特惠',
      type: '周末特惠',
      startDate: dayjs().add(3, 'day').toDate(),
      endDate: dayjs().add(4, 'day').toDate(),
      description: '周末夜市活动，所有摊位8折起，晚间19:00后额外优惠',
      expectedVisitors: 2000,
      actualVisitors: 1500,
      status: 'ongoing',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 3,
      name: '打卡集章赢好礼',
      type: '打卡集章',
      startDate: dayjs().subtract(10, 'day').toDate(),
      endDate: dayjs().subtract(3, 'day').toDate(),
      description: '在5个以上摊位消费即可集章，集满10章赢取精美礼品',
      expectedVisitors: 3000,
      actualVisitors: 2800,
      status: 'completed',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  db.activityParticipations = [];
  const p2 = [1, 2, 3, 4, 5, 6];
  for (let i = 0; i < p2.length; i++) {
    db.activityParticipations.push({
      id: nextId(),
      activityId: 2,
      stallId: p2[i],
      signupAt: new Date(),
      beforeSales: 8000 + i * 1000,
      duringSales: 12000 + i * 1500,
      status: 'registered',
      createdAt: new Date(),
    });
  }
  db.activityParticipations.push(
    { id: nextId(), activityId: 1, stallId: 1, signupAt: new Date(), beforeSales: null, duringSales: null, status: 'registered', createdAt: new Date() },
    { id: nextId(), activityId: 1, stallId: 2, signupAt: new Date(), beforeSales: null, duringSales: null, status: 'registered', createdAt: new Date() },
    { id: nextId(), activityId: 3, stallId: 1, signupAt: new Date(), beforeSales: 7000, duringSales: 9500, status: 'registered', createdAt: new Date() },
    { id: nextId(), activityId: 3, stallId: 3, signupAt: new Date(), beforeSales: 9000, duringSales: 12000, status: 'registered', createdAt: new Date() }
  );

  db.equipments = [
    { id: 1, name: '卫生间洗手池1号', type: '卫生间', location: 'A区公共卫生间', status: 'normal', createdAt: new Date() },
    { id: 2, name: '电梯A', type: '电梯', location: 'A区电梯', status: 'normal', createdAt: new Date() },
    { id: 3, name: '中央空调1号', type: '空调', location: '美食街入口', status: 'normal', createdAt: new Date() },
    { id: 4, name: '停车场道闸', type: '停车场', location: '停车场入口', status: 'normal', createdAt: new Date() },
    { id: 5, name: '中央空调2号', type: '空调', location: 'B区中央', status: 'faulty', createdAt: new Date() },
    { id: 6, name: '公共照明-入口', type: '照明', location: '美食街主入口', status: 'normal', createdAt: new Date() },
  ];

  db.equipmentRepairs = [
    {
      id: 1,
      equipmentId: 5,
      stallId: null,
      isPublic: true,
      description: '中央空调不制冷，吹出来的风是热的',
      reporter: '管理员',
      status: 'pending',
      assigneeId: null,
      handleResult: null,
      completedAt: null,
      createdAt: dayjs().subtract(2, 'hour').toDate(),
      updatedAt: dayjs().subtract(2, 'hour').toDate(),
    },
    {
      id: 2,
      equipmentId: null,
      stallId: 3,
      isPublic: false,
      description: '冷藏柜温度不够，食材快坏了',
      reporter: '张老板',
      status: 'processing',
      assigneeId: 3,
      handleResult: null,
      completedAt: null,
      createdAt: dayjs().subtract(5, 'hour').toDate(),
      updatedAt: dayjs().subtract(5, 'hour').toDate(),
    },
    {
      id: 3,
      equipmentId: 1,
      stallId: null,
      isPublic: true,
      description: '卫生间水龙头漏水严重',
      reporter: '保洁员李阿姨',
      status: 'completed',
      assigneeId: 3,
      handleResult: '已更换新的水龙头，测试不漏水',
      completedAt: dayjs().subtract(1, 'hour').toDate(),
      createdAt: dayjs().subtract(1, 'day').toDate(),
      updatedAt: dayjs().subtract(1, 'hour').toDate(),
    },
    {
      id: 4,
      equipmentId: 3,
      stallId: null,
      isPublic: true,
      description: '入口处灯光昏暗，晚上看不清',
      reporter: '巡查员',
      status: 'pending',
      assigneeId: null,
      handleResult: null,
      completedAt: null,
      createdAt: dayjs().subtract(30, 'minute').toDate(),
      updatedAt: dayjs().subtract(30, 'minute').toDate(),
    },
  ];
}

export function getMerchantById(id) {
  return db.merchants.find((m) => m.id === id) || null;
}
export function getStallById(id) {
  return db.stalls.find((s) => s.id === id) || null;
}
export function getAdminById(id) {
  return db.admins.find((a) => a.id === id) || null;
}
export function getEquipmentById(id) {
  return db.equipments.find((e) => e.id === id) || null;
}
export function getLeaseByStallId(stallId) {
  return db.leases.find((l) => l.stallId === stallId) || null;
}
export function getParticipationsByActivityId(activityId) {
  return db.activityParticipations.filter((p) => p.activityId === activityId);
}

export function enrichStall(stall) {
  if (!stall) return null;
  return {
    ...stall,
    merchant: getMerchantById(stall.merchantId),
    lease: getLeaseByStallId(stall.id),
  };
}
export function enrichLease(lease) {
  if (!lease) return null;
  return {
    ...lease,
    stall: getStallById(lease.stallId),
    merchant: getMerchantById(lease.merchantId),
  };
}
export function enrichCategoryRequest(req) {
  if (!req) return null;
  return {
    ...req,
    stall: getStallById(req.stallId),
    merchant: getMerchantById(req.merchantId),
  };
}
export function enrichRentBill(bill) {
  if (!bill) return null;
  return {
    ...bill,
    stall: getStallById(bill.stallId),
    merchant: getMerchantById(bill.merchantId),
  };
}
export function enrichComplaint(c) {
  if (!c) return null;
  return {
    ...c,
    stall: getStallById(c.stallId),
    assignee: getAdminById(c.assigneeId),
  };
}
export function enumerateActivity(a) {
  if (!a) return null;
  const participations = getParticipationsByActivityId(a.id).map((p) => ({
    ...p,
    stall: getStallById(p.stallId),
  }));
  return { ...a, participations };
}
export function enrichRepair(r) {
  if (!r) return null;
  return {
    ...r,
    equipment: getEquipmentById(r.equipmentId),
    stall: getStallById(r.stallId),
    assignee: getAdminById(r.assigneeId),
  };
}
export function enrichOpeningRecord(r) {
  if (!r) return null;
  return { ...r, stall: getStallById(r.stallId) };
}
export function enrichFireInspection(r) {
  if (!r) return null;
  return { ...r, stall: getStallById(r.stallId) };
}
export function enrichWasteRecord(r) {
  if (!r) return null;
  return { ...r, stall: getStallById(r.stallId) };
}

export { nextId };
