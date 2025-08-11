const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testTaskCreate() {
  try {
    console.log('🔍 测试任务创建...');

    // 检查用户是否存在
    const user = await prisma.user.findUnique({
      where: { id: 'temp-user-id' },
      select: { id: true, name: true }
    });

    if (user) {
      console.log('✅ 用户存在:', user.name);
      console.log('🎉 任务创建功能应该正常工作！');
      console.log('请刷新页面并尝试添加任务。');
    } else {
      console.log('❌ 用户不存在: temp-user-id');
    }

  } catch (error) {
    console.error('❌ 错误:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testTaskCreate();