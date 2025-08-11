import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// 轻量路由保护示例：默认仅提示，不强制拦截。
// 如需启用强拦截，将 `ENFORCE_ADMIN_MIDDLEWARE` 设为 "true"。

export function middleware(req: NextRequest) {
  const url = new URL(req.url);
  const pathname = url.pathname;

  const shouldProtect = pathname.startsWith("/admin");
  const enforce = process.env.ENFORCE_ADMIN_MIDDLEWARE === "true";

  if (!shouldProtect || !enforce) {
    return NextResponse.next();
  }

  // 这里通常会读取会话（如使用 next-auth 的 auth middleware）。
  // 当前项目仍在模拟 session，无法在 Edge 中直接读取；因此保留为开关控制。
  // 可与生产环境的 NextAuth middleware 集成：export { default } from "next-auth/middleware";

  // 如果要强制限制，可在此返回重定向到登录页：
  // return NextResponse.redirect(new URL("/auth/signin", url.origin));

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};


