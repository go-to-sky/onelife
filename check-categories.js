const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkCategories() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' }
    });
    
    console.log('数据库中的分类：');
    categories.forEach(cat => {
      console.log(`- ${cat.name} (${cat.slug}) ${cat.icon}`);
    });
    
    const entertainmentCategory = categories.find(cat => cat.slug === 'entertainment-culture');
    if (entertainmentCategory) {
      console.log('\n✅ 娱乐文化分类已存在！');
    } else {
      console.log('\n❌ 娱乐文化分类不存在，需要添加。');
    }
  } catch (error) {
    console.error('查询失败：', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCategories(); 