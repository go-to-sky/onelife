const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verify() {
  try {
    const exhibits = await prisma.exhibit.findMany({
      select: { title: true, userId: true }
    });
    
    console.log('所有展品状态:');
    let allCorrect = true;
    
    exhibits.forEach(exhibit => {
      const isCorrect = exhibit.userId === 'temp-user';
      const status = isCorrect ? '✅' : '❌';
      console.log(status + ' ' + exhibit.title + ': ' + exhibit.userId);
      if (!isCorrect) allCorrect = false;
    });
    
    console.log('\n结果: ' + (allCorrect ? '🎉 所有展品权限正确!' : '⚠️ 仍有问题'));
    
  } catch (error) {
    console.error('验证失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verify(); 