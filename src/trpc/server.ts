import "server-only";

import { headers } from "next/headers";
import { cache } from "react";

import { createCaller } from "../server/api/root";
import { createTRPCContext } from "../server/api/trpc";

/**
 * This wraps the `createTRPCContext` helper and providers it with the path of the current server-side request.
 * This allows you to access the request headers to infer things like the user's session.
 */
const createContext = cache(async () => {
  const heads = new Headers(headers());
  heads.set("x-trpc-source", "rsc");

  return await createTRPCContext({
    req: {
      headers: heads,
    } as any,
    res: undefined,
  });
});

/**
 * Server-side tRPC API caller
 */
export const api = {
  exhibit: {
    getAll: async (input: {
      categoryId?: string;
      visibility?: "PRIVATE" | "SHARED" | "PUBLIC" | "UNLISTED";
      showAll?: boolean;
      limit?: number;
      cursor?: string;
    } = {}) => {
      const ctx = await createContext();
      const caller = createCaller(ctx);
      return caller.exhibit.getAll(input);
    },
    getBySlug: async (input: { slug: string }) => {
      const ctx = await createContext();
      const caller = createCaller(ctx);
      return caller.exhibit.getBySlug(input);
    },
    create: async (input: any) => {
      const ctx = await createContext();
      const caller = createCaller(ctx);
      return caller.exhibit.create(input);
    }
  },
  category: {
    getAll: async () => {
      const ctx = await createContext();
      const caller = createCaller(ctx);
      return caller.category.getAll();
    }
  }
}; 