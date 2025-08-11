// 可选的 Sentry 初始化。通过环境变量 SENTRY_DSN 控制是否启用。
import * as Sentry from "@sentry/nextjs";

export function initSentry() {
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) return;
  Sentry.init({
    dsn,
    tracesSampleRate: 0.1,
  });
}


