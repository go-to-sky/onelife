import { createCallerFactory, createTRPCRouter } from "./trpc";
import { categoryRouter } from "./routers/category";
import { exhibitRouter } from "./routers/exhibit";
import { taskRouter } from "./routers/task";
import { commentRouter } from "./routers/comment";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  exhibit: exhibitRouter,
  category: categoryRouter,
  task: taskRouter,
  comment: commentRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.exhibit.getAll();
 *       ^? Exhibit[]
 */
export const createCaller = createCallerFactory(appRouter); 