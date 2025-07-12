@echo off
title 人生博物馆 - 紧急启动

echo.
echo ========================================
echo           人生博物馆 紧急启动
echo ========================================
echo.

echo [步骤 1] 检查当前目录...
echo 当前目录: %CD%
dir package.json >nul 2>&1
if errorlevel 1 (
    echo ❌ 错误：未找到 package.json
    echo 请确保在项目根目录运行此文件
    pause
    exit /b 1
)
echo ✅ 项目目录确认

echo.
echo [步骤 2] 终止现有进程...
taskkill /F /IM node.exe >nul 2>&1
echo ✅ 已清理进程

echo.
echo [步骤 3] 清理缓存...
if exist ".next" (
    rmdir /s /q ".next" >nul 2>&1
    echo ✅ 已清理 .next 缓存
) else (
    echo ✅ 无缓存需要清理
)

echo.
echo [步骤 4] 启动服务器...
echo 正在启动 Next.js 开发服务器...
echo 请等待服务器完全启动（约30-60秒）
echo.

start /B cmd /c "npm run dev"

echo ✅ 服务器启动命令已执行
echo.
echo ========================================
echo  🌐 请在1分钟后访问: http://localhost:3000
echo ========================================
echo.
echo 如果网站仍无法访问，请：
echo 1. 等待更长时间（首次启动较慢）
echo 2. 检查终端窗口中的错误信息
echo 3. 重新运行此文件
echo.

pause 