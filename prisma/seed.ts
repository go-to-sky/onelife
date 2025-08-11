import { PrismaClient, Visibility } from '@prisma/client';

const prisma = new PrismaClient();

const categories = [
  {
    name: '阴影馆藏',
    slug: 'shadow-collection',
    color: '#6b7280',
    icon: '🌑',
  },
  {
    name: '平行时空',
    slug: 'alternate-reality',
    color: '#8b5cf6',
    icon: '🌌',
  },
  {
    name: '母题地图',
    slug: 'recurring-motifs',
    color: '#059669',
    icon: '🗺️',
  },
  {
    name: '情绪肖像',
    slug: 'emotion-portraits',
    color: '#dc2626',
    icon: '🎭',
  },
  {
    name: '数字考古',
    slug: 'digital-archaeology',
    color: '#2563eb',
    icon: '💻',
  },
  {
    name: '身体编年史',
    slug: 'body-chronicle',
    color: '#7c3aed',
    icon: '💪',
  },
  {
    name: '梦境档案',
    slug: 'dream-archives',
    color: '#06b6d4',
    icon: '💭',
  },
  {
    name: '人生账本',
    slug: 'life-ledger',
    color: '#ea580c',
    icon: '💰',
  },
  {
    name: '时间切片',
    slug: 'temporal-slices',
    color: '#65a30d',
    icon: '⏰',
  },
  {
    name: '语言收藏',
    slug: 'lexicon-collection',
    color: '#be185d',
    icon: '📚',
  },
  {
    name: '娱乐文化',
    slug: 'entertainment-culture',
    color: '#f59e0b',
    icon: '🎬',
  },
];

