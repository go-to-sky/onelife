const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function completeFix() {
  try {
    console.log('🔍 开始彻底检查和修复所有展品权限...\n');
    
    // 1. 检查所有展品
    console.log('1. 检查所有展品：');
    const allExhibits = await prisma.exhibit.findMany({
      select: {
        id: true,
        title: true,
        userId: true,
        slug: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    console.log(`找到 ${allExhibits.length} 个展品：`);
    allExhibits.forEach((exhibit, index) => {
      const status = exhibit.userId === 'temp-user' ? '✅' : '❌';
      console.log(`${index + 1}. ${status} "${exhibit.title}" (slug: ${exhibit.slug}, userId: ${exhibit.userId})`);
    });
    
    // 2. 检查用户表
    console.log('\n2. 检查用户表：');
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true }
    });
    console.log('现有用户：', users);
    
    // 3. 确保temp-user存在
    console.log('\n3. 确保临时用户存在：');
    const tempUser = await prisma.user.upsert({
      where: { id: 'temp-user' },
      update: {
        name: '临时用户',
        email: 'temp@example.com'
      },
      create: {
        id: 'temp-user',
        name: '临时用户',
        email: 'temp@example.com'
      }
    });
    console.log('✅ 临时用户已准备:', tempUser);
    
    // 4. 修复所有展品的用户ID
    console.log('\n4. 修复所有展品的用户ID：');
    const wrongExhibits = allExhibits.filter(e => e.userId !== 'temp-user');
    
    if (wrongExhibits.length > 0) {
      console.log(`需要修复 ${wrongExhibits.length} 个展品：`);
      
      // 逐个更新每个展品
      for (const exhibit of wrongExhibits) {
        try {
          await prisma.exhibit.update({
            where: { id: exhibit.id },
            data: { userId: 'temp-user' }
          });
          console.log(`✅ 修复: "${exhibit.title}" (${exhibit.userId} → temp-user)`);
        } catch (error) {
          console.log(`❌ 修复失败: "${exhibit.title}" - ${error.message}`);
        }
      }
      
      // 再次批量更新确保没有遗漏
      const batchResult = await prisma.exhibit.updateMany({
        where: {},
        data: { userId: 'temp-user' }
      });
      console.log(`📦 批量更新了 ${batchResult.count} 个展品`);
      
    } else {
      console.log('✅ 所有展品权限已正确');
    }
    
    // 5. 最终验证
    console.log('\n5. 最终验证：');
    const finalExhibits = await prisma.exhibit.findMany({
      select: {
        id: true,
        title: true,
        userId: true,
        slug: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    console.log('最终状态：');
    let allCorrect = true;
    finalExhibits.forEach((exhibit, index) => {
      const isCorrect = exhibit.userId === 'temp-user';
      const status = isCorrect ? '✅' : '❌';
      console.log(`${index + 1}. ${status} "${exhibit.title}" (userId: ${exhibit.userId})`);
      if (!isCorrect) allCorrect = false;
    });
    
    console.log('\n' + '='.repeat(50));
    if (allCorrect) {
      console.log('🎉 所有展品权限已完全修复！');
      console.log('💡 现在您应该可以编辑任何展品了！');
    } else {
      console.log('⚠️ 仍有展品权限不正确，请检查上述输出');
    }
    console.log('='.repeat(50));
    
  } catch (error) {
    console.error('❌ 完整修复失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

completeFix(); 