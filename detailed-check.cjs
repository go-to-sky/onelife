const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function detailedCheck() {
  try {
    console.log('开始详细检查...');
    
    // 检查数据库连接
    await prisma.$connect();
    console.log('✅ 数据库连接成功');
    
    // 检查展品总数
    const exhibitCount = await prisma.exhibit.count();
    console.log('展品总数:', exhibitCount);
    
    if (exhibitCount === 0) {
      console.log('❌ 数据库中没有展品!');
      return;
    }
    
    // 获取所有展品
    const exhibits = await prisma.exhibit.findMany({
      select: {
        id: true,
        title: true,
        userId: true,
        slug: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    console.log('\n所有展品详情:');
    exhibits.forEach((exhibit, index) => {
      console.log(`${index + 1}. 标题: "${exhibit.title}"`);
      console.log(`   ID: ${exhibit.id}`);
      console.log(`   用户ID: ${exhibit.userId}`);
      console.log(`   Slug: ${exhibit.slug}`);
      console.log(`   创建时间: ${exhibit.createdAt}`);
      console.log(`   权限状态: ${exhibit.userId === 'temp-user' ? '✅ 正确' : '❌ 错误'}`);
      console.log('');
    });
    
    // 检查用户
    const users = await prisma.user.findMany();
    console.log('用户列表:');
    users.forEach(user => {
      console.log(`- ${user.id}: ${user.name} (${user.email})`);
    });
    
    // 统计
    const correctExhibits = exhibits.filter(e => e.userId === 'temp-user').length;
    const wrongExhibits = exhibits.filter(e => e.userId !== 'temp-user').length;
    
    console.log('\n权限统计:');
    console.log(`✅ 正确权限: ${correctExhibits} 个`);
    console.log(`❌ 错误权限: ${wrongExhibits} 个`);
    
    if (wrongExhibits === 0) {
      console.log('\n🎉 所有展品权限都是正确的!');
    } else {
      console.log('\n⚠️ 需要修复权限的展品:');
      exhibits.filter(e => e.userId !== 'temp-user').forEach(exhibit => {
        console.log(`- "${exhibit.title}" (userId: ${exhibit.userId})`);
      });
    }
    
  } catch (error) {
    console.error('❌ 检查失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

detailedCheck(); 