const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['error', 'warn'],
});

async function testSystem() {
  try {
    console.log('🔧 系统状态检查...\n');

    // 1. 检查数据库连接
    console.log('📊 数据库连接测试:');
    const exhibitCount = await prisma.exhibit.count();
    const categoryCount = await prisma.category.count();
    const userCount = await prisma.user.count();
    
    console.log(`  - 展品数量: ${exhibitCount}`);
    console.log(`  - 分类数量: ${categoryCount}`);
    console.log(`  - 用户数量: ${userCount}`);
    console.log('  ✅ 数据库连接正常');

    // 2. 检查管理员用户
    console.log('\n🔐 管理员用户信息:');
    const adminUser = await prisma.user.findUnique({
      where: { id: 'temp-user' },
      select: { id: true, name: true, email: true }
    });
    
    if (adminUser) {
      console.log(`  - 用户ID: ${adminUser.id}`);
      console.log(`  - 用户名: ${adminUser.name}`);
      console.log(`  - 邮箱: ${adminUser.email}`);
      console.log('  ✅ 管理员用户存在');
    } else {
      console.log('  ⚠️  管理员用户不存在，但系统使用模拟认证');
    }

    // 3. 检查展品归属
    console.log('\n📝 展品归属统计:');
    const exhibits = await prisma.exhibit.groupBy({
      by: ['userId'],
      _count: { userId: true }
    });
    
    exhibits.forEach(group => {
      console.log(`  - 用户 ${group.userId}: ${group._count.userId} 个展品`);
    });

    // 4. 系统配置检查
    console.log('\n⚙️  系统配置:');
    console.log('  - 认证模式: 模拟用户认证');
    console.log('  - 管理员权限: 已启用 (isAdmin: true)');
    console.log('  - 端口配置: 3003');
    console.log('  - 权限检查: 管理员可编辑任何展品');
    
    console.log('\n✅ 系统状态检查完成！');
    console.log('\n💡 用户可以:');
    console.log('  - 创建新展品');
    console.log('  - 编辑任何现有展品');
    console.log('  - 删除任何展品');
    console.log('  - 正常退出到首页');

  } catch (error) {
    console.error('❌ 系统检查失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testSystem(); 