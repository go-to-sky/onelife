const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function quickFix() {
  try {
    console.log('🔧 快速修复用户ID不匹配问题...');
    
    // 1. 显示当前所有展品的用户ID
    const exhibits = await prisma.exhibit.findMany({
      select: { id: true, title: true, userId: true }
    });
    
    console.log('当前展品状态：');
    exhibits.forEach(exhibit => {
      console.log(`- ${exhibit.title}: userId=${exhibit.userId}`);
    });
    
    // 2. 确保temp-user存在
    await prisma.user.upsert({
      where: { id: 'temp-user' },
      update: {},
      create: {
        id: 'temp-user',
        name: '临时用户',
        email: 'temp@example.com'
      }
    });
    
    // 3. 统一所有展品的userId为temp-user
    const updateResult = await prisma.exhibit.updateMany({
      where: {},
      data: { userId: 'temp-user' }
    });
    
    console.log(`✅ 已更新 ${updateResult.count} 个展品的用户ID为 temp-user`);
    
    // 4. 验证结果
    const verifyExhibits = await prisma.exhibit.findMany({
      select: { id: true, title: true, userId: true }
    });
    
    console.log('\n验证结果：');
    const allCorrect = verifyExhibits.every(e => e.userId === 'temp-user');
    verifyExhibits.forEach(exhibit => {
      const status = exhibit.userId === 'temp-user' ? '✅' : '❌';
      console.log(`${status} ${exhibit.title}: userId=${exhibit.userId}`);
    });
    
    if (allCorrect) {
      console.log('\n🎉 用户ID已统一，现在应该可以编辑展品了！');
    } else {
      console.log('\n⚠️ 仍有问题，请检查');
    }
    
  } catch (error) {
    console.error('❌ 修复失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

quickFix(); 