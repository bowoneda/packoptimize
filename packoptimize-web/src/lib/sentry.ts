import * as Sentry from "@sentry/nextjs";

export function initSentry() {
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN) return;

  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.2 : 1.0,
    environment: process.env.NODE_ENV ?? "development",
    enabled: process.env.NODE_ENV === "production",
  });
}
