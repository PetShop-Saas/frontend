# AGENTS.md

## Cursor Cloud specific instructions

### Project overview

PetFlow is a multi-tenant SaaS frontend for pet shops and veterinary clinics, built with **Next.js 13.5.6** (Pages Router), **TypeScript**, **Ant Design 5.x**, and **Tailwind CSS 3.x**. The backend API is a separate service; its URL is configured via the `NEXT_PUBLIC_API_URL` environment variable (see `next.config.js` for the default).

### Node version

This project requires **Node 18** (matching the Dockerfile). Use `nvm use 18` before running any commands.

### Common commands

All scripts are in `package.json`:

| Task | Command |
|---|---|
| Dev server | `npm run dev` (port 3000) |
| Lint | `npm run lint` (runs `next lint`) |
| Type-check | `npm run type-check` (runs `tsc --noEmit`) |
| Unit tests | `npm run test:unit` (Jest + RTL) |
| Full test suite | `npm run test` (type-check + lint + coverage) |
| E2E tests | `npm run test:e2e` (Playwright, requires backend) |
| Build | `npm run build` |

### Known issues

- `npm run build` fails due to pre-existing ESLint errors in `src/components/PermissionGate.stories.tsx` (unescaped entities). The dev server and all tests work fine.
- The `next.config.js` has `eslint.ignoreDuringBuilds: false`, so lint errors block builds.

### Backend dependency

The frontend is non-functional without the backend API. Without it, pages render but all API calls fail with "Erro de conexão". Unit tests are fully mocked and pass without the backend. E2E tests (Playwright) require both frontend and backend running.

### Registration flow

The only registration entry point is `/complete-registration` (multi-step wizard with plan selection and payment). All links from `/login`, `LandingHeader`, and the landing page (`/`) point to `/complete-registration`.
