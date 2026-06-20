import { PrismaClient } from '@prisma/client';
import dayjs from 'dayjs';

const prisma = new PrismaClient();

async function main() {
  await prisma.admin.deleteMany();
  await prisma.activityParticipation.deleteMany();
  await prisma.equipmentRepair.deleteMany();
  await prisma.complaint.deleteMany();
  await prisma.wasteRecord.deleteMany();
  await prisma.fireInspection.deleteMany();
  await prisma.openingRecord.deleteMany();
  await prisma.categoryRequest.deleteMany();
  await prisma.rentBill.deleteMany();
  await prisma.lease.deleteMany();
  await prisma.stall.deleteMany();
  await prisma.merchant.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.equipment.deleteMany();

  const admins = await prisma.admin.createMany({
    data: [
      { name: '张经理', role: '运营主管', phone: '13800138001', department: '运营部' },
      { name: '李主管', role: '物业管理员', phone: '13800138002', department: '物业部' },
      { name: '王师傅', role: '维修组组长', phone: '13800138003', department: '维修组' },
      { name: '赵小姐', role: '客服专员', phone: '13800138004', department: '客服部' },
    ],
  });
  console.log('Created admins');

  const merchantsData = [
    { name: '老北京炸酱面', contactPerson: '王老板', phone: '13900139001', idCard: '110101199001011234', businessCategory: '面食' },
    { name: '川味麻辣烫', contactPerson: '李老板', phone: '13900139002', idCard: '110101199001012345', businessCategory: '小吃' },
    { name: '粤式茶餐厅', contactPerson: '张老板', phone: '13900139003', idCard: '110101199001013456', businessCategory: '茶餐厅' },
    { name: '日式料理', contactPerson: '刘老板', phone: '13900139004', idCard: '110101199001014567', businessCategory: '日料' },
    { name: '韩式烤肉', contactPerson: '金老板', phone: '13900139005', idCard: '110101199001015678', businessCategory: '烧烤' },
    { name: '甜品工坊', contactPerson: '陈老板', phone: '13900139006', idCard: '110101199001016789', businessCategory: '甜品' },
    { name: '鲜果吧', contactPerson: '周老板', phone: '13900139007', idCard: '110101199001017890', businessCategory: '饮品' },
    { name: '汉堡之家', contactPerson: '吴老板', phone: '13900139008', idCard: '110101199001018901', businessCategory: '快餐' },
  ];

  const createdMerchants = [];
  for (const m of merchantsData) {
    const merchant = await prisma.merchant.create({ data: m });
    createdMerchants.push(merchant);
  }
  console.log('Created merchants');

  const stallsData = [
    { stallNumber: 'A-001', name: '老北京炸酱面摊位', location: 'A区1号', area: 25, hygieneLevel: 'A' },
    { stallNumber: 'A-002', name: '川味麻辣烫摊位', location: 'A区2号', area: 20, hygieneLevel: 'B' },
    { stallNumber: 'A-003', name: '粤式茶餐厅摊位', location: 'A区3号', area: 40, hygieneLevel: 'A' },
    { stallNumber: 'B-001', name: '日式料理摊位', location: 'B区1号', area: 35, hygieneLevel: 'A' },
    { stallNumber: 'B-002', name: '韩式烤肉摊位', location: 'B区2号', area: 30, hygieneLevel: 'B' },
    { stallNumber: 'B-003', name: '甜品工坊摊位', location: 'B区3号', area: 15, hygieneLevel: 'A' },
    { stallNumber: 'C-001', name: '鲜果吧摊位', location: 'C区1号', area: 12, hygieneLevel: 'C' },
    { stallNumber: 'C-002', name: '汉堡之家摊位', location: 'C区2号', area: 22, hygieneLevel: 'B' },
  ];

  const createdStalls = [];
  for (let i = 0; i < stallsData.length; i++) {
    const stall = await prisma.stall.create({
      data: { ...stallsData[i], merchantId: createdMerchants[i].id },
    });
    createdStalls.push(stall);
  }
  console.log('Created stalls');

  for (let i = 0; i < createdStalls.length; i++) {
    await prisma.lease.create({
      data: {
        stallId: createdStalls[i].id,
        merchantId: createdMerchants[i].id,
        startDate: dayjs().subtract(i + 1, 'month').toDate(),
        endDate: dayjs().add(11 - i, 'month').toDate(),
        monthlyRent: 5000 + i * 500,
        deposit: 10000,
      },
    });
  }
  console.log('Created leases');

  for (let i = 0; i < createdStalls.length; i++) {
    for (let j = 0; j < 3; j++) {
      await prisma.rentBill.create({
        data: {
          stallId: createdStalls[i].id,
          merchantId: createdMerchants[i].id,
          billMonth: dayjs().subtract(j, 'month').format('YYYY-MM'),
          amount: 5000 + i * 500,
          status: j === 0 ? 'unpaid' : 'paid',
          dueDate: dayjs().subtract(j, 'month').endOf('month').toDate(),
          paidDate: j === 0 ? null : dayjs().subtract(j, 'month').date(10).toDate(),
        },
      });
    }
  }
  console.log('Created rent bills');

  await prisma.categoryRequest.create({
    data: {
      stallId: createdStalls[1].id,
      merchantId: createdMerchants[1].id,
      oldCategory: '小吃',
      newCategory: '火锅',
      reason: '想增加火锅品类',
    },
  });
  console.log('Created category requests');

  for (let i = 0; i < createdStalls.length; i++) {
    await prisma.openingRecord.create({
      data: {
        stallId: createdStalls[i].id,
        date: dayjs().subtract(1, 'day').toDate(),
        openTime: dayjs().subtract(1, 'day').hour(8).minute(0).toDate(),
        closeTime: dayjs().subtract(1, 'day').hour(22).minute(0).toDate(),
      },
    });
  }
  console.log('Created opening records');

  for (let i = 0; i < createdStalls.length; i++) {
    await prisma.fireInspection.create({
      data: {
        stallId: createdStalls[i].id,
        gasValveClosed: i % 3 !== 2,
        firePassageClear: i % 2 === 0,
        inspector: '李主管',
        date: dayjs().subtract(1, 'day').toDate(),
        remark: i % 3 === 2 ? '燃气阀门未关闭' : '',
      },
    });
  }
  console.log('Created fire inspections');

  for (let i = 0; i < createdStalls.length; i++) {
    await prisma.wasteRecord.create({
      data: {
        stallId: createdStalls[i].id,
        wasteType: '餐厨垃圾',
        weight: 5 + i * 2,
        collector: '清运公司A',
        date: dayjs().subtract(1, 'day').toDate(),
      },
    });
  }
  console.log('Created waste records');

  const complaintsData = [
    { stallId: createdStalls[1].id, type: '菜品质量', description: '菜品不新鲜', customerName: '顾客A', customerPhone: '13700137001', status: 'pending' },
    { stallId: createdStalls[6].id, type: '卫生问题', description: '桌面不干净', customerName: '顾客B', customerPhone: '13700137002', status: 'processing', assigneeId: 4 },
    { type: '服务态度', description: '服务员态度不好', customerName: '顾客C', customerPhone: '13700137003', status: 'completed', assigneeId: 4, handleResult: '已批评教育服务员', handleAt: new Date(), revisitResult: '顾客满意' },
    { stallId: createdStalls[3].id, type: '价格争议', description: '标价与实际收费不符', customerName: '顾客D', customerPhone: '13700137004', status: 'pending' },
  ];

  for (const c of complaintsData) {
    await prisma.complaint.create({ data: c });
  }
  console.log('Created complaints');

  const activities = [
    { name: '夏日美食节', type: '美食节', startDate: dayjs().add(5, 'day').toDate(), endDate: dayjs().add(12, 'day').toDate(), description: '汇聚各地美食，特价优惠', expectedVisitors: 5000, status: 'planning' },
    { name: '周末夜市', type: '周末特惠', startDate: dayjs().add(3, 'day').toDate(), endDate: dayjs().add(4, 'day').toDate(), description: '周末特惠活动', expectedVisitors: 2000, status: 'ongoing', actualVisitors: 1500 },
    { name: '打卡集章', type: '打卡集章', startDate: dayjs().subtract(10, 'day').toDate(), endDate: dayjs().subtract(3, 'day').toDate(), description: '集章赢礼品', expectedVisitors: 3000, status: 'completed', actualVisitors: 2800 },
  ];

  const createdActivities = [];
  for (const a of activities) {
    const activity = await prisma.activity.create({ data: a });
    createdActivities.push(activity);
  }
  console.log('Created activities');

  for (let i = 0; i < createdStalls.length; i++) {
    await prisma.activityParticipation.create({
      data: {
        activityId: createdActivities[1].id,
        stallId: createdStalls[i].id,
        beforeSales: 8000 + i * 1000,
        duringSales: 12000 + i * 1500,
      },
    });
  }
  console.log('Created activity participations');

  const equipmentsData = [
    { name: '卫生间洗手池1号', type: '卫生间', location: 'A区公共卫生间', status: 'normal' },
    { name: '电梯A', type: '电梯', location: 'A区电梯', status: 'normal' },
    { name: '中央空调1号', type: '空调', location: '美食街入口', status: 'normal' },
    { name: '停车场道闸', type: '停车场', location: '停车场入口', status: 'normal' },
    { name: '中央空调2号', type: '空调', location: 'B区中央', status: 'faulty' },
  ];

  const createdEquipments = [];
  for (const e of equipmentsData) {
    const equipment = await prisma.equipment.create({ data: e });
    createdEquipments.push(equipment);
  }
  console.log('Created equipments');

  await prisma.equipmentRepair.createMany({
    data: [
      { equipmentId: createdEquipments[4].id, isPublic: true, description: '空调不制冷', reporter: '管理员', status: 'pending' },
      { stallId: createdStalls[2].id, isPublic: false, description: '冰箱坏了', reporter: '张老板', status: 'processing', assigneeId: 3 },
      { equipmentId: createdEquipments[0].id, isPublic: true, description: '水龙头漏水', reporter: '保洁员', status: 'completed', assigneeId: 3, handleResult: '已更换水龙头', completedAt: new Date() },
      { equipmentId: createdEquipments[2].id, isPublic: true, description: '灯光不亮', reporter: '巡查员', status: 'pending' },
    ],
  });
  console.log('Created equipment repairs');

  console.log('Seed data created successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
