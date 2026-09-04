---
name: API codegen and Zod compatibility
description: OpenAPI codegen may emit Zod 4 shorthand even when the workspace catalog still resolves Zod 3.
---

When adding OpenAPI integer or URI formats, verify the generated Zod output against the workspace's installed Zod major version. If codegen emits `z.int()` or `z.url()` but the project uses Zod 3, prefer compatible OpenAPI constraints or update the dependency deliberately.

**Why:** The workspace currently uses a Zod 3 catalog pin while the installed Orval version emits newer Zod shorthand for some OpenAPI formats.

**How to apply:** Run API codegen before wiring new generated hooks, and use the chained library typecheck to catch schema compatibility immediately.