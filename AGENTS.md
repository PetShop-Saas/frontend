# Frontend PetShop - Cloud Agent Instructions

## Repositório
- **GitHub**: PetShop-Saas/frontend
- **Stack**: Next.js 13, React 18, Ant Design, Tailwind

## Cursor Cloud specific instructions

### Project overview

PetFlow is a multi-tenant SaaS frontend for pet shops and veterinary clinics, built with **Next.js 13.5.6** (Pages Router), **TypeScript**, **Ant Design 5.x**, and **Tailwind CSS 3.x**. The backend API is a separate service; its URL is configured via the `NEXT_PUBLIC_API_URL` environment variable (see `next.config.js` for the default).

### Node version

This project requires **Node 18** (matching the Dockerfile). Use `nvm use 18` before running any commands.

### Setup ao iniciar
1. O `install` clona o backend (PetShop-Saas/backend) em `./backend/` e instala dependências de ambos
2. Dois terminais iniciam: **Backend** (porta 3001) e **Frontend** (porta 3000)
3. O backend precisa de `DATABASE_URL` e `JWT_SECRET` nos Secrets do Cursor
4. Variável: `NEXT_PUBLIC_API_URL` configurada via Secrets

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

### Testes E2E
Os testes Playwright rodam com backend e frontend já em execução. O backend está em `./backend/`.
Antes de rodar `npm run test:e2e`, aguarde ~20s para ambos iniciarem, ou use um health check loop no endpoint `/health` do backend.

### Ao trabalhar em issues
1. Criar branch: `fix/issue-{N}` ou `feat/issue-{N}`
2. Implementar conforme requisitos
3. Rodar testes: `npm run test:ci` e `npm run test:e2e` (requer backend rodando)
4. Commit: `fix: descrição (Closes #N)`
5. Push e PR: `gh pr create --body "Closes #N"`

### Known issues

- `npm run build` fails due to pre-existing ESLint errors in `src/components/PermissionGate.stories.tsx` (unescaped entities). The dev server and all tests work fine.
- The `next.config.js` has `eslint.ignoreDuringBuilds: false`, so lint errors block builds.

### Backend dependency

The frontend is non-functional without the backend API. Without it, pages render but all API calls fail with "Erro de conexão". Unit tests are fully mocked and pass without the backend. E2E tests (Playwright) require both frontend and backend running.

### Registration flow

The only registration entry point is `/complete-registration` (multi-step wizard with plan selection and payment). All links from `/login`, `LandingHeader`, and the landing page (`/`) point to `/complete-registration`.

### Estrutura
- `src/pages/` - páginas Next.js
- `src/components/` - componentes reutilizáveis
- `src/services/` - API client
- `e2e/` - testes Playwright
