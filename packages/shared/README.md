# @opengenset/shared

Code that `admin` and `storefront` need verbatim. Nothing framework-specific beyond `react` and `next-intl` peers, and nothing that encodes a different domain rule per app.

## What belongs here

- Identical in both apps, or divergent only by accident.
- A stable interface that neither app needs to change independently.
- Used by at least two apps.

## What does not

- `session.ts`, `api-client.ts`, `env.ts` — admin and storefront model different actors (staff vs customer) and read different session cookies. Their divergence is the design.
- `messages/**` — admin copy and storefront copy are different products.
- `components/ui/**` — shadcn components are vendored per app; move only the ones that are byte-identical and then add `transpilePackages` plus a Tailwind `@source` for the package.

## Import

```ts
import { routing } from "@opengenset/shared/routing";
import { HTTP_STATUS } from "@opengenset/shared/constants";
import { rateLimit } from "@opengenset/shared/rate-limit";
```

Next.js resolves these as TypeScript source through `transpilePackages`, so there is no build step and no publish step.
