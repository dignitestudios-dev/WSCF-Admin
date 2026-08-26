<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# WSCF Admin Panel

Next.js 16 admin panel for the Wisconsin Scholastic Chess Federation. It is a
pure client of the WSCF backend (`../WSCF_Backend`) — there are no API routes
and no server-side data access of its own.

## Commands

```bash
npm run dev      # next dev
npm run build    # next build
npm start        # next start
npm run lint     # eslint
npx tsc --noEmit # typecheck (currently clean)
```

There is no test setup.

## Environment

One variable, and **no `.env` file is committed** — create `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:3050/
```

Without it, `src/lib/axios.ts` falls back to the **production** API
(`https://api.wisconsinscholasticchess.org/`). Running `npm run dev` with no
env file therefore points local UI at live data — set it before starting.

## Architecture

### Two layers: routes and features

`src/app/` holds routing and page composition only. All data access and domain
logic lives in `src/features/<domain>/`. Page-local presentational pieces sit in
a route's own `_components/` folder (not a route segment, because of the
underscore).

```
src/app/(auth)/…      login, forgot-password, verify-otp, reset-password
src/app/(main)/…      dashboard, tournaments, users, teams, membership,
                      notifications, result-uploader, coupons,
                      current-enrolled-users
                      (also `forms`, still routed but hidden from the nav —
                       the dynamic registration form is switched off)
src/features/<x>/     components/ hooks/ schema/ services/ types/
src/components/ui/    shadcn primitives
src/components/layout admin-layout, sidebar, topbar
src/lib/              axios, cookie, queryClient, utils
```

### The data flow is fixed — follow it

```
component → hook (TanStack Query) → service (axios) → backend
```

- **service** (`features/<x>/services/<x>.service.ts`) — the only place
  `axiosInstance` is called. Exports one object with async methods, plus the
  response interfaces.
- **hook** (`features/<x>/hooks/use-*.ts`) — one file per operation.
  `useQuery` for reads; `useMutation` for writes, which must
  `invalidateQueries` for affected keys and surface failures with
  `toast.error(error?.response?.data?.message || 'fallback')`.
- **schema** (`features/<x>/schema/*.schema.ts`) — Zod, wired to forms through
  `react-hook-form` + `@hookform/resolvers`.

Query keys are plain arrays including every parameter, e.g.
`['tournaments', page, limit, search, status]`. Defaults live in
`src/lib/queryClient.ts`: 5-minute `staleTime`, `retry: 1`, no refetch on focus.

### Auth

JWT in a **cookie** named `token`, written by `use-login` via
`src/lib/cookie.ts` (plain `document.cookie`, 7 days, not HttpOnly — it must be
readable by JS for the axios interceptor).

- Request interceptor attaches `Authorization: Bearer <token>`.
- Response interceptor clears the cookie on **401** and hard-redirects to
  `/login`.
- `src/proxy.ts` gates routes at the edge: no token → `/login`; token on an
  auth route → `/`.

`localStorage` is used only for two transient bits: `reset-pass-token` and the
OTP countdown `otp-timer-expires`.

### Next.js 16 specifics

- **`src/proxy.ts` is middleware.** Next 16 renamed `middleware.ts` → `proxy.ts`
  with the same `matcher` config. Don't create a `middleware.ts`.
- `reactCompiler: true` is on (`next.config.ts`), with
  `babel-plugin-react-compiler`. Avoid hand-written `useMemo`/`useCallback`
  unless profiling says otherwise.
- Remote images are allow-listed by `images.domains` — S3 buckets in both
  `us-east-1` and `us-east-2`, plus `images.unsplash.com`.
- Read `node_modules/next/dist/docs/` before relying on remembered Next APIs;
  this version differs from most training data.

## Backend integration

Base URL + `/…`, all admin endpoints. Current surface in use:

| Domain | Endpoints |
|---|---|
| auth | `/auth/admin/signin`, `/forgot-password`, `/verify-otp`, `/reset-password`, `/logout` |
| dashboard | `/dashboard/kpis` |
| tournaments | `/tournament`, `/tournament/{id}`, `/tournament/{id}/participants`, `…/participants/export`, `/tournament/user-history/{userId}` |
| users | `/user`, `/user/{id}`, `/user/{id}/activate`, `/user/{id}/deactivate`, `/user/export` |
| teams | `/team`, `/team/{id}`, `/team/{teamId}/members` (GET list, POST add, DELETE bulk remove), `/team/{teamId}/members/{userId}` |
| membership | `/membership/admin/all`, `/membership/admin/export` |
| notifications | `/notification/send-bulk`, `/notification/send-individual` |

The backend envelope is `{ success, message, data, pagination? }`; services
return `response.data` and components read `.data.<collection>`.

## Known issues

These are real and worth knowing before changing related code.

- **Free tournaments cannot be created.** `tournament-form.tsx` hardcodes
  `isPaid: true` on submit, and the Zod schema requires `entryFee > 0`. The
  backend supports `isPaid: false` with `entryFee: 0`.
- **`divisionName: d.divisionType || 'Unknown'`** — `'Unknown'` is not in the
  backend enum (`K`, `K1` … `K12`), so an incomplete conditional division is
  rejected server-side rather than caught in the form.
- **`condition` differs across the boundary.** The UI uses `over`, the API uses
  `above`; `tournament-form.tsx` translates both ways. Keep that mapping intact.
- **~58 explicit `any`** across services and hooks, concentrated in mutation
  payloads and error handlers, so request shapes are largely unchecked.
- **No error boundaries.** Failures surface only as toasts.

## Removed from the product

- **Schools.** The module is gone from backend, admin and player, and the
  `schools` collection was dropped. Teams are unrelated and unaffected.
- **The dynamic registration form is switched off, not deleted.** Registration
  collects a division and nothing else. The `/forms` screens, the
  `/tournament/form-fields` endpoints and `registrationData` all still exist and
  still work — nothing reaches them. The server accepts field answers if any are
  sent but never requires them, so putting the UI back is all that is needed.

## Toasts

Both apps must look the same. `components/ui/sonner.tsx` sets `unstyled: true`
— without it sonner's own base styles outrank the `classNames` and none of the
styling applies. Call sites import `toast` from `@/lib/toast`, not from sonner
directly; that wrapper supplies the "Success"/"Error" heading and puts the
message in the description, matching the player app.
