# Frontend PetShop - Cloud Agent Instructions

## Repositório
- **GitHub**: PetShop-Saas/frontend
- **Stack**: Next.js 13, React 18, Ant Design, Tailwind

## Cursor Cloud - Instruções específicas

### Setup ao iniciar
1. O `install` clona o backend (PetShop-Saas/backend) em `./backend/` e instala dependências de ambos
2. Dois terminais iniciam: **Backend** (porta 3001) e **Frontend** (porta 3000)
3. O backend precisa de `DATABASE_URL` e `JWT_SECRET` nos Secrets do Cursor
4. Variável: `NEXT_PUBLIC_API_URL` (http://localhost:3001)

### Testes E2E
Os testes Playwright rodam com backend e frontend já em execução. O backend está em `./backend/`.
Antes de rodar `npm run test:e2e`, aguarde ~20s para ambos iniciarem, ou: `until curl -sf http://localhost:3001/health 2>/dev/null; do sleep 2; done`

### Ao trabalhar em issues
1. Criar branch: `fix/issue-{N}` ou `feat/issue-{N}`
2. Implementar conforme requisitos
3. Rodar testes: `npm run test:ci` e `npm run test:e2e` (requer backend rodando)
4. Commit: `fix: descrição (Closes #N)`
5. Push e PR: `gh pr create --body "Closes #N"`

### Testes
- Unit: `npm run test:ci`
- E2E: `npm run test:e2e` (Playwright - requer backend em localhost:3001)
- Build: `npm run build`

### Estrutura
- `src/pages/` - páginas Next.js
- `src/components/` - componentes reutilizáveis
- `src/services/` - API client
- `e2e/` - testes Playwright
