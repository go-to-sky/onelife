import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "../trpc";

// Utility function to generate slug from name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export const categoryRouter = createTRPCRouter({
  // Get all categories
  getAll: publicProcedure.query(async ({ ctx }) => {
    const categories = await ctx.db.category.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { exhibits: true },
        },
      },
    });
    return categories;
  }),

  // Create category (admin only)
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(50),
        color: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
        icon: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { db } = ctx;
      
      // Generate unique slug
      let slug = generateSlug(input.name);
      let counter = 1;
      while (await db.category.findUnique({ where: { slug } })) {
        slug = `${generateSlug(input.name)}-${counter}`;
        counter++;
      }

      const category = await db.category.create({
        data: {
          ...input,
          slug,
        },
      });

      return category;
    }),

  // Update category
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).max(50).optional(),
        color: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
        icon: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { db } = ctx;
      const { id, ...data } = input;

      // Update slug if name changed
      if (data.name) {
        let newSlug = generateSlug(data.name);
        let counter = 1;
        while (await db.category.findFirst({ 
          where: { slug: newSlug, id: { not: id } }
        })) {
          newSlug = `${generateSlug(data.name)}-${counter}`;
          counter++;
        }
        (data as any).slug = newSlug;
      }

      const category = await db.category.update({
        where: { id },
        data,
      });

      return category;
    }),

  // Delete category
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { db } = ctx;

      // Check if category has exhibits
      const exhibitCount = await db.exhibit.count({
        where: { categoryId: input.id },
      });

      if (exhibitCount > 0) {
        throw new Error("无法删除包含展品的分类");
      }

      await db.category.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),
}); 