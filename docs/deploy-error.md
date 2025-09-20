06:58:54.499 Running build in Washington, D.C., USA (East) – iad1
06:58:54.500 Build machine configuration: 2 cores, 8 GB
06:58:54.518 Cloning github.com/mojisejr/mimivibe-ai (Branch: main, Commit: 5b8809e)
06:58:54.529 Skipping build cache, deployment was triggered without cache.
06:58:54.888 Cloning completed: 369.000ms
06:58:55.187 Running "vercel build"
06:58:55.561 Vercel CLI 48.0.2
06:58:55.896 Installing dependencies...
06:58:58.946 npm warn deprecated rimraf@3.0.2: Rimraf versions prior to v4 are no longer supported
06:58:59.532 npm warn deprecated inflight@1.0.6: This module is not supported, and leaks memory. Do not use it. Check out lru-cache if you want a good and tested way to coalesce async requests by a key value, which is much more comprehensive and powerful.
06:59:01.115 npm warn deprecated @humanwhocodes/config-array@0.13.0: Use @eslint/config-array instead
06:59:01.116 npm warn deprecated @humanwhocodes/object-schema@2.0.3: Use @eslint/object-schema instead
06:59:01.355 npm warn deprecated glob@7.2.3: Glob versions prior to v9 are no longer supported
06:59:03.888 npm warn deprecated eslint@8.57.1: This version is no longer supported. Please see https://eslint.org/version-support for other options.
06:59:18.226
06:59:18.226 added 607 packages in 22s
06:59:18.226
06:59:18.227 198 packages are looking for funding
06:59:18.227 run `npm fund` for details
06:59:18.274 Detected Next.js version: 14.2.30
06:59:18.281 Running "npm run build"
06:59:18.492
06:59:18.492 > mimi-vibes-v3@0.1.0 build
06:59:18.493 > npx prisma generate && next build
06:59:18.493
06:59:19.926 Prisma schema loaded from prisma/schema.prisma
06:59:20.372 ┌─────────────────────────────────────────────────────────┐
06:59:20.373 │ Update available 6.16.1 -> 6.16.2 │
06:59:20.373 │ Run the following to update │
06:59:20.374 │ npm i --save-dev prisma@latest │
06:59:20.374 │ npm i @prisma/client@latest │
06:59:20.374 └─────────────────────────────────────────────────────────┘
06:59:20.374
06:59:20.374 ✔ Generated Prisma Client (v6.16.1) to ./node_modules/@prisma/client in 246ms
06:59:20.375
06:59:20.375 Start by importing your Prisma Client (See: https://pris.ly/d/importing-client)
06:59:20.375
06:59:20.375 Tip: Need your database queries to be 1000x faster? Accelerate offers you that and more: https://pris.ly/tip-2-accelerate
06:59:20.376
06:59:21.344 Attention: Next.js now collects completely anonymous telemetry regarding usage.
06:59:21.345 This information is used to shape Next.js' roadmap and prioritize features.
06:59:21.346 You can learn more, including how to opt-out if you'd not like to participate in this anonymous program, by visiting the following URL:
06:59:21.346 https://nextjs.org/telemetry
06:59:21.346
06:59:21.398 ▲ Next.js 14.2.30
06:59:21.399 - Experiments (use with caution):
06:59:21.399 · esmExternals
06:59:21.399
06:59:21.464 Creating an optimized production build ...
06:59:43.333
06:59:43.333 🌼 [35mdaisyUI[39m [2m4.12.24[22m
06:59:43.577 ├─ [32m✔︎[39m 3 themes added[2m https://daisyui.com/docs/themes[22m
06:59:43.579 ╰─ [32m❤︎[39m [0mSupport daisyUI project:[0m [2mhttps://opencollective.com/daisyui[22m
06:59:43.579
06:59:50.307 ⚠ Compiled with warnings
06:59:50.307
06:59:50.308 ./node_modules/scheduler/cjs/scheduler.production.min.js
06:59:50.308 A Node.js API is used (setImmediate at line: 11) which is not supported in the Edge Runtime.
06:59:50.309 Learn more: https://nextjs.org/docs/api-reference/edge-runtime
06:59:50.309
06:59:50.309 Import trace for requested module:
06:59:50.309 ./node_modules/scheduler/cjs/scheduler.production.min.js
06:59:50.309 ./node_modules/scheduler/index.js
06:59:50.309 ./node_modules/react-dom/cjs/react-dom.production.min.js
06:59:50.310 ./node_modules/react-dom/index.js
06:59:50.310 ./node_modules/@clerk/clerk-react/dist/esm/utils/useCustomElementPortal.js
06:59:50.310 ./node_modules/@clerk/clerk-react/dist/esm/utils/index.js
06:59:50.310 ./node_modules/@clerk/clerk-react/dist/esm/contexts/ClerkProvider.js
06:59:50.310 ./node_modules/@clerk/clerk-react/dist/esm/contexts/index.js
06:59:50.311 ./node_modules/@clerk/clerk-react/dist/esm/index.js
06:59:50.311 ./node_modules/@clerk/nextjs/dist/esm/client-boundary/controlComponents.js
06:59:50.311 ./node_modules/@clerk/nextjs/dist/esm/index.js
06:59:50.311
06:59:50.311 ./node_modules/scheduler/cjs/scheduler.production.min.js
06:59:50.311 A Node.js API is used (setImmediate at line: 11) which is not supported in the Edge Runtime.
06:59:50.312 Learn more: https://nextjs.org/docs/api-reference/edge-runtime
06:59:50.312
06:59:50.312 Import trace for requested module:
06:59:50.312 ./node_modules/scheduler/cjs/scheduler.production.min.js
06:59:50.312 ./node_modules/scheduler/index.js
06:59:50.312 ./node_modules/react-dom/cjs/react-dom.production.min.js
06:59:50.313 ./node_modules/react-dom/index.js
06:59:50.313 ./node_modules/@clerk/clerk-react/dist/esm/utils/useCustomElementPortal.js
06:59:50.314 ./node_modules/@clerk/clerk-react/dist/esm/utils/index.js
06:59:50.314 ./node_modules/@clerk/clerk-react/dist/esm/contexts/ClerkProvider.js
06:59:50.319 ./node_modules/@clerk/clerk-react/dist/esm/contexts/index.js
06:59:50.319 ./node_modules/@clerk/clerk-react/dist/esm/index.js
06:59:50.319 ./node_modules/@clerk/nextjs/dist/esm/client-boundary/controlComponents.js
06:59:50.320 ./node_modules/@clerk/nextjs/dist/esm/index.js
06:59:50.320
06:59:50.320 ./node_modules/scheduler/cjs/scheduler.production.min.js
06:59:50.320 A Node.js API is used (MessageChannel at line: 14) which is not supported in the Edge Runtime.
06:59:50.320 Learn more: https://nextjs.org/docs/api-reference/edge-runtime
06:59:50.320
06:59:50.321 Import trace for requested module:
06:59:50.321 ./node_modules/scheduler/cjs/scheduler.production.min.js
06:59:50.321 ./node_modules/scheduler/index.js
06:59:50.321 ./node_modules/react-dom/cjs/react-dom.production.min.js
06:59:50.321 ./node_modules/react-dom/index.js
06:59:50.321 ./node_modules/@clerk/clerk-react/dist/esm/utils/useCustomElementPortal.js
06:59:50.321 ./node_modules/@clerk/clerk-react/dist/esm/utils/index.js
06:59:50.322 ./node_modules/@clerk/clerk-react/dist/esm/contexts/ClerkProvider.js
06:59:50.322 ./node_modules/@clerk/clerk-react/dist/esm/contexts/index.js
06:59:50.322 ./node_modules/@clerk/clerk-react/dist/esm/index.js
06:59:50.322 ./node_modules/@clerk/nextjs/dist/esm/client-boundary/controlComponents.js
06:59:50.322 ./node_modules/@clerk/nextjs/dist/esm/index.js
06:59:50.323
06:59:50.323 ./node_modules/scheduler/cjs/scheduler.production.min.js
06:59:50.323 A Node.js API is used (MessageChannel at line: 14) which is not supported in the Edge Runtime.
06:59:50.323 Learn more: https://nextjs.org/docs/api-reference/edge-runtime
06:59:50.323
06:59:50.323 Import trace for requested module:
06:59:50.323 ./node_modules/scheduler/cjs/scheduler.production.min.js
06:59:50.324 ./node_modules/scheduler/index.js
06:59:50.324 ./node_modules/react-dom/cjs/react-dom.production.min.js
06:59:50.324 ./node_modules/react-dom/index.js
06:59:50.324 ./node_modules/@clerk/clerk-react/dist/esm/utils/useCustomElementPortal.js
06:59:50.324 ./node_modules/@clerk/clerk-react/dist/esm/utils/index.js
06:59:50.324 ./node_modules/@clerk/clerk-react/dist/esm/contexts/ClerkProvider.js
06:59:50.325 ./node_modules/@clerk/clerk-react/dist/esm/contexts/index.js
06:59:50.325 ./node_modules/@clerk/clerk-react/dist/esm/index.js
06:59:50.325 ./node_modules/@clerk/nextjs/dist/esm/client-boundary/controlComponents.js
06:59:50.325 ./node_modules/@clerk/nextjs/dist/esm/index.js
06:59:50.325
06:59:50.325 ./node_modules/@clerk/shared/dist/chunk-RSOCGYTF.mjs
06:59:50.325 A Node.js API is used (MessageEvent at line: 28) which is not supported in the Edge Runtime.
06:59:50.326 Learn more: https://nextjs.org/docs/api-reference/edge-runtime
06:59:50.329
06:59:50.329 Import trace for requested module:
06:59:50.329 ./node_modules/@clerk/shared/dist/chunk-RSOCGYTF.mjs
06:59:50.329 ./node_modules/@clerk/shared/dist/index.mjs
06:59:50.329 ./node_modules/@clerk/clerk-react/dist/esm/components/uiComponents.js
06:59:50.330 ./node_modules/@clerk/clerk-react/dist/esm/components/index.js
06:59:50.330 ./node_modules/@clerk/clerk-react/dist/esm/index.js
06:59:50.330 ./node_modules/@clerk/nextjs/dist/esm/client-boundary/controlComponents.js
06:59:50.330 ./node_modules/@clerk/nextjs/dist/esm/index.js
06:59:50.334
06:59:50.335 Linting and checking validity of types ...
06:59:58.705
06:59:58.706 ./src/app/api/payments/confirm/route.ts
06:59:58.706 77:7 Warning: Unexpected console statement. no-console
06:59:58.706 99:5 Warning: Unexpected console statement. no-console
06:59:58.706 187:9 Warning: Unexpected console statement. no-console
06:59:58.706
06:59:58.706 ./src/app/api/payments/webhook/route.ts
06:59:58.706 26:7 Warning: Unexpected console statement. no-console
06:59:58.706 68:7 Warning: Unexpected console statement. no-console
06:59:58.706 88:11 Warning: Unexpected console statement. no-console
06:59:58.706 126:5 Warning: Unexpected console statement. no-console
06:59:58.706 209:9 Warning: Unexpected console statement. no-console
06:59:58.706 218:7 Warning: Unexpected console statement. no-console
06:59:58.706 242:5 Warning: Unexpected console statement. no-console
06:59:58.706
06:59:58.706 ./src/app/api/referrals/process/route.ts
06:59:58.706 43:5 Warning: Unexpected console statement. no-console
06:59:58.706 51:9 Warning: Unexpected console statement. no-console
06:59:58.706 53:9 Warning: Unexpected console statement. no-console
06:59:58.706 56:7 Warning: Unexpected console statement. no-console
06:59:58.706 87:7 Warning: Unexpected console statement. no-console
06:59:58.706 114:7 Warning: Unexpected console statement. no-console
06:59:58.706 137:9 Warning: Unexpected console statement. no-console
06:59:58.707 192:9 Warning: Unexpected console statement. no-console
06:59:58.707
06:59:58.707 ./src/app/api/user/credits/route.ts
06:59:58.707 11:3 Warning: Unexpected console statement. no-console
06:59:58.707 15:5 Warning: Unexpected console statement. no-console
06:59:58.707 18:7 Warning: Unexpected console statement. no-console
06:59:58.707 35:5 Warning: Unexpected console statement. no-console
06:59:58.707 37:5 Warning: Unexpected console statement. no-console
06:59:58.707 42:7 Warning: Unexpected console statement. no-console
06:59:58.707 70:5 Warning: Unexpected console statement. no-console
06:59:58.707
06:59:58.707 ./src/app/api/webhooks/clerk/route.ts
06:59:58.707 111:3 Warning: Unexpected console statement. no-console
06:59:58.707 152:5 Warning: Unexpected console statement. no-console
06:59:58.707 169:9 Warning: Unexpected console statement. no-console
06:59:58.707 183:3 Warning: Unexpected console statement. no-console
06:59:58.707 202:7 Warning: Unexpected console statement. no-console
06:59:58.707 208:5 Warning: Unexpected console statement. no-console
06:59:58.707 226:5 Warning: Unexpected console statement. no-console
06:59:58.707 259:5 Warning: Unexpected console statement. no-console
06:59:58.707 267:7 Warning: Unexpected console statement. no-console
06:59:58.707 275:3 Warning: Unexpected console statement. no-console
06:59:58.707 313:5 Warning: Unexpected console statement. no-console
06:59:58.707 320:3 Warning: Unexpected console statement. no-console
06:59:58.707 335:5 Warning: Unexpected console statement. no-console
06:59:58.707
06:59:58.707 ./src/app/ask/components/AnimatedArticleDisplay.tsx
06:59:58.707 86:13 Warning: Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image` to automatically optimize images. This may incur additional usage or cost from your provider. See: https://nextjs.org/docs/messages/no-img-element @next/next/no-img-element
06:59:58.708 220:9 Warning: Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image` to automatically optimize images. This may incur additional usage or cost from your provider. See: https://nextjs.org/docs/messages/no-img-element @next/next/no-img-element
06:59:58.708 824:19 Warning: Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image` to automatically optimize images. This may incur additional usage or cost from your provider. See: https://nextjs.org/docs/messages/no-img-element @next/next/no-img-element
06:59:58.708
06:59:58.708 ./src/app/ask/components/ArticleDisplay.tsx
06:59:58.708 31:9 Warning: Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image` to automatically optimize images. This may incur additional usage or cost from your provider. See: https://nextjs.org/docs/messages/no-img-element @next/next/no-img-element
06:59:58.708
06:59:58.708 ./src/app/ask/components/AutoHideNavbar.tsx
06:59:58.708 59:15 Warning: Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image` to automatically optimize images. This may incur additional usage or cost from your provider. See: https://nextjs.org/docs/messages/no-img-element @next/next/no-img-element
06:59:58.708
06:59:58.708 ./src/app/page.tsx
06:59:58.708 469:9 Warning: Unexpected console statement. no-console
06:59:58.708 480:11 Warning: Unexpected console statement. no-console
06:59:58.708 488:9 Warning: Unexpected console statement. no-console
06:59:58.708 494:9 Warning: Unexpected console statement. no-console
06:59:58.708 513:11 Warning: Unexpected console statement. no-console
06:59:58.710 536:13 Warning: Unexpected console statement. no-console
06:59:58.711 554:13 Warning: Unexpected console statement. no-console
06:59:58.711 570:13 Warning: Unexpected console statement. no-console
06:59:58.711 594:13 Warning: Unexpected console statement. no-console
06:59:58.711 738:9 Warning: Unexpected console statement. no-console
06:59:58.711
06:59:58.711 ./src/components/admin/RewardManager.tsx
06:59:58.711 43:6 Warning: React Hook useEffect has a missing dependency: 'fetchRewards'. Either include it or remove the dependency array. react-hooks/exhaustive-deps
06:59:58.711
06:59:58.711 ./src/components/admin/SecurityDashboard.tsx
06:59:58.711 173:6 Warning: React Hook useEffect has missing dependencies: 'fetchAlerts' and 'fetchMetrics'. Either include them or remove the dependency array. react-hooks/exhaustive-deps
06:59:58.711 182:6 Warning: React Hook useEffect has a missing dependency: 'fetchAlerts'. Either include it or remove the dependency array. react-hooks/exhaustive-deps
06:59:58.711 192:6 Warning: React Hook useEffect has missing dependencies: 'fetchAlerts' and 'fetchMetrics'. Either include them or remove the dependency array. react-hooks/exhaustive-deps
06:59:58.711
06:59:58.711 ./src/components/cards/CardDetailModal.tsx
06:59:58.711 34:15 Warning: Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image` to automatically optimize images. This may incur additional usage or cost from your provider. See: https://nextjs.org/docs/messages/no-img-element @next/next/no-img-element
06:59:58.711
06:59:58.711 ./src/components/cards/CardFallback.tsx
06:59:58.711 31:11 Warning: Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image` to automatically optimize images. This may incur additional usage or cost from your provider. See: https://nextjs.org/docs/messages/no-img-element @next/next/no-img-element
06:59:58.711
06:59:58.711 ./src/components/cards/TarotCard.tsx
06:59:58.711 85:17 Warning: Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image` to automatically optimize images. This may incur additional usage or cost from your provider. See: https://nextjs.org/docs/messages/no-img-element @next/next/no-img-element
06:59:58.711
06:59:58.711 ./src/components/chat/ChatHeader.tsx
06:59:58.712 30:17 Warning: Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image` to automatically optimize images. This may incur additional usage or cost from your provider. See: https://nextjs.org/docs/messages/no-img-element @next/next/no-img-element
06:59:58.712
06:59:58.712 ./src/components/chat/UserMessage.tsx
06:59:58.712 34:13 Warning: Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image` to automatically optimize images. This may incur additional usage or cost from your provider. See: https://nextjs.org/docs/messages/no-img-element @next/next/no-img-element
06:59:58.712
06:59:58.712 ./src/components/history/ReadingCard.tsx
06:59:58.712 71:9 Warning: Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image` to automatically optimize images. This may incur additional usage or cost from your provider. See: https://nextjs.org/docs/messages/no-img-element @next/next/no-img-element
06:59:58.712
06:59:58.712 ./src/components/history/ReadingDetailModal.tsx
06:59:58.712 104:11 Warning: Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image` to automatically optimize images. This may incur additional usage or cost from your provider. See: https://nextjs.org/docs/messages/no-img-element @next/next/no-img-element
06:59:58.712 163:9 Warning: Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image` to automatically optimize images. This may incur additional usage or cost from your provider. See: https://nextjs.org/docs/messages/no-img-element @next/next/no-img-element
06:59:58.712
06:59:58.712 ./src/components/layout/UnifiedNavbar.tsx
06:59:58.712 85:13 Warning: Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image` to automatically optimize images. This may incur additional usage or cost from your provider. See: https://nextjs.org/docs/messages/no-img-element @next/next/no-img-element
06:59:58.712
06:59:58.713 ./src/components/meamor/AdvancedAnalyticsSection.tsx
06:59:58.713 77:6 Warning: React Hook useEffect has a missing dependency: 'fetchAnalyticsData'. Either include it or remove the dependency array. react-hooks/exhaustive-deps
06:59:58.713
06:59:58.713 ./src/components/meamor/PaymentHistorySection.tsx
06:59:58.713 122:6 Warning: React Hook useEffect has a missing dependency: 'fetchPaymentData'. Either include it or remove the dependency array. react-hooks/exhaustive-deps
06:59:58.713 293:35 Warning: Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image` to automatically optimize images. This may incur additional usage or cost from your provider. See: https://nextjs.org/docs/messages/no-img-element @next/next/no-img-element
06:59:58.713 336:31 Warning: Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image` to automatically optimize images. This may incur additional usage or cost from your provider. See: https://nextjs.org/docs/messages/no-img-element @next/next/no-img-element
06:59:58.713
06:59:58.714 ./src/components/meamor/UserManagementSection.tsx
06:59:58.714 84:6 Warning: React Hook useEffect has a missing dependency: 'fetchUserData'. Either include it or remove the dependency array. react-hooks/exhaustive-deps
06:59:58.714 350:35 Warning: Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image` to automatically optimize images. This may incur additional usage or cost from your provider. See: https://nextjs.org/docs/messages/no-img-element @next/next/no-img-element
06:59:58.714 437:31 Warning: Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image` to automatically optimize images. This may incur additional usage or cost from your provider. See: https://nextjs.org/docs/messages/no-img-element @next/next/no-img-element
06:59:58.714
06:59:58.714 ./src/components/ui/Logo.tsx
06:59:58.714 38:7 Warning: Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image` to automatically optimize images. This may incur additional usage or cost from your provider. See: https://nextjs.org/docs/messages/no-img-element @next/next/no-img-element
06:59:58.714
06:59:58.715 ./src/components/ui/Toast.tsx
06:59:58.716 41:6 Warning: React Hook useEffect has a missing dependency: 'handleClose'. Either include it or remove the dependency array. react-hooks/exhaustive-deps
06:59:58.716
06:59:58.716 ./src/components/ui/ToastContainer.tsx
06:59:58.716 36:6 Warning: React Hook useCallback has a missing dependency: 'removeToast'. Either include it or remove the dependency array. react-hooks/exhaustive-deps
06:59:58.716
06:59:58.716 ./src/lib/database-seed.ts
06:59:58.717 10:3 Warning: Unexpected console statement. no-console
06:59:58.717 11:3 Warning: Unexpected console statement. no-console
06:59:58.717
06:59:58.717 ./src/lib/errors/handlers/ai.ts
06:59:58.717 106:5 Warning: Unexpected console statement. no-console
06:59:58.717
06:59:58.717 ./src/lib/errors/handlers/backend.ts
06:59:58.717 105:5 Warning: Unexpected console statement. no-console
06:59:58.717
06:59:58.717 ./src/lib/errors/handlers/frontend.ts
06:59:58.717 78:5 Warning: Unexpected console statement. no-console
06:59:58.718 84:5 Warning: Unexpected console statement. no-console
06:59:58.718
06:59:58.718 ./src/lib/langgraph/workflow-with-db.ts
06:59:58.718 670:3 Warning: Unexpected console statement. no-console
06:59:58.718
06:59:58.718 ./src/lib/prompt-manager.ts
06:59:58.720 114:5 Warning: Unexpected console statement. no-console
06:59:58.720 265:11 Warning: Unexpected console statement. no-console
06:59:58.721 339:5 Warning: Unexpected console statement. no-console
06:59:58.721 351:5 Warning: Unexpected console statement. no-console
06:59:58.721 405:5 Warning: Unexpected console statement. no-console
06:59:58.722 471:5 Warning: Unexpected console statement. no-console
06:59:58.722
06:59:58.722 ./src/lib/prompt-test-runner.ts
06:59:58.722 55:5 Warning: Unexpected console statement. no-console
06:59:58.722 56:5 Warning: Unexpected console statement. no-console
06:59:58.723 58:5 Warning: Unexpected console statement. no-console
06:59:58.723 70:7 Warning: Unexpected console statement. no-console
06:59:58.723 247:9 Warning: Unexpected console statement. no-console
06:59:58.723 383:5 Warning: Unexpected console statement. no-console
06:59:58.725 386:7 Warning: Unexpected console statement. no-console
06:59:58.726 388:7 Warning: Unexpected console statement. no-console
06:59:58.726 406:5 Warning: Unexpected console statement. no-console
06:59:58.726 430:5 Warning: Unexpected console statement. no-console
06:59:58.726 431:5 Warning: Unexpected console statement. no-console
06:59:58.726 434:5 Warning: Unexpected console statement. no-console
06:59:58.727 444:5 Warning: Unexpected console statement. no-console
06:59:58.727 451:5 Warning: Unexpected console statement. no-console
06:59:58.727 461:5 Warning: Unexpected console statement. no-console
06:59:58.727 463:5 Warning: Unexpected console statement. no-console
06:59:58.728 470:7 Warning: Unexpected console statement. no-console
06:59:58.728 483:7 Warning: Unexpected console statement. no-console
06:59:58.728 484:7 Warning: Unexpected console statement. no-console
06:59:58.728 497:7 Warning: Unexpected console statement. no-console
06:59:58.729 505:7 Warning: Unexpected console statement. no-console
06:59:58.729 518:7 Warning: Unexpected console statement. no-console
06:59:58.729 527:7 Warning: Unexpected console statement. no-console
06:59:58.729 538:5 Warning: Unexpected console statement. no-console
06:59:58.729 553:7 Warning: Unexpected console statement. no-console
06:59:58.730 569:7 Warning: Unexpected console statement. no-console
06:59:58.730 578:7 Warning: Unexpected console statement. no-console
06:59:58.730 589:5 Warning: Unexpected console statement. no-console
06:59:58.730 596:9 Warning: Unexpected console statement. no-console
06:59:58.731 604:9 Warning: Unexpected console statement. no-console
06:59:58.731 606:11 Warning: Unexpected console statement. no-console
06:59:58.731 616:9 Warning: Unexpected console statement. no-console
06:59:58.731 617:9 Warning: Unexpected console statement. no-console
06:59:58.732 625:9 Warning: Unexpected console statement. no-console
06:59:58.732 627:11 Warning: Unexpected console statement. no-console
06:59:58.732 633:9 Warning: Unexpected console statement. no-console
06:59:58.732 641:9 Warning: Unexpected console statement. no-console
06:59:58.733 649:9 Warning: Unexpected console statement. no-console
06:59:58.733 656:7 Warning: Unexpected console statement. no-console
06:59:58.733
06:59:58.733 ./src/lib/security/prompt-security-monitor.ts
06:59:58.734 367:7 Warning: Unexpected console statement. no-console
06:59:58.734
06:59:58.734 ./src/lib/utils/jit-user.ts
06:59:58.734 34:3 Warning: Unexpected console statement. no-console
06:59:58.734 58:5 Warning: Unexpected console statement. no-console
06:59:58.735 62:3 Warning: Unexpected console statement. no-console
06:59:58.735 67:5 Warning: Unexpected console statement. no-console
06:59:58.735 71:5 Warning: Unexpected console statement. no-console
06:59:58.736 79:5 Warning: Unexpected console statement. no-console
06:59:58.736 98:9 Warning: Unexpected console statement. no-console
06:59:58.736 116:7 Warning: Unexpected console statement. no-console
06:59:58.736 148:7 Warning: Unexpected console statement. no-console
06:59:58.736 153:5 Warning: Unexpected console statement. no-console
06:59:58.737 161:7 Warning: Unexpected console statement. no-console
06:59:58.737 168:9 Warning: Unexpected console statement. no-console
06:59:58.737
06:59:58.737 ./src/middleware/admin-auth.ts
06:59:58.738 55:5 Warning: Unexpected console statement. no-console
06:59:58.738 74:7 Warning: Unexpected console statement. no-console
06:59:58.738 85:7 Warning: Unexpected console statement. no-console
06:59:58.738 104:5 Warning: Unexpected console statement. no-console
06:59:58.738
06:59:58.739 info - Need to disable some ESLint rules? Learn more here: https://nextjs.org/docs/basic-features/eslint#disabling-rules
07:00:08.447 Collecting page data ...
07:00:10.900 Generating static pages (0/26) ...
07:00:10.991 Error fetching failed payments: n [Error]: Dynamic server usage: Route /api/admin/failed-payments couldn't be rendered statically because it used `headers`. See more info here: https://nextjs.org/docs/messages/dynamic-server-error
07:00:10.992 at c (/vercel/path0/.next/server/chunks/2510.js:1:59227)
07:00:10.992 at l (/vercel/path0/.next/server/app/api/webhooks/clerk/route.js:1:16540)
07:00:10.992 at f (/vercel/path0/.next/server/chunks/2497.js:1:1706)
07:00:10.994 at h (/vercel/path0/.next/server/chunks/2497.js:3:100)
07:00:10.994 at n (/vercel/path0/.next/server/app/api/admin/exchange/route.js:1:6410)
07:00:10.994 at p (/vercel/path0/.next/server/app/api/admin/failed-payments/route.js:1:1610)
07:00:10.994 at /vercel/path0/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:38417
07:00:10.994 at /vercel/path0/node_modules/next/dist/server/lib/trace/tracer.js:140:36
07:00:10.994 at NoopContextManager.with (/vercel/path0/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:7062)
07:00:10.994 at ContextAPI.with (/vercel/path0/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:518) {
07:00:10.994 description: "Route /api/admin/failed-payments couldn't be rendered statically because it used `headers`. See more info here: https://nextjs.org/docs/messages/dynamic-server-error",
07:00:10.994 digest: 'DYNAMIC_SERVER_USAGE'
07:00:10.994 }
07:00:11.235 Error fetching payment analytics: n [Error]: Dynamic server usage: Route /api/admin/payment-analytics couldn't be rendered statically because it used `headers`. See more info here: https://nextjs.org/docs/messages/dynamic-server-error
07:00:11.240 at c (/vercel/path0/.next/server/chunks/2510.js:1:59227)
07:00:11.240 at l (/vercel/path0/.next/server/app/api/webhooks/clerk/route.js:1:16540)
07:00:11.242 at f (/vercel/path0/.next/server/chunks/2497.js:1:1706)
07:00:11.242 at h (/vercel/path0/.next/server/chunks/2497.js:3:100)
07:00:11.242 at n (/vercel/path0/.next/server/app/api/admin/exchange/route.js:1:6410)
07:00:11.242 at p (/vercel/path0/.next/server/app/api/admin/payment-analytics/route.js:1:1637)
07:00:11.242 at /vercel/path0/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:38417
07:00:11.242 at /vercel/path0/node_modules/next/dist/server/lib/trace/tracer.js:140:36
07:00:11.242 at NoopContextManager.with (/vercel/path0/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:7062)
07:00:11.242 at ContextAPI.with (/vercel/path0/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:518) {
07:00:11.242 description: "Route /api/admin/payment-analytics couldn't be rendered statically because it used `headers`. See more info here: https://nextjs.org/docs/messages/dynamic-server-error",
07:00:11.242 digest: 'DYNAMIC_SERVER_USAGE'
07:00:11.242 }
07:00:11.993 Error fetching payment tracking data: n [Error]: Dynamic server usage: Route /api/admin/payment-tracking couldn't be rendered statically because it used `headers`. See more info here: https://nextjs.org/docs/messages/dynamic-server-error
07:00:11.994 at c (/vercel/path0/.next/server/chunks/2510.js:1:59227)
07:00:11.994 at l (/vercel/path0/.next/server/app/api/webhooks/clerk/route.js:1:16540)
07:00:11.994 at f (/vercel/path0/.next/server/chunks/2497.js:1:1706)
07:00:11.994 at h (/vercel/path0/.next/server/chunks/2497.js:3:100)
07:00:11.994 at n (/vercel/path0/.next/server/app/api/admin/exchange/route.js:1:6410)
07:00:11.994 at d (/vercel/path0/.next/server/app/api/admin/payment-tracking/route.js:1:1637)
07:00:11.995 at /vercel/path0/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:38417
07:00:11.995 at /vercel/path0/node_modules/next/dist/server/lib/trace/tracer.js:140:36
07:00:11.995 at NoopContextManager.with (/vercel/path0/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:7062)
07:00:11.995 at ContextAPI.with (/vercel/path0/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:518) {
07:00:11.995 description: "Route /api/admin/payment-tracking couldn't be rendered statically because it used `headers`. See more info here: https://nextjs.org/docs/messages/dynamic-server-error",
07:00:11.995 digest: 'DYNAMIC_SERVER_USAGE'
07:00:11.995 }
07:00:11.995 Generating static pages (6/26)
07:00:12.037 Error fetching popular packages: n [Error]: Dynamic server usage: Route /api/admin/popular-packages couldn't be rendered statically because it used `headers`. See more info here: https://nextjs.org/docs/messages/dynamic-server-error
07:00:12.038 at c (/vercel/path0/.next/server/chunks/2510.js:1:59227)
07:00:12.038 at l (/vercel/path0/.next/server/app/api/webhooks/clerk/route.js:1:16540)
07:00:12.038 at f (/vercel/path0/.next/server/chunks/2497.js:1:1706)
07:00:12.038 at h (/vercel/path0/.next/server/chunks/2497.js:3:100)
07:00:12.038 at n (/vercel/path0/.next/server/app/api/admin/exchange/route.js:1:6410)
07:00:12.038 at c (/vercel/path0/.next/server/app/api/admin/popular-packages/route.js:1:1610)
07:00:12.038 at /vercel/path0/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:38417
07:00:12.038 at /vercel/path0/node_modules/next/dist/server/lib/trace/tracer.js:140:36
07:00:12.039 at NoopContextManager.with (/vercel/path0/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:7062)
07:00:12.039 at ContextAPI.with (/vercel/path0/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:518) {
07:00:12.039 description: "Route /api/admin/popular-packages couldn't be rendered statically because it used `headers`. See more info here: https://nextjs.org/docs/messages/dynamic-server-error",
07:00:12.040 digest: 'DYNAMIC_SERVER_USAGE'
07:00:12.040 }
07:00:12.110 Error fetching revenue stats: n [Error]: Dynamic server usage: Route /api/admin/revenue-stats couldn't be rendered statically because it used `headers`. See more info here: https://nextjs.org/docs/messages/dynamic-server-error
07:00:12.111 at c (/vercel/path0/.next/server/chunks/2510.js:1:59227)
07:00:12.111 at l (/vercel/path0/.next/server/app/api/webhooks/clerk/route.js:1:16540)
07:00:12.112 at f (/vercel/path0/.next/server/chunks/2497.js:1:1706)
07:00:12.112 at h (/vercel/path0/.next/server/chunks/2497.js:3:100)
07:00:12.112 at n (/vercel/path0/.next/server/app/api/admin/exchange/route.js:1:6410)
07:00:12.112 at c (/vercel/path0/.next/server/app/api/admin/revenue-stats/route.js:1:1609)
07:00:12.113 at /vercel/path0/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:38417
07:00:12.113 at /vercel/path0/node_modules/next/dist/server/lib/trace/tracer.js:140:36
07:00:12.113 at NoopContextManager.with (/vercel/path0/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:7062)
07:00:12.114 at ContextAPI.with (/vercel/path0/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:518) {
07:00:12.114 description: "Route /api/admin/revenue-stats couldn't be rendered statically because it used `headers`. See more info here: https://nextjs.org/docs/messages/dynamic-server-error",
07:00:12.114 digest: 'DYNAMIC_SERVER_USAGE'
07:00:12.114 }
07:00:12.165 Error fetching user activity data: n [Error]: Dynamic server usage: Route /api/admin/user-activity couldn't be rendered statically because it used `headers`. See more info here: https://nextjs.org/docs/messages/dynamic-server-error
07:00:12.165 at c (/vercel/path0/.next/server/chunks/2510.js:1:59227)
07:00:12.165 at l (/vercel/path0/.next/server/app/api/webhooks/clerk/route.js:1:16540)
07:00:12.166 at f (/vercel/path0/.next/server/chunks/2497.js:1:1706)
07:00:12.166 at h (/vercel/path0/.next/server/chunks/2497.js:3:100)
07:00:12.166 at n (/vercel/path0/.next/server/app/api/admin/exchange/route.js:1:6410)
07:00:12.166 at d (/vercel/path0/.next/server/app/api/admin/user-activity/route.js:1:1610)
07:00:12.167 at /vercel/path0/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:38417
07:00:12.167 at /vercel/path0/node_modules/next/dist/server/lib/trace/tracer.js:140:36
07:00:12.167 at NoopContextManager.with (/vercel/path0/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:7062)
07:00:12.167 at ContextAPI.with (/vercel/path0/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:518) {
07:00:12.168 description: "Route /api/admin/user-activity couldn't be rendered statically because it used `headers`. See more info here: https://nextjs.org/docs/messages/dynamic-server-error",
07:00:12.168 digest: 'DYNAMIC_SERVER_USAGE'
07:00:12.168 }
07:00:12.197 Generating static pages (12/26)
07:00:12.206 Error fetching user stats: n [Error]: Dynamic server usage: Route /api/admin/user-stats couldn't be rendered statically because it used `headers`. See more info here: https://nextjs.org/docs/messages/dynamic-server-error
07:00:12.206 at c (/vercel/path0/.next/server/chunks/2510.js:1:59227)
07:00:12.208 at l (/vercel/path0/.next/server/app/api/webhooks/clerk/route.js:1:16540)
07:00:12.208 at f (/vercel/path0/.next/server/chunks/2497.js:1:1706)
07:00:12.209 at h (/vercel/path0/.next/server/chunks/2497.js:3:100)
07:00:12.209 at n (/vercel/path0/.next/server/app/api/admin/exchange/route.js:1:6410)
07:00:12.209 at c (/vercel/path0/.next/server/app/api/admin/user-stats/route.js:1:1609)
07:00:12.209 at /vercel/path0/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:38417
07:00:12.209 at /vercel/path0/node_modules/next/dist/server/lib/trace/tracer.js:140:36
07:00:12.210 at NoopContextManager.with (/vercel/path0/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:7062)
07:00:12.210 at ContextAPI.with (/vercel/path0/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:518) {
07:00:12.210 description: "Route /api/admin/user-stats couldn't be rendered statically because it used `headers`. See more info here: https://nextjs.org/docs/messages/dynamic-server-error",
07:00:12.210 digest: 'DYNAMIC_SERVER_USAGE'
07:00:12.211 }
07:00:12.251 Debug auth error: n [Error]: Dynamic server usage: Route /api/debug-auth couldn't be rendered statically because it used `headers`. See more info here: https://nextjs.org/docs/messages/dynamic-server-error
07:00:12.253 at c (/vercel/path0/.next/server/chunks/2510.js:1:59227)
07:00:12.254 at l (/vercel/path0/.next/server/app/api/webhooks/clerk/route.js:1:16540)
07:00:12.255 at f (/vercel/path0/.next/server/chunks/2497.js:1:1706)
07:00:12.261 at h (/vercel/path0/.next/server/chunks/2497.js:3:100)
07:00:12.261 at p (/vercel/path0/.next/server/app/api/debug-auth/route.js:1:1575)
07:00:12.261 at /vercel/path0/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:38417
07:00:12.262 at /vercel/path0/node_modules/next/dist/server/lib/trace/tracer.js:140:36
07:00:12.264 at NoopContextManager.with (/vercel/path0/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:7062)
07:00:12.264 at ContextAPI.with (/vercel/path0/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:518)
07:00:12.264 at NoopTracer.startActiveSpan (/vercel/path0/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:18093) {
07:00:12.264 description: "Route /api/debug-auth couldn't be rendered statically because it used `headers`. See more info here: https://nextjs.org/docs/messages/dynamic-server-error",
07:00:12.265 digest: 'DYNAMIC_SERVER_USAGE'
07:00:12.265 }
07:00:12.587 Generating static pages (19/26)
07:00:13.021 ✓ Generating static pages (26/26)
07:00:13.537 Finalizing page optimization ...
07:00:13.538 Collecting build traces ...
07:00:23.235
07:00:23.251 Route (app) Size First Load JS
07:00:23.251 ┌ ƒ / 24.6 kB 188 kB
07:00:23.252 ├ ƒ /\_not-found 873 B 88.1 kB
07:00:23.252 ├ ƒ /api/admin/campaigns/first-payment/toggle 0 B 0 B
07:00:23.252 ├ ƒ /api/admin/exchange 0 B 0 B
07:00:23.252 ├ ƒ /api/admin/failed-payments 0 B 0 B
07:00:23.252 ├ ƒ /api/admin/force-session-refresh 0 B 0 B
07:00:23.252 ├ ƒ /api/admin/payment-analytics 0 B 0 B
07:00:23.253 ├ ƒ /api/admin/payment-tracking 0 B 0 B
07:00:23.253 ├ ƒ /api/admin/popular-packages 0 B 0 B
07:00:23.253 ├ ƒ /api/admin/refresh-session 0 B 0 B
07:00:23.253 ├ ƒ /api/admin/revenue-stats 0 B 0 B
07:00:23.253 ├ ƒ /api/admin/rewards 0 B 0 B
07:00:23.253 ├ ƒ /api/admin/security/alerts 0 B 0 B
07:00:23.253 ├ ƒ /api/admin/user-activity 0 B 0 B
07:00:23.253 ├ ƒ /api/admin/user-management 0 B 0 B
07:00:23.253 ├ ƒ /api/admin/user-stats 0 B 0 B
07:00:23.253 ├ ƒ /api/campaigns/first-payment/status 0 B 0 B
07:00:23.254 ├ ƒ /api/cards 0 B 0 B
07:00:23.254 ├ ƒ /api/coins/exchange 0 B 0 B
07:00:23.254 ├ ƒ /api/coins/exchange-rates 0 B 0 B
07:00:23.254 ├ ƒ /api/credits/spend 0 B 0 B
07:00:23.254 ├ ƒ /api/credits/transactions 0 B 0 B
07:00:23.254 ├ ƒ /api/debug-auth 0 B 0 B
07:00:23.254 ├ ƒ /api/dev/set-admin 0 B 0 B
07:00:23.254 ├ ƒ /api/exchange/process 0 B 0 B
07:00:23.254 ├ ƒ /api/exchange/rate 0 B 0 B
07:00:23.255 ├ ƒ /api/exchange/settings 0 B 0 B
07:00:23.255 ├ ƒ /api/gamification/levels 0 B 0 B
07:00:23.255 ├ ƒ /api/health 0 B 0 B
07:00:23.255 ├ ƒ /api/payments/confirm 0 B 0 B
07:00:23.255 ├ ƒ /api/payments/create-intent 0 B 0 B
07:00:23.255 ├ ƒ /api/payments/history 0 B 0 B
07:00:23.255 ├ ƒ /api/payments/packages 0 B 0 B
07:00:23.256 ├ ƒ /api/payments/webhook 0 B 0 B
07:00:23.256 ├ ƒ /api/readings/[id] 0 B 0 B
07:00:23.256 ├ ƒ /api/readings/[id]/save 0 B 0 B
07:00:23.256 ├ ƒ /api/readings/ask 0 B 0 B
07:00:23.256 ├ ƒ /api/readings/history 0 B 0 B
07:00:23.256 ├ ƒ /api/readings/save 0 B 0 B
07:00:23.256 ├ ƒ /api/referrals/claim-first-reading 0 B 0 B
07:00:23.256 ├ ƒ /api/referrals/process 0 B 0 B
07:00:23.256 ├ ƒ /api/referrals/rewards 0 B 0 B
07:00:23.257 ├ ƒ /api/referrals/status 0 B 0 B
07:00:23.257 ├ ƒ /api/referrals/validate 0 B 0 B
07:00:23.257 ├ ƒ /api/reviews/[readingId] 0 B 0 B
07:00:23.257 ├ ƒ /api/user/credits 0 B 0 B
07:00:23.257 ├ ƒ /api/user/profile 0 B 0 B
07:00:23.257 ├ ƒ /api/webhooks/clerk 0 B 0 B
07:00:23.257 ├ ƒ /ask 13.6 kB 175 kB
07:00:23.257 ├ ƒ /exchange 5.95 kB 158 kB
07:00:23.257 ├ ƒ /history 11.1 kB 182 kB
07:00:23.257 ├ ƒ /meamor 7.93 kB 169 kB
07:00:23.257 ├ ƒ /packages 14.9 kB 176 kB
07:00:23.258 ├ ƒ /packages/success 1.46 kB 155 kB
07:00:23.258 ├ ƒ /payments 5.34 kB 176 kB
07:00:23.258 ├ ƒ /profile 10.3 kB 181 kB
07:00:23.258 └ ƒ /sign-in 2.45 kB 107 kB
07:00:23.258 + First Load JS shared by all 87.2 kB
07:00:23.258 ├ chunks/117-ba2b79790b63a0cb.js 31.6 kB
07:00:23.258 ├ chunks/fd9d1056-83183a6606feb869.js 53.6 kB
07:00:23.258 └ other shared chunks (total) 1.97 kB
07:00:23.258
07:00:23.260
07:00:23.261 ƒ Middleware 120 kB
07:00:23.266
07:00:23.266 ƒ (Dynamic) server-rendered on demand
07:00:23.266
07:00:23.412 Traced Next.js server files in: 27.685ms
07:00:24.018 Created all serverless functions in: 605.057ms
07:00:24.157 Collected static files (public/, static/, .next/static): 14.897ms
07:00:24.260 Build Completed in /vercel/output [1m]
07:00:24.480 Deploying outputs...
07:00:35.472 Deployment completed
07:00:36.272 Creating build cache...
07:00:56.397 Created build cache: 20.123s
07:00:56.398 Uploading build cache [248.35 MB]
07:00:59.424 Build cache uploaded: 3.027s
