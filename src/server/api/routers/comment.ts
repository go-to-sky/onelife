import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure, adminProcedure } from "../trpc";

export const commentRouter = createTRPCRouter({
  list: publicProcedure
    .input(
      z.object({
        exhibitId: z.string(),
        limit: z.number().min(1).max(50).default(10),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { db } = ctx;
      const items = await db.comment.findMany({
        where: { exhibitId: input.exhibitId, parentId: null },
        orderBy: { createdAt: "desc" },
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        include: {
          author: { select: { id: true, name: true, image: true } },
          replies: {
            orderBy: { createdAt: "asc" },
            include: {
              author: { select: { id: true, name: true, image: true } },
            },
          },
        },
      });

      let nextCursor: string | undefined = undefined;
      if (items.length > input.limit) {
        const next = items.pop();
        nextCursor = next?.id;
      }
      return { items, nextCursor };
    }),
  create: protectedProcedure
    .input(
      z.object({
        exhibitId: z.string(),
        content: z.string().min(1).max(5000),
        parentId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { db, session } = ctx;
      const created = await db.comment.create({
        data: {
          exhibitId: input.exhibitId,
          content: input.content,
          authorId: session.user.id,
          parentId: input.parentId ?? null,
        },
      });
      return { id: created.id };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { db, session } = ctx;
      const existing = await db.comment.findUnique({
        where: { id: input.id },
        select: { authorId: true },
      });

      if (!existing) {
        throw new Error("评论不存在");
      }

      const isAdmin = session.user.isAdmin === true;
      const isOwner = existing.authorId === session.user.id;
      if (!isAdmin && !isOwner) {
        throw new Error("无权删除此评论");
      }

      await db.$transaction([
        db.comment.deleteMany({ where: { parentId: input.id } }),
        db.comment.delete({ where: { id: input.id } }),
      ]);

      return { success: true };
    }),

  adminList: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        cursor: z.string().optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const { db } = ctx;
      const limit = input?.limit ?? 20;
      const items = await db.comment.findMany({
        orderBy: { createdAt: "desc" },
        take: limit + 1,
        cursor: input?.cursor ? { id: input.cursor } : undefined,
        include: {
          author: { select: { id: true, name: true, image: true } },
          exhibit: { select: { id: true, title: true, slug: true } },
        },
      });
      let nextCursor: string | undefined = undefined;
      if (items.length > limit) {
        const next = items.pop();
        nextCursor = next?.id;
      }
      return { items, nextCursor };
    }),
});


