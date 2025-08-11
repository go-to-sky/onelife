const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixUser() {
  try {
    console.log('🔍 修复用户问题...');
    
    const user = await prisma.user.upsert({
      where: { id: 'temp-user' },
      update: {},
      create: {
        id: 'temp-user',
        name: '管理员',
        email: 'admin@example.com',
      },
    });
    
    console.log('✅ 用户已就绪:', user.id);
    console.log('🎉 现在可以添加任务了！');
    
  } catch (error) {
    console.error('❌ 错误:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

fixUser();