async function main() {
  console.log('正在初始化数据库...');

  // 创建分类
  const createdCategories = [];
  for (const category of categories) {
    const created = await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    });
    createdCategories.push(created);
  }

  console.log('分类创建完成');

  // 创建示例用户
  const user = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: { isAdmin: true },
    create: {
      id: 'temp-user-id',
      email: 'demo@example.com',
      name: '演示用户',
      isAdmin: true,
    },
  });

  console.log('用户创建完成');

  // 创建示例展品
  const exhibits = [
    {
      title: '第一次独自旅行',
      slug: 'first-solo-travel',
      description: '记录我第一次独自背包旅行的经历，从紧张到兴奋，从迷茫到清晰。',
      content: `# 第一次独自旅行

## 出发前的忐忑

那是2023年的夏天，我终于下定决心要独自踏上旅程。背包、地图、还有满心的不安...

## 路上的收获

- 学会了独立解决问题
- 遇到了很多有趣的人
- 发现了内心的勇气

> "旅行不是逃避现实，而是为了不让现实消磨了梦想。"

这次旅行让我明白，最好的风景往往在路上，而不是终点。`,
             visibility: Visibility.PUBLIC,
       emotionScore: 8,
       categoryId: createdCategories.find(c => c.slug === 'temporal-slices')?.id!,
      userId: user.id,
    },
    {
      title: '妈妈的手写食谱',
      slug: 'mothers-handwritten-recipes',
      description: '整理妈妈留下的手写食谱，每一道菜都承载着家的味道和爱的回忆。',
      content: `# 妈妈的手写食谱

## 发现

在清理旧物时，我发现了妈妈用铅笔写在发黄纸张上的食谱。字迹虽然模糊，但每一笔都充满了爱。

## 传承

- 红烧肉：糖色要炒得恰到好处
- 蒸蛋羹：水和蛋的比例是 1.5:1
- 小馄饨：包的时候要有耐心

## 感悟

做菜不只是填饱肚子，更是传递情感的方式。每次按照妈妈的食谱做菜，就像她还在身边一样。`,
      visibility: Visibility.PUBLIC,
      emotionScore: 9,
      categoryId: createdCategories.find(c => c.slug === 'body-chronicle')?.id,
      userId: user.id,
    },
    {
      title: '深夜的编程时光',
      slug: 'late-night-coding-sessions',
      description: '那些在深夜独自编程的时光，bug与灵感并存，孤独与成就感交织。',
      content: `# 深夜的编程时光

## 夜猫子程序员

凌晨2点，整个世界都安静了，只有键盘敲击声和风扇嗡嗡声陪伴着我。

## 代码的诗意

\`\`\`javascript
function life() {
  while (true) {
    dream();
    code();
    debug();
    learn();
  }
}
\`\`\`

## 那些Bug教会我的事

- 耐心：有些问题需要时间才能找到答案
- 细心：一个分号可能改变一切
- 坚持：99个失败后的第100次尝试可能就是成功

深夜编程虽然孤独，但那种创造的快感是无可替代的。`,
      visibility: Visibility.PUBLIC,
      emotionScore: 7,
      categoryId: createdCategories.find(c => c.slug === 'digital-archaeology')?.id,
      userId: user.id,
    },
    {
      title: '梦见了童年的夏天',
      slug: 'dreaming-of-childhood-summer',
      description: '一个关于蝉鸣、冰棍和无忧无虑时光的梦境记录。',
      content: `# 梦见了童年的夏天

## 梦境片段

昨夜梦回童年，那个没有手机和网络的夏天...

### 场景一：老槐树下
蝉鸣声此起彼伏，我和小伙伴们在树荫下捉迷藏。

### 场景二：小卖部
5毛钱一根的冰棍是夏天最大的奢侈。

### 场景三：奶奶的蒲扇
躺在竹席上，奶奶轻摇蒲扇，讲着古老的故事。

## 醒来后的思考

那些简单的快乐，现在却成了最珍贵的回忆。时间真是个魔法师，把平凡变成了珍宝。`,
      visibility: Visibility.PUBLIC,
      emotionScore: 8,
      categoryId: createdCategories.find(c => c.slug === 'dream-archives')?.id,
      userId: user.id,
    },
    {
      title: '学会说"不"的那一天',
      slug: 'learning-to-say-no',
      description: '记录我第一次对不合理要求说"不"的经历，以及随之而来的成长。',
      content: `# 学会说"不"的那一天

## 背景

一直以来，我都是那个什么都答应的"好人"，直到那天...

## 转折点

同事又一次把他的工作推给我，理由是"你比较擅长"。这次，我终于说出了那个字：**"不"**。

## 内心的挣扎

说出口的瞬间，我感到：
- 内疚：是不是太自私了？
- 恐惧：会不会影响人际关系？
- 解脱：终于为自己发声了

## 收获

- 学会了设立边界
- 明白了自己的时间同样宝贵
- 发现真正的朋友会理解和尊重你的选择

**说"不"不是自私，而是对自己负责。**`,
      visibility: Visibility.PUBLIC,
      emotionScore: 6,
      categoryId: createdCategories.find(c => c.slug === 'emotion-portraits')?.id,
      userId: user.id,
    }
  ];

  for (const exhibit of exhibits) {
    if (!exhibit.categoryId) {
      console.warn(`跳过展品 ${exhibit.title}: 找不到对应的分类`);
      continue;
    }
    
    await prisma.exhibit.upsert({
      where: { slug: exhibit.slug },
      update: {},
      create: {
        ...exhibit,
        categoryId: exhibit.categoryId, // 确保 categoryId 不是 undefined
      },
    });
  }

  console.log('示例展品创建完成');

  // 创建一些标签
  const tags = ['成长', '回忆', '旅行', '家庭', '技术', '梦境', '职场'];
  for (const tagName of tags) {
    await prisma.tag.upsert({
      where: { name: tagName },
      update: {},
      create: {
        name: tagName,
        slug: tagName.toLowerCase(),
      },
    });
  }

  console.log('标签创建完成');
  console.log('数据库初始化完成！');
}

main()
  .catch((e) => {
    console.error('数据库初始化失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 

// 数据迁移：将旧的任务分类批量更新为新分类
async function migrateTaskCategory() {
  await prisma.task.updateMany({
    where: { category: 'STUDY' as any },
    data: { category: 'STUDY_LONG_TERM' as any },
  });
  await prisma.task.updateMany({
    where: { category: 'DAILY_LIFE' as any },
    data: { category: 'LIFE_LONG_TERM' as any },
  });
}

migrateTaskCategory().then(() => console.log('任务分类数据迁移完成')).catch(console.error); 