import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const commentRouter = createTRPCRouter({
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
});


