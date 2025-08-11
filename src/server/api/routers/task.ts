import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
} from "../trpc";

export const taskRouter = createTRPCRouter({
  // 获取今日任务
  getToday: protectedProcedure
    .input(
      z.object({
        category: z.enum(["STUDY_LONG_TERM", "STUDY_SHORT_TERM", "LIFE_LONG_TERM", "LIFE_SHORT_TERM"]).optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const { db, session } = ctx;
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD 格式
      
      const tasks = await db.task.findMany({
        where: {
          userId: session.user.id,
          taskDate: {
            equals: new Date(today + 'T00:00:00.000Z'), // 转换为Date对象
          },
          ...(input?.category && { category: input.category }),
        },
        orderBy: [
          { status: "asc" }, // PENDING 在前
          { createdAt: "asc" },
        ],
      });

      return tasks;
    }),

  // 创建新任务
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1).max(200),
        description: z.string().optional(),
        taskDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD
        status: z.enum(["PENDING", "COMPLETED"]).default("PENDING"),
        category: z.enum(["STUDY_LONG_TERM", "STUDY_SHORT_TERM", "LIFE_LONG_TERM", "LIFE_SHORT_TERM"]).default("LIFE_LONG_TERM"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { db, session } = ctx;
      
      const task = await db.task.create({
        data: {
          title: input.title,
          description: input.description,
          taskDate: new Date(input.taskDate + 'T00:00:00.000Z'), // 确保时区一致性
          status: input.status,
          category: input.category,
          userId: session.user.id,
          completedAt: input.status === "COMPLETED" ? new Date() : null,
        },
      });

      return task;
    }),

  // 切换任务状态
  toggleStatus: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { db, session } = ctx;

      // 获取当前任务
      const existing = await db.task.findUnique({
        where: { id: input.id },
        select: { userId: true, status: true },
      });

      if (!existing || existing.userId !== session.user.id) {
        throw new Error("无权修改此任务");
      }

      // 切换状态
      const newStatus = existing.status === "PENDING" ? "COMPLETED" : "PENDING";
      const completedAt = newStatus === "COMPLETED" ? new Date() : null;

      const task = await db.task.update({
        where: { id: input.id },
        data: {
          status: newStatus,
          completedAt,
        },
      });

      return task;
    }),

  // 删除任务
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { db, session } = ctx;

      // 检查任务所有权
      const existing = await db.task.findUnique({
        where: { id: input.id },
        select: { userId: true },
      });

      if (!existing || existing.userId !== session.user.id) {
        throw new Error("无权删除此任务");
      }

      await db.task.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  // 按指定日期获取任务
  getByDate: protectedProcedure
    .input(
      z.object({
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD
        category: z.enum(["STUDY_LONG_TERM", "STUDY_SHORT_TERM", "LIFE_LONG_TERM", "LIFE_SHORT_TERM"]).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { db, session } = ctx;
      
      const tasks = await db.task.findMany({
        where: {
          userId: session.user.id,
          taskDate: {
            equals: new Date(input.date + 'T00:00:00.000Z'),
          },
          ...(input.category && { category: input.category }),
        },
        orderBy: [
          { status: "asc" },
          { createdAt: "asc" },
        ],
      });

      return tasks;
    }),

  // 按日期范围获取任务
  getDateRange: protectedProcedure
    .input(
      z.object({
        startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        category: z.enum(["STUDY_LONG_TERM", "STUDY_SHORT_TERM", "LIFE_LONG_TERM", "LIFE_SHORT_TERM"]).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { db, session } = ctx;
      
      const tasks = await db.task.findMany({
        where: {
          userId: session.user.id,
          taskDate: {
            gte: new Date(input.startDate + 'T00:00:00.000Z'),
            lte: new Date(input.endDate + 'T23:59:59.999Z'),
          },
          ...(input.category && { category: input.category }),
        },
        orderBy: [
          { taskDate: "desc" },
          { status: "asc" },
          { createdAt: "asc" },
        ],
      });

      return tasks;
    }),

  // 获取任务统计数据
  getStatistics: protectedProcedure
    .input(
      z.object({
        type: z.enum(["week", "month", "last7days", "last30days", "last90days", "year", "custom"]),
        startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
        endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { db, session } = ctx;
      
      // 根据类型计算日期范围
      let startDate: string;
      let endDate: string;
      const today = new Date();
      
      switch (input.type) {
        case "week":
          const startOfWeek = new Date(today);
          startOfWeek.setDate(today.getDate() - today.getDay());
          const endOfWeek = new Date(startOfWeek);
          endOfWeek.setDate(startOfWeek.getDate() + 6);
          startDate = startOfWeek.toISOString().split('T')[0];
          endDate = endOfWeek.toISOString().split('T')[0];
          break;
          
        case "month":
          const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
          const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
          startDate = startOfMonth.toISOString().split('T')[0];
          endDate = endOfMonth.toISOString().split('T')[0];
          break;
          
        case "last7days":
          const last7Start = new Date(today);
          last7Start.setDate(today.getDate() - 6);
          startDate = last7Start.toISOString().split('T')[0];
          endDate = today.toISOString().split('T')[0];
          break;
          
        case "last30days":
          const last30Start = new Date(today);
          last30Start.setDate(today.getDate() - 29);
          startDate = last30Start.toISOString().split('T')[0];
          endDate = today.toISOString().split('T')[0];
          break;
          
        case "last90days":
          const last90Start = new Date(today);
          last90Start.setDate(today.getDate() - 89);
          startDate = last90Start.toISOString().split('T')[0];
          endDate = today.toISOString().split('T')[0];
          break;
          
        case "year":
          const startOfYear = new Date(today.getFullYear(), 0, 1);
          const endOfYear = new Date(today.getFullYear(), 11, 31);
          startDate = startOfYear.toISOString().split('T')[0];
          endDate = endOfYear.toISOString().split('T')[0];
          break;
          
        case "custom":
          if (!input.startDate || !input.endDate) {
            throw new Error("自定义日期范围需要提供开始和结束日期");
          }
          startDate = input.startDate;
          endDate = input.endDate;
          break;
          
        default:
          throw new Error("不支持的统计类型");
      }
      
      const tasks = await db.task.findMany({
        where: {
          userId: session.user.id,
          taskDate: {
            gte: new Date(startDate + 'T00:00:00.000Z'),
            lte: new Date(endDate + 'T23:59:59.999Z'),
          },
        },
        select: {
          category: true,
          status: true,
          taskDate: true,
          completedAt: true,
        },
      });

      // 按分类统计
      const categoryStats = tasks.reduce((acc, task) => {
        const category = task.category;
        if (!acc[category]) {
          acc[category] = { total: 0, completed: 0 };
        }
        acc[category].total++;
        if (task.status === "COMPLETED") {
          acc[category].completed++;
        }
        return acc;
      }, {} as Record<string, { total: number; completed: number }>);

      // 按日期统计
      const dailyStats = tasks.reduce((acc, task) => {
        const date = task.taskDate.toISOString().split('T')[0];
        if (!acc[date]) {
          acc[date] = { total: 0, completed: 0 };
        }
        acc[date].total++;
        if (task.status === "COMPLETED") {
          acc[date].completed++;
        }
        return acc;
      }, {} as Record<string, { total: number; completed: number }>);

      return {
        categoryStats,
        dailyStats,
        totalTasks: tasks.length,
        completedTasks: tasks.filter(t => t.status === "COMPLETED").length,
        dateRange: { startDate, endDate },
      };
    }),
});