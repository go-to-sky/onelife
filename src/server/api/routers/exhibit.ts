import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "../trpc";

// Utility function to generate slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export const exhibitRouter = createTRPCRouter({
  // Get all public exhibits for homepage
  getAll: publicProcedure
    .input(
      z.object({
        categoryId: z.string().optional(),
        visibility: z.enum(["PRIVATE", "SHARED", "PUBLIC", "UNLISTED"]).optional(),
        showAll: z.boolean().optional().default(false),
        limit: z.number().min(1).max(100).default(20),
        cursor: z.string().optional(),
      }).default({})
    )
    .query(async ({ ctx, input }) => {
      const { db } = ctx;
      const { limit, cursor, categoryId, visibility, showAll } = input;

      const whereClause: any = {};
      
      // 临时显示所有公开展品 (正式版应该检查认证状态)
      if (!showAll) {
        if (visibility) {
          whereClause.visibility = visibility;
        } else {
          whereClause.visibility = "PUBLIC";
        }
      }
      // 如果 showAll 为 true，不添加可见性过滤条件（显示所有）

      if (categoryId) {
        whereClause.categoryId = categoryId;
      }

      const exhibits = await db.exhibit.findMany({
        where: whereClause,
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { createdAt: "desc" },
        include: {
          category: true,
          user: {
            select: { id: true, name: true, image: true },
          },
          tags: {
            include: { tag: true },
          },
          _count: {
            select: { comments: true },
          },
        },
      });

      let nextCursor: typeof cursor | undefined = undefined;
      if (exhibits.length > limit) {
        const nextItem = exhibits.pop();
        nextCursor = nextItem!.id;
      }

      return {
        items: exhibits,
        nextCursor,
      };
    }),

  // Get user's own exhibits (for admin panel)
  getMy: protectedProcedure
    .input(
      z.object({
        categoryId: z.string().optional(),
        limit: z.number().min(1).max(100).default(20),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { db, session } = ctx;
      const { limit, cursor, categoryId } = input;

      const whereClause: any = {
        userId: session.user.id,
      };

      if (categoryId) {
        whereClause.categoryId = categoryId;
      }

      const exhibits = await db.exhibit.findMany({
        where: whereClause,
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { createdAt: "desc" },
        include: {
          category: true,
          tags: {
            include: { tag: true },
          },
          _count: {
            select: { comments: true },
          },
        },
      });

      let nextCursor: typeof cursor | undefined = undefined;
      if (exhibits.length > limit) {
        const nextItem = exhibits.pop();
        nextCursor = nextItem!.id;
      }

      return {
        items: exhibits,
        nextCursor,
      };
    }),

  // Get single exhibit by slug
  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const { db } = ctx;
      const exhibit = await db.exhibit.findUnique({
        where: { slug: input.slug },
        include: {
          category: true,
          user: {
            select: { id: true, name: true, image: true },
          },
          tags: {
            include: { tag: true },
          },
          comments: {
            include: {
              author: {
                select: { id: true, name: true, image: true },
              },
              replies: {
                include: {
                  author: {
                    select: { id: true, name: true, image: true },
                  },
                },
              },
            },
            where: { parentId: null },
            orderBy: { createdAt: "desc" },
          },
          // 暂时注释掉 media 查询以避免数据库结构问题
          // media: true,
        },
      });

      if (!exhibit) {
        throw new Error("展品未找到");
      }

      // 临时跳过私密展品权限检查 (正式版应该检查)
      if (exhibit.visibility === "PRIVATE") {
        throw new Error("这是一个私密展品");
      }

      return exhibit;
    }),

  // Create new exhibit (临时改为公共访问，正式版应使用 protectedProcedure)
  create: publicProcedure
    .input(
      z.object({
        title: z.string().min(1).max(200),
        description: z.string().optional(),
        content: z.string().min(1),
        coverImage: z.string().url().optional().or(z.literal("")),
        categoryId: z.string(),
        visibility: z.enum(["PRIVATE", "SHARED", "PUBLIC", "UNLISTED"]).default("PRIVATE"),
        emotionScore: z.number().min(1).max(10).optional(),
        exhibitDate: z.date().optional(),
        tags: z.array(z.string()).optional(),
        payload: z.any().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { db } = ctx;
      const { tags, ...data } = input;

      // 临时使用固定的用户 ID (正式版应该从 session 获取)
      const userId = "temp-user-id";
      
      // 处理分类ID - 如果传入的是slug，则查找对应的ID
      let categoryId = data.categoryId;
      
      // 检查是否是分类slug而不是ID
      const categoryBySlug = await db.category.findUnique({
        where: { slug: data.categoryId }
      });
      
      if (categoryBySlug) {
        categoryId = categoryBySlug.id;
      } else {
        // 尝试直接使用ID查找分类
        const categoryById = await db.category.findUnique({
          where: { id: data.categoryId }
        });
        
        if (!categoryById) {
          throw new Error(`分类不存在: ${data.categoryId}`);
        }
      }

      // Generate unique slug
      let slug = generateSlug(data.title);
      let counter = 1;
      while (await db.exhibit.findUnique({ where: { slug } })) {
        slug = `${generateSlug(data.title)}-${counter}`;
        counter++;
      }

      // Create exhibit
      const exhibit = await db.exhibit.create({
        data: {
          title: data.title,
          description: data.description,
          content: data.content,
          coverImage: data.coverImage && data.coverImage.trim() !== "" ? data.coverImage : null,
          categoryId,
          visibility: data.visibility,
          emotionScore: data.emotionScore,
          exhibitDate: data.exhibitDate,
          slug,
          userId,
        },
      });

      // Return minimal response to avoid serialization issues

      // Handle tags if provided
      if (tags && tags.length > 0) {
        for (const tagName of tags) {
          // Find or create tag
          let tag = await db.tag.findUnique({
            where: { name: tagName },
          });

          if (!tag) {
            tag = await db.tag.create({
              data: {
                name: tagName,
                slug: generateSlug(tagName),
              },
            });
          }

          // Link tag to exhibit
          await db.exhibitTag.create({
            data: {
              exhibitId: exhibit.id,
              tagId: tag.id,
            },
          });
        }
      }

      return { success: true, id: exhibit.id };
    }),

  // Update exhibit
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(1).max(200).optional(),
        description: z.string().optional(),
        content: z.string().min(1).optional(),
        coverImage: z.string().url().optional().or(z.literal("")),
        categoryId: z.string().optional(),
        visibility: z.enum(["PRIVATE", "SHARED", "PUBLIC", "UNLISTED"]).optional(),
        emotionScore: z.number().min(1).max(10).optional(),
        exhibitDate: z.date().optional(),
        tags: z.array(z.string()).optional(),
        payload: z.any().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { db, session } = ctx;
      const { id, tags, ...data } = input;

      // Check ownership
      const existing = await db.exhibit.findUnique({
        where: { id },
        select: { userId: true },
      });

      if (!existing || existing.userId !== session.user.id) {
        throw new Error("无权编辑此展品");
      }

      // Update slug if title changed
      if (data.title) {
        let newSlug = generateSlug(data.title);
        let counter = 1;
        while (await db.exhibit.findFirst({ 
          where: { slug: newSlug, id: { not: id } }
        })) {
          newSlug = `${generateSlug(data.title)}-${counter}`;
          counter++;
        }
        (data as any).slug = newSlug;
      }

      // Update exhibit
      const exhibit = await db.exhibit.update({
        where: { id },
        data,
        include: {
          category: true,
          tags: {
            include: { tag: true },
          },
        },
      });

      // Handle tags update if provided
      if (tags !== undefined) {
        // Remove existing tags
        await db.exhibitTag.deleteMany({
          where: { exhibitId: id },
        });

        // Add new tags
        for (const tagName of tags) {
          let tag = await db.tag.findUnique({
            where: { name: tagName },
          });

          if (!tag) {
            tag = await db.tag.create({
              data: {
                name: tagName,
                slug: generateSlug(tagName),
              },
            });
          }

          await db.exhibitTag.create({
            data: {
              exhibitId: id,
              tagId: tag.id,
            },
          });
        }
      }

      return exhibit;
    }),

  // Delete exhibit (临时改为公共访问)
  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { db } = ctx;

      // 临时跳过所有权检查 (正式版应该检查)
      const exhibit = await db.exhibit.findUnique({
        where: { id: input.id },
        select: { userId: true },
      });

      if (!exhibit) {
        throw new Error("展品不存在");
      }

      await db.exhibit.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),
}); 