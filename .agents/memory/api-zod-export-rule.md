---
name: api-zod export rule
description: lib/api-zod/src/index.ts must only export from ./generated/api to avoid TS2308 ambiguity
---

The rule: `lib/api-zod/src/index.ts` must contain ONLY:
```
export * from "./generated/api";
```

**Why:** Orval generates both `./generated/api` and `./generated/types`. If you also export from `./generated/types`, TypeScript throws TS2308 (ambiguous re-export) because both files export the same type names. The `./generated/api` file already re-exports everything from types.

**How to apply:** After any `pnpm --filter @workspace/api-spec run codegen` run, verify the index.ts still has only the single export line.
