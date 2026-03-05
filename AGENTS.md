# Frontend PetShop - Cloud Agent Instructions

## Repositório
- **GitHub**: PetShop-Saas/frontend
- **Stack**: Next.js 13, React 18, Ant Design, Tailwind

## Cursor Cloud - Instruções específicas

### Setup ao iniciar
1. O `install` roda `npm ci`
2. O frontend inicia em `npm run dev` (porta 3000)
3. Variável: `NEXT_PUBLIC_API_URL` (http://localhost:3001 para backend local)

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
