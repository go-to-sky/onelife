const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixPermissions() {
  try {
    console.log('🔍 开始诊断权限问题...\n');
    
    // 1. 检查当前用户表
    console.log('1. 检查用户表：');
    const users = await prisma.user.findMany();
    console.log('现有用户：', users.map(u => ({ id: u.id, name: u.name, email: u.email })));
    
    // 2. 确保临时用户存在
    console.log('\n2. 创建/更新临时用户：');
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
    console.log('✅ 临时用户已准备：', { id: tempUser.id, name: tempUser.name });
    
    // 3. 检查展品的所有权
    console.log('\n3. 检查展品所有权：');
    const exhibits = await prisma.exhibit.findMany({
      select: {
        id: true,
        title: true,
        userId: true
      }
    });
    
    console.log('展品列表：');
    exhibits.forEach(exhibit => {
      const status = exhibit.userId === 'temp-user' ? '✅' : '❌';
      console.log(`${status} ${exhibit.title} (userId: ${exhibit.userId})`);
    });
    
    // 4. 修复所有展品的所有权
    const wrongOwnershipExhibits = exhibits.filter(e => e.userId !== 'temp-user');
    if (wrongOwnershipExhibits.length > 0) {
      console.log(`\n4. 修复 ${wrongOwnershipExhibits.length} 个展品的所有权：`);
      
      for (const exhibit of wrongOwnershipExhibits) {
        await prisma.exhibit.update({
          where: { id: exhibit.id },
          data: { userId: 'temp-user' }
        });
        console.log(`✅ 已修复: ${exhibit.title}`);
      }
    } else {
      console.log('\n4. ✅ 所有展品所有权已正确');
    }
    
    // 5. 最终验证
    console.log('\n5. 最终验证：');
    const finalExhibits = await prisma.exhibit.findMany({
      select: {
        id: true,
        title: true,
        userId: true
      }
    });
    
    const allCorrect = finalExhibits.every(e => e.userId === 'temp-user');
    if (allCorrect) {
      console.log('🎉 所有展品现在都归属于临时用户，权限问题已修复！');
    } else {
      console.log('⚠️ 仍有部分展品权限不正确');
      finalExhibits.forEach(exhibit => {
        const status = exhibit.userId === 'temp-user' ? '✅' : '❌';
        console.log(`${status} ${exhibit.title} (userId: ${exhibit.userId})`);
      });
    }
    
  } catch (error) {
    console.error('❌ 修复失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixPermissions(); 