const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['error', 'warn'],
});

async function checkUserIds() {
  try {
    console.log('🔍 检查数据库中的用户ID分布...\n');

    // 检查所有展品的用户ID
    const exhibits = await prisma.exhibit.findMany({
      select: {
        id: true,
        title: true,
        userId: true,
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log('📊 展品用户ID分布:');
    const userIdCounts = {};
    exhibits.forEach(exhibit => {
      userIdCounts[exhibit.userId] = (userIdCounts[exhibit.userId] || 0) + 1;
    });

    Object.entries(userIdCounts).forEach(([userId, count]) => {
      console.log(`  - ${userId}: ${count} 个展品`);
    });

    console.log('\n📝 详细展品列表:');
    exhibits.forEach((exhibit, index) => {
      console.log(`${index + 1}. "${exhibit.title}" (ID: ${exhibit.id}) - 用户: ${exhibit.userId}`);
    });

    // 检查用户表
    console.log('\n👥 用户表中的用户:');
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
      }
    });

    if (users.length === 0) {
      console.log('  - 用户表为空');
    } else {
      users.forEach(user => {
        console.log(`  - ${user.id}: ${user.name} (${user.email})`);
      });
    }

    console.log('\n💡 建议解决方案:');
    console.log('1. 批量更新所有展品的 userId 为 "temp-user"');
    console.log('2. 修改权限系统，增加管理员权限');
    console.log('3. 创建真正的管理员账户');

  } catch (error) {
    console.error('❌ 检查失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUserIds(); 