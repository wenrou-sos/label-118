import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.$connect();
    console.log('✅ 数据库连接成功');
    
    const count = await prisma.stall.count();
    console.log(`摊位数量: ${count}`);
    
    await prisma.$disconnect();
    process.exit(0);
  } catch (e) {
    console.error('❌ 数据库连接失败:', e.message);
    process.exit(1);
  }
}

main();
