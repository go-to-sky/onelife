@echo off
cls
echo ====================================
echo       人生博物馆 - 紧急重启
echo ====================================
echo.

echo [1/5] 停止所有Node进程...
taskkill /F /IM node.exe 2>nul || echo 没有发现运行的Node进程

echo [2/5] 清理构建缓存...
if exist .next (
    rmdir /s /q .next
    echo ✅ 已清理 .next 缓存
) else (
    echo ✅ 无需清理缓存
)

echo [3/5] 重新生成 Prisma 客户端...
npx prisma generate
if errorlevel 1 (
    echo ❌ Prisma 生成失败，继续尝试启动...
) else (
    echo ✅ Prisma 客户端生成成功
)

echo [4/5] 启动开发服务器...
echo 正在启动...请稍候
start /B npm run dev

echo [5/5] 等待服务器启动...
timeout /t 5 /nobreak > nul

echo.
echo ====================================
echo ✅ 重启完成！
echo 🌐 请打开浏览器访问: http://localhost:3000
echo ====================================
echo.
echo 按任意键关闭此窗口...
pause > nul 