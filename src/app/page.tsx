"use client";

import { useState, useEffect } from "react";
import { api } from "~/trpc/react";
import Link from "next/link";
import Image from "next/image";

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: "PENDING" | "COMPLETED";
  category: "STUDY_LONG_TERM" | "STUDY_SHORT_TERM" | "LIFE_LONG_TERM" | "LIFE_SHORT_TERM";
  taskDate: Date;
  completedAt: Date | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Exhibit {
  id: string;
  title: string;
  description: string | null;
  content: string;
  mood: string;
  location: string | null;
  weather: string | null;
  imageUrl: string | null;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
  category: {
    id: string;
    name: string;
    slug: string;
    color: string;
    icon: string | null;
  };
  payload?: {
    specialTags?: string[];
  };
}

export default function HomePage() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [mounted, setMounted] = useState(false);
  
  // 状态管理
  const [taskCategory, setTaskCategory] = useState<"STUDY_LONG_TERM" | "STUDY_SHORT_TERM" | "LIFE_LONG_TERM" | "LIFE_SHORT_TERM">("LIFE_LONG_TERM");
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [isAddingTask, setIsAddingTask] = useState(false);
  
  // 历史查看功能状态
  const [showHistory, setShowHistory] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showStatistics, setShowStatistics] = useState(false);
  const [statisticsType, setStatisticsType] = useState<"week" | "month" | "last90days" | "year" | "custom">("week");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");

  const { data: exhibitData } = api.exhibit.getAll.useQuery({});
  const { data: categories = [] } = api.category.getAll.useQuery();
  
  // 分别获取四种类型的任务
  const { data: studyLongTasks = [] } = api.task.getToday.useQuery({ category: "STUDY_LONG_TERM" });
  const { data: studyShortTasks = [] } = api.task.getToday.useQuery({ category: "STUDY_SHORT_TERM" });
  const { data: lifeLongTasks = [] } = api.task.getToday.useQuery({ category: "LIFE_LONG_TERM" });
  const { data: lifeShortTasks = [] } = api.task.getToday.useQuery({ category: "LIFE_SHORT_TERM" });

  const exhibits = exhibitData?.items || [];

  // 任务操作
  const createTask = api.task.create.useMutation({
    onSuccess: () => {
      setNewTaskTitle("");
      setIsAddingTask(false);
    },
  });

  const toggleStatus = api.task.toggleStatus.useMutation();
  const deleteTask = api.task.delete.useMutation();
  
  // 历史任务查询
  const { data: historyTasks = [] } = api.task.getByDate.useQuery(
    { date: selectedDate },
    { enabled: showHistory }
  );
  
  // 统计查询
  const isCustomRangeValid = customStartDate && customEndDate && customStartDate <= customEndDate;
  const shouldEnableStatistics = showStatistics && (statisticsType !== "custom" || isCustomRangeValid);
  
  const { data: statisticsData } = api.task.getStatistics.useQuery(
    {
      type: statisticsType,
      startDate: statisticsType === "custom" ? customStartDate : undefined,
      endDate: statisticsType === "custom" ? customEndDate : undefined,
    },
    { enabled: Boolean(shouldEnableStatistics) }
  );

  // 时间更新
  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const today = new Date().toISOString().split('T')[0];
  
  // 学习类任务分组
  const studyLongPending = studyLongTasks.filter((task: any) => task.status === "PENDING");
  const studyLongCompleted = studyLongTasks.filter((task: any) => task.status === "COMPLETED");
  const studyShortPending = studyShortTasks.filter((task: any) => task.status === "PENDING");
  const studyShortCompleted = studyShortTasks.filter((task: any) => task.status === "COMPLETED");
  
  // 生活类任务分组  
  const lifeLongPending = lifeLongTasks.filter((task: any) => task.status === "PENDING");
  const lifeLongCompleted = lifeLongTasks.filter((task: any) => task.status === "COMPLETED");
  const lifeShortPending = lifeShortTasks.filter((task: any) => task.status === "PENDING");
  const lifeShortCompleted = lifeShortTasks.filter((task: any) => task.status === "COMPLETED");

  const handleCreateTask = () => {
    if (!newTaskTitle.trim()) return;

    createTask.mutate({
      title: newTaskTitle.trim(),
      taskDate: today,
      status: "PENDING",
      category: taskCategory,
    });
    
    setNewTaskTitle("");
    setIsAddingTask(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          一个人的100年
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          这里收藏着生命中每一个珍贵的瞬间，每一份感动，每一次成长。
          让我们一起探索人生的美好与意义。
        </p>
      </div>

      {/* 当前时间 */}
      <div className="text-center mb-8">
        <div className="inline-block bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg px-6 py-4 border border-blue-100">
          <div className="text-2xl font-bold text-gray-800 mb-1">
            {mounted ? currentTime.toLocaleTimeString('zh-CN', { 
              hour12: false,
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            }) : '00:00:00'}
          </div>
          <div className="text-sm text-gray-600">
            {mounted ? currentTime.toLocaleDateString('zh-CN', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              weekday: 'long'
            }) : ''}
          </div>
        </div>
      </div>

      {/* 任务管理区域 */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">今日任务</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
            >
              历史任务查看
            </button>
            <button
              onClick={() => setShowStatistics(!showStatistics)}
              className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium"
            >
              任务统计
            </button>
          </div>
        </div>

        {/* 历史任务查看面板 */}
        {showHistory && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-4 mb-4">
              <h3 className="text-lg font-semibold text-blue-900">历史任务查看</h3>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            {historyTasks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {["STUDY_LONG_TERM", "STUDY_SHORT_TERM", "LIFE_LONG_TERM", "LIFE_SHORT_TERM"].map((category) => {
                  const categoryTasks = historyTasks.filter((task: any) => task.category === category);
                  const categoryNames = {
                    "STUDY_LONG_TERM": "学习-长期",
                    "STUDY_SHORT_TERM": "学习-短期", 
                    "LIFE_LONG_TERM": "生活-长期",
                    "LIFE_SHORT_TERM": "生活-短期"
                  };
                  
                  return (
                    <div key={category} className="bg-white p-3 rounded-lg border">
                      <h4 className="font-semibold text-sm mb-2 text-gray-800">
                        {categoryNames[category as keyof typeof categoryNames]} ({categoryTasks.length})
                      </h4>
                      <div className="space-y-1">
                        {categoryTasks.map((task: any) => (
                          <div key={task.id} className="text-xs p-2 rounded bg-gray-50">
                            <div className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${task.status === 'COMPLETED' ? 'bg-green-500' : 'bg-yellow-400'}`}></span>
                              <span className={task.status === 'COMPLETED' ? 'line-through text-gray-500' : 'text-gray-800'}>
                                {task.title}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-blue-700 text-sm">该日期没有任务记录</p>
            )}
          </div>
        )}

        {/* 任务统计面板 */}
        {showStatistics && (
          <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-4 mb-4">
              <h3 className="text-lg font-semibold text-green-900">任务统计</h3>
              <select
                value={statisticsType}
                onChange={(e) => setStatisticsType(e.target.value as any)}
                className="px-3 py-2 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="week">本周</option>
                <option value="month">本月</option>
                <option value="last90days">最近90天</option>
                <option value="year">本年</option>
                <option value="custom">自定义范围</option>
              </select>
              
              {statisticsType === "custom" && (
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="px-3 py-2 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="开始日期"
                  />
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="px-3 py-2 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="结束日期"
                  />
                </div>
              )}
            </div>
            
            {statisticsData ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(statisticsData).map(([category, stats]: [string, any]) => {
                  const categoryNames = {
                    "STUDY_LONG_TERM": "学习-长期",
                    "STUDY_SHORT_TERM": "学习-短期", 
                    "LIFE_LONG_TERM": "生活-长期",
                    "LIFE_SHORT_TERM": "生活-短期"
                  };
                  
                  return (
                    <div key={category} className="bg-white p-4 rounded-lg border">
                      <h4 className="font-semibold text-sm mb-3 text-gray-800">
                        {categoryNames[category as keyof typeof categoryNames]}
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">总任务:</span>
                          <span className="font-medium">{stats.total}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-green-600">已完成:</span>
                          <span className="font-medium text-green-700">{stats.completed}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-yellow-600">待完成:</span>
                          <span className="font-medium text-yellow-700">{stats.pending}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-blue-600">完成率:</span>
                          <span className="font-medium text-blue-700">
                            {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-green-700 text-sm">
                {statisticsType === "custom" && !isCustomRangeValid 
                  ? "请选择有效的日期范围" 
                  : "正在加载统计数据..."}
              </p>
            )}
          </div>
        )}

        {/* 任务列表 - 采用网格布局 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* 学习-长期任务 */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-sm border-2 border-blue-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <h3 className="text-lg font-semibold text-blue-900">学习-长期任务</h3>
              </div>
              <button
                onClick={() => {
                  setTaskCategory("STUDY_LONG_TERM");
                  setIsAddingTask(true);
                }}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium bg-blue-100 px-3 py-1 rounded-full hover:bg-blue-200 transition-colors"
              >
                + 添加
              </button>
            </div>
            
            {/* 添加任务表单 */}
            {isAddingTask && taskCategory === "STUDY_LONG_TERM" && (
              <div className="mb-4 p-3 bg-blue-100 rounded-lg border border-blue-300">
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="输入任务标题..."
                  className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                  onKeyPress={(e) => e.key === 'Enter' && handleCreateTask()}
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleCreateTask}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                    disabled={createTask.isPending}
                  >
                    {createTask.isPending ? '添加中...' : '添加'}
                  </button>
                  <button
                    onClick={() => setIsAddingTask(false)}
                    className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400"
                  >
                    取消
                  </button>
                </div>
              </div>
            )}
            
            {/* 待完成任务 */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-blue-800 mb-2 flex items-center gap-2">
                <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                待完成 ({studyLongPending.length})
              </h4>
              <div className="space-y-2">
                {studyLongPending.map((task: any) => (
                  <div key={task.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-400 shadow-sm">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleStatus.mutate({ id: task.id })}
                        className="w-5 h-5 border-2 border-yellow-500 rounded-full hover:bg-yellow-400 transition-colors flex items-center justify-center"
                      />
                      <span className="text-sm text-gray-800 font-medium">{task.title}</span>
                    </div>
                    <button
                      onClick={() => deleteTask.mutate({ id: task.id })}
                      className="text-red-500 hover:text-red-700 text-xs bg-red-50 px-2 py-1 rounded hover:bg-red-100 transition-colors"
                    >
                      删除
                    </button>
                  </div>
                ))}
              </div>
            </div>
            
            {/* 已完成任务 */}
            <div>
              <h4 className="text-sm font-medium text-blue-800 mb-2 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                已完成 ({studyLongCompleted.length})
              </h4>
              <div className="space-y-2">
                {studyLongCompleted.map((task: any) => (
                  <div key={task.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border-l-4 border-green-500 shadow-sm">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleStatus.mutate({ id: task.id })}
                        className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors"
                      >
                        <span className="text-white text-xs">✓</span>
                      </button>
                      <span className="text-sm text-gray-600 line-through">{task.title}</span>
                    </div>
                    <button
                      onClick={() => deleteTask.mutate({ id: task.id })}
                      className="text-red-500 hover:text-red-700 text-xs bg-red-50 px-2 py-1 rounded hover:bg-red-100 transition-colors"
                    >
                      删除
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 学习-短期任务 */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg shadow-sm border-2 border-purple-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <h3 className="text-lg font-semibold text-purple-900">学习-短期任务</h3>
              </div>
              <button
                onClick={() => {
                  setTaskCategory("STUDY_SHORT_TERM");
                  setIsAddingTask(true);
                }}
                className="text-purple-600 hover:text-purple-800 text-sm font-medium bg-purple-100 px-3 py-1 rounded-full hover:bg-purple-200 transition-colors"
              >
                + 添加
              </button>
            </div>
            
            {/* 添加任务表单 */}
            {isAddingTask && taskCategory === "STUDY_SHORT_TERM" && (
              <div className="mb-4 p-3 bg-purple-100 rounded-lg border border-purple-300">
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="输入任务标题..."
                  className="w-full px-3 py-2 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 mb-2"
                  onKeyPress={(e) => e.key === 'Enter' && handleCreateTask()}
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleCreateTask}
                    className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700"
                    disabled={createTask.isPending}
                  >
                    {createTask.isPending ? '添加中...' : '添加'}
                  </button>
                  <button
                    onClick={() => setIsAddingTask(false)}
                    className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400"
                  >
                    取消
                  </button>
                </div>
              </div>
            )}
            
            {/* 待完成任务 */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-purple-800 mb-2 flex items-center gap-2">
                <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                待完成 ({studyShortPending.length})
              </h4>
              <div className="space-y-2">
                {studyShortPending.map((task: any) => (
                  <div key={task.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-400 shadow-sm">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleStatus.mutate({ id: task.id })}
                        className="w-5 h-5 border-2 border-yellow-500 rounded-full hover:bg-yellow-400 transition-colors flex items-center justify-center"
                      />
                      <span className="text-sm text-gray-800 font-medium">{task.title}</span>
                    </div>
                    <button
                      onClick={() => deleteTask.mutate({ id: task.id })}
                      className="text-red-500 hover:text-red-700 text-xs bg-red-50 px-2 py-1 rounded hover:bg-red-100 transition-colors"
                    >
                      删除
                    </button>
                  </div>
                ))}
              </div>
            </div>
            
            {/* 已完成任务 */}
            <div>
              <h4 className="text-sm font-medium text-purple-800 mb-2 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                已完成 ({studyShortCompleted.length})
              </h4>
              <div className="space-y-2">
                {studyShortCompleted.map((task: any) => (
                  <div key={task.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border-l-4 border-green-500 shadow-sm">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleStatus.mutate({ id: task.id })}
                        className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors"
                      >
                        <span className="text-white text-xs">✓</span>
                      </button>
                      <span className="text-sm text-gray-600 line-through">{task.title}</span>
                    </div>
                    <button
                      onClick={() => deleteTask.mutate({ id: task.id })}
                      className="text-red-500 hover:text-red-700 text-xs bg-red-50 px-2 py-1 rounded hover:bg-red-100 transition-colors"
                    >
                      删除
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 生活-长期任务 */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg shadow-sm border-2 border-green-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <h3 className="text-lg font-semibold text-green-900">生活-长期任务</h3>
              </div>
              <button
                onClick={() => {
                  setTaskCategory("LIFE_LONG_TERM");
                  setIsAddingTask(true);
                }}
                className="text-green-600 hover:text-green-800 text-sm font-medium bg-green-100 px-3 py-1 rounded-full hover:bg-green-200 transition-colors"
              >
                + 添加
              </button>
            </div>
            
            {/* 添加任务表单 */}
            {isAddingTask && taskCategory === "LIFE_LONG_TERM" && (
              <div className="mb-4 p-3 bg-green-100 rounded-lg border border-green-300">
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="输入任务标题..."
                  className="w-full px-3 py-2 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 mb-2"
                  onKeyPress={(e) => e.key === 'Enter' && handleCreateTask()}
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleCreateTask}
                    className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                    disabled={createTask.isPending}
                  >
                    {createTask.isPending ? '添加中...' : '添加'}
                  </button>
                  <button
                    onClick={() => setIsAddingTask(false)}
                    className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400"
                  >
                    取消
                  </button>
                </div>
              </div>
            )}
            
            {/* 待完成任务 */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-green-800 mb-2 flex items-center gap-2">
                <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                待完成 ({lifeLongPending.length})
              </h4>
              <div className="space-y-2">
                {lifeLongPending.map((task: any) => (
                  <div key={task.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-400 shadow-sm">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleStatus.mutate({ id: task.id })}
                        className="w-5 h-5 border-2 border-yellow-500 rounded-full hover:bg-yellow-400 transition-colors flex items-center justify-center"
                      />
                      <span className="text-sm text-gray-800 font-medium">{task.title}</span>
                    </div>
                    <button
                      onClick={() => deleteTask.mutate({ id: task.id })}
                      className="text-red-500 hover:text-red-700 text-xs bg-red-50 px-2 py-1 rounded hover:bg-red-100 transition-colors"
                    >
                      删除
                    </button>
                  </div>
                ))}
              </div>
            </div>
            
            {/* 已完成任务 */}
            <div>
              <h4 className="text-sm font-medium text-green-800 mb-2 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                已完成 ({lifeLongCompleted.length})
              </h4>
              <div className="space-y-2">
                {lifeLongCompleted.map((task: any) => (
                  <div key={task.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border-l-4 border-green-500 shadow-sm">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleStatus.mutate({ id: task.id })}
                        className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors"
                      >
                        <span className="text-white text-xs">✓</span>
                      </button>
                      <span className="text-sm text-gray-600 line-through">{task.title}</span>
                    </div>
                    <button
                      onClick={() => deleteTask.mutate({ id: task.id })}
                      className="text-red-500 hover:text-red-700 text-xs bg-red-50 px-2 py-1 rounded hover:bg-red-100 transition-colors"
                    >
                      删除
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 生活-短期任务 */}
          <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg shadow-sm border-2 border-orange-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <h3 className="text-lg font-semibold text-orange-900">生活-短期任务</h3>
              </div>
              <button
                onClick={() => {
                  setTaskCategory("LIFE_SHORT_TERM");
                  setIsAddingTask(true);
                }}
                className="text-orange-600 hover:text-orange-800 text-sm font-medium bg-orange-100 px-3 py-1 rounded-full hover:bg-orange-200 transition-colors"
              >
                + 添加
              </button>
            </div>
            
            {/* 添加任务表单 */}
            {isAddingTask && taskCategory === "LIFE_SHORT_TERM" && (
              <div className="mb-4 p-3 bg-orange-100 rounded-lg border border-orange-300">
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="输入任务标题..."
                  className="w-full px-3 py-2 border border-orange-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 mb-2"
                  onKeyPress={(e) => e.key === 'Enter' && handleCreateTask()}
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleCreateTask}
                    className="px-3 py-1 bg-orange-600 text-white rounded text-sm hover:bg-orange-700"
                    disabled={createTask.isPending}
                  >
                    {createTask.isPending ? '添加中...' : '添加'}
                  </button>
                  <button
                    onClick={() => setIsAddingTask(false)}
                    className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400"
                  >
                    取消
                  </button>
                </div>
              </div>
            )}
            
            {/* 待完成任务 */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-orange-800 mb-2 flex items-center gap-2">
                <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                待完成 ({lifeShortPending.length})
              </h4>
              <div className="space-y-2">
                {lifeShortPending.map((task: any) => (
                  <div key={task.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-400 shadow-sm">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleStatus.mutate({ id: task.id })}
                        className="w-5 h-5 border-2 border-yellow-500 rounded-full hover:bg-yellow-400 transition-colors flex items-center justify-center"
                      />
                      <span className="text-sm text-gray-800 font-medium">{task.title}</span>
                    </div>
                    <button
                      onClick={() => deleteTask.mutate({ id: task.id })}
                      className="text-red-500 hover:text-red-700 text-xs bg-red-50 px-2 py-1 rounded hover:bg-red-100 transition-colors"
                    >
                      删除
                    </button>
                  </div>
                ))}
              </div>
            </div>
            
            {/* 已完成任务 */}
            <div>
              <h4 className="text-sm font-medium text-orange-800 mb-2 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                已完成 ({lifeShortCompleted.length})
              </h4>
              <div className="space-y-2">
                {lifeShortCompleted.map((task: any) => (
                  <div key={task.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border-l-4 border-green-500 shadow-sm">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleStatus.mutate({ id: task.id })}
                        className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors"
                      >
                        <span className="text-white text-xs">✓</span>
                      </button>
                      <span className="text-sm text-gray-600 line-through">{task.title}</span>
                    </div>
                    <button
                      onClick={() => deleteTask.mutate({ id: task.id })}
                      className="text-red-500 hover:text-red-700 text-xs bg-red-50 px-2 py-1 rounded hover:bg-red-100 transition-colors"
                    >
                      删除
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Categories */}
      {categories.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">分类浏览</h2>
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/?category=${category.slug}`}
                className="category-badge"
                style={{ backgroundColor: category.color + "20", color: category.color }}
              >
                {category.icon && <span className="mr-1">{category.icon}</span>}
                {category.name}
                <span className="ml-1 text-xs opacity-75">
                  ({category._count.exhibits})
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Life Record Categories */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">人生记录分类</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* 大事记 / 人生里程碑 */}
          <div className="museum-card p-6 hover:scale-105 transition-transform duration-200 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
            <div className="text-center mb-4">
              <div className="text-4xl mb-2">🏆</div>
              <h3 className="text-lg font-semibold text-amber-800">
                大事记 / 人生里程碑
              </h3>
              <p className="text-xs text-amber-600 uppercase tracking-wide font-medium">
                Milestones
              </p>
            </div>
            <p className="text-sm text-amber-700 mb-4 leading-relaxed">
              对人生有重大影响或转折意义的事件。毕业、第一份工作、升职、结婚、生子、买房、创业等关键节点。
            </p>
            <div className="text-xs text-amber-600 bg-amber-100 rounded-lg p-2">
              <strong>记录目的：</strong>构建个人生命史，回顾人生的关键节点和成长轨迹。可以每年年底整理一次，形成年度大事记。
            </div>
            <Link 
              href="/admin?category=milestones"
              className="inline-block w-full text-center mt-4 px-3 py-2 bg-amber-200 text-amber-800 rounded-md text-sm font-medium hover:bg-amber-300 transition-colors"
            >
              记录里程碑
            </Link>
          </div>

          {/* 生活琐事 / 日常小确幸 */}
          <div className="museum-card p-6 hover:scale-105 transition-transform duration-200 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <div className="text-center mb-4">
              <div className="text-4xl mb-2">🌸</div>
              <h3 className="text-lg font-semibold text-green-800">
                生活琐事 / 日常小确幸
              </h3>
              <p className="text-xs text-green-600 uppercase tracking-wide font-medium">
                Daily Trifles & Small Joys
              </p>
            </div>
            <p className="text-sm text-green-700 mb-4 leading-relaxed">
              日常生活中那些微小但确切的幸福瞬间。美食、晚霞、好书、愉快长谈、午后阳光、宠物陪伴等。
            </p>
            <div className="text-xs text-green-600 bg-green-100 rounded-lg p-2">
              <strong>记录目的：</strong>培养感恩和发现美的能力，提升幸福感，对抗生活的平淡和焦虑。
            </div>
            <Link 
              href="/admin?category=daily-joys"
              className="inline-block w-full text-center mt-4 px-3 py-2 bg-green-200 text-green-800 rounded-md text-sm font-medium hover:bg-green-300 transition-colors"
            >
              记录小确幸
            </Link>
          </div>

          {/* 挑战与成长 */}
          <div className="museum-card p-6 hover:scale-105 transition-transform duration-200 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <div className="text-center mb-4">
              <div className="text-4xl mb-2">💪</div>
              <h3 className="text-lg font-semibold text-blue-800">
                挑战与成长
              </h3>
              <p className="text-xs text-blue-600 uppercase tracking-wide font-medium">
                Challenges & Growth
              </p>
            </div>
            <p className="text-sm text-blue-700 mb-4 leading-relaxed">
              遇到的困难、犯下的错误、克服的恐惧以及从中得到的经验和教训。失败项目、争执反思、新技能学习等。
            </p>
            <div className="text-xs text-blue-600 bg-blue-100 rounded-lg p-2">
              <strong>记录目的：</strong>复盘和反思，将挫折转化为成长的养分，看到自己的坚韧和进步。
            </div>
            <Link 
              href="/admin?category=growth-challenges"
              className="inline-block w-full text-center mt-4 px-3 py-2 bg-blue-200 text-blue-800 rounded-md text-sm font-medium hover:bg-blue-300 transition-colors"
            >
              记录成长
            </Link>
          </div>

          {/* 探索空间 */}
          <div className="museum-card p-6 hover:scale-105 transition-transform duration-200 bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
            <div className="text-center mb-4">
              <div className="text-4xl mb-2">🎯</div>
              <h3 className="text-lg font-semibold text-purple-800">
                探索空间
              </h3>
              <p className="text-xs text-purple-600 uppercase tracking-wide font-medium">
                To Be Defined
              </p>
            </div>
            <p className="text-sm text-purple-700 mb-4 leading-relaxed">
              等待发现的人生新维度。也许是梦境记录、创意灵感、人际关系图谱，或是您独特的生活哲学...
            </p>
            <div className="text-xs text-purple-600 bg-purple-100 rounded-lg p-2">
              <strong>等待您来定义：</strong>这个空间留给您的创意和想象，定制属于您的独特记录方式。
            </div>
            <Link 
              href="/admin?category=exploration"
              className="inline-block w-full text-center mt-4 px-3 py-2 bg-purple-200 text-purple-800 rounded-md text-sm font-medium hover:bg-purple-300 transition-colors"
            >
              开始探索
            </Link>
          </div>
        </div>
      </div>

      {/* Entertainment & Culture Categories */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">娱乐文化分类</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* 电影 */}
          <div className="museum-card p-6 hover:scale-105 transition-transform duration-200 bg-gradient-to-br from-red-50 to-pink-50 border-red-200">
            <div className="text-center mb-4">
              <div className="text-4xl mb-2">🎬</div>
              <h3 className="text-lg font-semibold text-red-800">
                电影
              </h3>
              <p className="text-xs text-red-600 uppercase tracking-wide font-medium">
                Movies
              </p>
            </div>
            <p className="text-sm text-red-700 mb-4 leading-relaxed">
              记录观影体验和电影评价。影评、推荐清单、经典台词、导演风格分析等深度思考。
            </p>
            <div className="text-xs text-red-600 bg-red-100 rounded-lg p-2">
              <strong>记录目的：</strong>构建个人电影品味档案，记录光影艺术带来的感动和启发。
            </div>
            <Link 
              href="/admin?category=movies"
              className="inline-block w-full text-center mt-4 px-3 py-2 bg-red-200 text-red-800 rounded-md text-sm font-medium hover:bg-red-300 transition-colors"
            >
              记录电影
            </Link>
          </div>

          {/* 电视剧 */}
          <div className="museum-card p-6 hover:scale-105 transition-transform duration-200 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <div className="text-center mb-4">
              <div className="text-4xl mb-2">📺</div>
              <h3 className="text-lg font-semibold text-blue-800">
                电视剧
              </h3>
              <p className="text-xs text-blue-600 uppercase tracking-wide font-medium">
                TV Series
              </p>
            </div>
            <p className="text-sm text-blue-700 mb-4 leading-relaxed">
              记录追剧体验和剧集评价。角色分析、剧情讨论、制作水准、情感共鸣等观剧感受。
            </p>
            <div className="text-xs text-blue-600 bg-blue-100 rounded-lg p-2">
              <strong>记录目的：</strong>追踪剧集文化的发展，记录长篇叙事带来的情感体验。
            </div>
            <Link 
              href="/admin?category=tv-series"
              className="inline-block w-full text-center mt-4 px-3 py-2 bg-blue-200 text-blue-800 rounded-md text-sm font-medium hover:bg-blue-300 transition-colors"
            >
              记录电视剧
            </Link>
          </div>

          {/* 书籍 */}
          <div className="museum-card p-6 hover:scale-105 transition-transform duration-200 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <div className="text-center mb-4">
              <div className="text-4xl mb-2">📚</div>
              <h3 className="text-lg font-semibold text-green-800">
                书籍
              </h3>
              <p className="text-xs text-green-600 uppercase tracking-wide font-medium">
                Books
              </p>
            </div>
            <p className="text-sm text-green-700 mb-4 leading-relaxed">
              记录阅读体验和读书笔记。书评、阅读感悟、金句摘录、知识总结等深度阅读成果。
            </p>
            <div className="text-xs text-green-600 bg-green-100 rounded-lg p-2">
              <strong>记录目的：</strong>构建个人知识体系，记录文字世界带来的智慧和思考。
            </div>
            <Link 
              href="/admin?category=books"
              className="inline-block w-full text-center mt-4 px-3 py-2 bg-green-200 text-green-800 rounded-md text-sm font-medium hover:bg-green-300 transition-colors"
            >
              记录书籍
            </Link>
          </div>

          {/* 音乐 */}
          <div className="museum-card p-6 hover:scale-105 transition-transform duration-200 bg-gradient-to-br from-pink-50 to-rose-50 border-pink-200">
            <div className="text-center mb-4">
              <div className="text-4xl mb-2">🎵</div>
              <h3 className="text-lg font-semibold text-pink-800">
                音乐
              </h3>
              <p className="text-xs text-pink-600 uppercase tracking-wide font-medium">
                Music
              </p>
            </div>
            <p className="text-sm text-pink-700 mb-4 leading-relaxed">
              记录音乐体验和感受。歌曲推荐、演唱会体验、音乐情感、艺术家故事等音乐生活。
            </p>
            <div className="text-xs text-pink-600 bg-pink-100 rounded-lg p-2">
              <strong>记录目的：</strong>记录声音艺术的感动瞬间，构建个人音乐情感档案。
            </div>
            <Link 
              href="/admin?category=music"
              className="inline-block w-full text-center mt-4 px-3 py-2 bg-pink-200 text-pink-800 rounded-md text-sm font-medium hover:bg-pink-300 transition-colors"
            >
              记录音乐
            </Link>
          </div>
        </div>
      </div>

      {/* 最新展品预览 */}
      {exhibits.length > 0 && (
        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">最新记录</h3>
            <Link 
              href="/admin"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              查看全部 →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {exhibits.slice(0, 3).map((exhibit) => (
              <Link
                key={exhibit.id}
                href={`/exhibit/${exhibit.slug}`}
                className="museum-card p-4 block hover:scale-105 transition-transform duration-200"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="category-badge text-xs"
                    style={{ 
                      backgroundColor: exhibit.category.color + "20", 
                      color: exhibit.category.color 
                    }}
                  >
                    {exhibit.category.name}
                  </span>
                  {exhibit.payload && typeof exhibit.payload === 'object' &&
                   'specialTags' in exhibit.payload &&
                   Array.isArray(exhibit.payload.specialTags) &&
                   exhibit.payload.specialTags.length > 0 && (
                     <div className="flex gap-1">
                       {(exhibit.payload.specialTags as string[]).map((tagId: string) => {
                         const tagLabels = {
                           'milestone': '🏆',
                           'daily-joy': '🌸',
                           'growth': '💪',
                           'exploration': '🎯'
                         };
                         return (
                           <span
                             key={tagId}
                             className="text-xs"
                             title={
                               tagId === 'milestone' ? '大事记 / 人生里程碑' :
                               tagId === 'daily-joy' ? '生活琐事 / 日常小确幸' :
                               tagId === 'growth' ? '挑战与成长' :
                               tagId === 'exploration' ? '探索空间' : ''
                             }
                           >
                             {tagLabels[tagId as keyof typeof tagLabels]}
                           </span>
                         );
                       })}
                     </div>
                   )}
                </div>

                <h4 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2">
                  {exhibit.title}
                </h4>
                
                {exhibit.description && (
                  <p className="text-gray-600 text-xs mb-2 line-clamp-2">
                    {exhibit.description}
                  </p>
                )}

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{new Date(exhibit.createdAt).toLocaleDateString("zh-CN")}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {exhibits.length === 0 && (
        <div className="text-center py-8 mt-8 bg-gray-50 rounded-lg">
          <div className="text-gray-400 text-4xl mb-3">📝</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            开始您的人生记录之旅
          </h3>
          <p className="text-gray-600 mb-4">
            选择一个分类，记录您人生中的珍贵瞬间
          </p>
        </div>
      )}
    </div>
  );
}

function getEmotionColor(score: number): string {
  if (score <= 3) return "#ef4444"; // red
  if (score <= 5) return "#f59e0b"; // amber
  if (score <= 7) return "#10b981"; // emerald
  return "#3b82f6"; // blue
} 