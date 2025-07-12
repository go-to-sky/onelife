const fs = require('fs');
const path = require('path');

console.log('🚨 人生博物馆 - 紧急修复工具');
console.log('================================\n');

// 检查关键文件
const criticalFiles = [
  'src/app/page.tsx',
  'src/app/layout.tsx', 
  'src/trpc/server.ts',
  'src/trpc/react.tsx',
  'src/server/db.ts',
  'prisma/schema.prisma'
];

console.log('📋 检查关键文件...');
criticalFiles.forEach(file => {
  if (fs.existsSync(file)) {
    const stats = fs.statSync(file);
    console.log(`✅ ${file} (${stats.size} bytes)`);
  } else {
    console.log(`❌ ${file} - 文件不存在!`);
  }
});

// 检查 node_modules
console.log('\n📦 检查依赖...');
if (fs.existsSync('node_modules')) {
  console.log('✅ node_modules 存在');
} else {
  console.log('❌ node_modules 不存在 - 需要运行 npm install');
}

// 检查 .env
console.log('\n🔧 检查环境配置...');
if (fs.existsSync('.env')) {
  console.log('✅ .env 文件存在');
} else if (fs.existsSync('.env.local')) {
  console.log('✅ .env.local 文件存在');
} else {
  console.log('⚠️  没有找到环境变量文件');
}

// 检查端口
console.log('\n🌐 检查端口 3000...');
const net = require('net');
const server = net.createServer();

server.listen(3000, (err) => {
  if (err) {
    console.log('❌ 端口 3000 被占用');
  } else {
    console.log('✅ 端口 3000 可用');
    server.close();
  }
});

console.log('\n💡 修复建议:');
console.log('1. 双击运行 restart.bat 重启项目');
console.log('2. 或者手动运行: npm install && npx prisma generate && npm run dev');
console.log('3. 如果还有问题，请检查数据库连接');

console.log('\n✨ 修复完成!'); 