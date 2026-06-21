import { PrismaClient } from '@prisma/client';
import dayjs from 'dayjs';

const prisma = new PrismaClient();

async function main() {
  await prisma.notice.deleteMany();
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

  const leases = await prisma.lease.findMany({
    take: 3,
    orderBy: { id: 'asc' },
  });

  for (let i = 0; i < leases.length; i++) {
    const docCount = i % 2 === 0 ? 2 : 1;
    for (let v = 1; v <= docCount; v++) {
      const isPdf = v === 1;
      const ext = isPdf ? 'pdf' : 'jpg';
      const fileType = isPdf ? 'application/pdf' : 'image/jpeg';
      const baseSize = isPdf ? 500000 : 200000;
      const fileSize = baseSize + Math.floor(Math.random() * 500000);

      await prisma.leaseDocument.create({
        data: {
          leaseId: leases[i].id,
          fileName: `lease_${leases[i].id}_v${v}.${ext}`,
          originalName: `租约${leases[i].id}_版本${v}.${ext}`,
          fileType,
          fileSize,
          fileUrl: `/uploads/leases/lease_${leases[i].id}_v${v}.${ext}`,
          version: v,
          uploadedBy: '系统',
          remark: v === 1 ? '初始租约合同' : '补充协议',
        },
      });
    }
  }
  console.log('Created lease documents');

  const adminList = await prisma.admin.findMany();
  const noticesData = [
    {
      title: '关于美食街夏季营业时间调整的通知',
      content: '各位商户您好：\n\n随着夏季来临，为更好地服务顾客，经研究决定，自即日起美食街营业时间调整为：\n\n周一至周五：10:00 - 22:00\n周六周日：09:00 - 23:00\n\n请各商户做好相应准备，按时营业。\n\n谢谢配合！',
      priority: 'high',
      publisherId: adminList[0]?.id,
      isTop: true,
    },
    {
      title: '食品安全检查通知',
      content: '为保障食品安全，物业将于本周五（6月26日）上午9:00-12:00进行食品安全专项检查。请各商户提前做好准备，确保：\n\n1. 从业人员持健康证上岗\n2. 食品原料新鲜、在保质期内\n3. 操作间卫生整洁\n4. 餐具消毒到位\n\n请各商户积极配合检查工作。',
      priority: 'normal',
      publisherId: adminList[1]?.id,
      isTop: false,
    },
    {
      title: '夏日美食节活动报名通知',
      content: '一年一度的夏日美食节即将开幕！现诚邀各位商户踊跃报名参与。\n\n活动时间：7月10日 - 7月20日\n活动地点：美食街中心广场\n报名截止：7月1日\n\n参与商户可获得：\n- 免费展位布置\n- 活动宣传推广\n- 客流导入支持\n\n有意向的商户请到物业办公室报名或电话咨询。',
      priority: 'normal',
      publisherId: adminList[0]?.id,
      isTop: false,
    },
    {
      title: '停车场维修通知',
      content: '因停车场设施升级改造，B区停车场将于6月25日-6月27日临时关闭维修。\n\n维修期间，请商户和顾客将车辆停放到A区停车场。给您带来不便，敬请谅解。\n\n如有疑问，请联系物业客服。',
      priority: 'low',
      publisherId: adminList[1]?.id,
      isTop: false,
    },
    {
      title: '商户消防安全培训通知',
      content: '为提升商户消防安全意识和应急处置能力，物业将组织消防安全培训。\n\n培训时间：7月3日 下午14:00\n培训地点：美食街会议室\n参加人员：各商户负责人及店员代表\n\n请各商户务必派人参加，共同维护美食街消防安全。',
      priority: 'normal',
      publisherId: adminList[1]?.id,
      isTop: false,
    },
  ];

  for (const n of noticesData) {
    await prisma.notice.create({ data: n });
  }
  console.log('Created notices');

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
