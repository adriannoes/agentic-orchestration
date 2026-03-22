# Code Review Sprint S4 — Plano de Endereçamento

> **Branch**: `feat/design-system-s4-auth-webgl`
> **Code Review**: `code-review-sprint-S4.md`

---

## Resumo do Plano

| Grupo | Subagent | Itens | Arquivos |
|-------|----------|-------|----------|
| 1 | Canvas + Performance | 2.2, 2.3, DPR type, WebGLErrorBoundary interface | `canvas-bg.tsx` |
| 2 | Pages + Dynamic Import | 2.1, Suspense, bg-background | `login/page.tsx`, `signup/page.tsx` |
| 3 | Auth Forms + Styles | 2.4, indentation, ghostAuthClassName, spring config, card classes | `login-form.tsx`, `signup-form.tsx`, `auth-styles.ts` |
| 4 | Tests + E2E | WebGLErrorBoundary test, console error suppression | `canvas-bg.test.tsx`, `console-errors.spec.ts` |
| 5 | Auth-redirect | JSDoc restore | `auth-redirect.ts` |

---

## Required Fixes (Must Address)

### 2.1 Missing `next/dynamic` — Subagent 2
- `login/page.tsx`, `signup/page.tsx`: Lazy-load `CanvasBg` com `dynamic(..., { ssr: false })`

### 2.2 RenderTrigger rAF Loop — Subagent 1
- `canvas-bg.tsx`: Trocar rAF por `setTimeout` com TARGET_FPS=20 (~67% menos GPU)

### 2.3 Duplicate useIsMobile — Subagent 1
- `canvas-bg.tsx`: Usar `useIsMobile` de `@/hooks/use-mobile`, remover useEffect+resize

### 2.4 catch (err: any) — Subagent 3
- `login-form.tsx`: `catch (err: unknown)` + mensagem polida

---

## Tech-Specific Bug Hunt

- **Suspense**: Subagent 2 — Wrap CanvasBg com `<Suspense fallback={...}>`
- **WebGLErrorBoundary test**: Subagent 4 — Teste que fallback CSS renderiza quando Canvas falha
- **E2E WebGL suppression**: Subagent 4 — Padrões mais específicos
- **Indentation**: Subagent 3 — Prettier/ESLint nos auth forms
- **ghostInputClassName**: Subagent 3 — Renomear para `ghostAuthClassName` (inputs + buttons)
- **bg-background fallback**: Subagent 2 — Adicionar ao outer div das pages

---

## Improvements

- **DPR tuple**: Subagent 1 — `const dpr: [number, number] = ...`
- **Spring config**: Subagent 3 — `authMountTransition` em auth-styles.ts
- **Card ghost classes**: Subagent 3 — `ghostCardClassName` em auth-styles.ts
- **WebGLErrorBoundary interface**: Subagent 1 — `interface WebGLErrorBoundaryState`
- **auth-redirect JSDoc**: Subagent 5 — Restaurar JSDoc sobre allowlisting ASAP

---

## Verificação Final

```bash
npx tsc --noEmit
npx vitest run
npm run check
npm run build
npx playwright test e2e/marketplace.spec.ts
npx playwright test e2e/console-errors.spec.ts
```

---

## Status de Execução (Concluído)

| Item | Status |
|------|--------|
| 2.1 next/dynamic | ✅ login + signup |
| 2.2 RenderTrigger throttled | ✅ TARGET_FPS=20 |
| 2.3 useIsMobile | ✅ |
| 2.4 catch (err: unknown) | ✅ |
| Suspense boundary | ✅ |
| bg-background fallback | ✅ |
| WebGLErrorBoundary test | ✅ canvas-bg-fallback.test.tsx |
| E2E console suppression | ✅ Padrões específicos |
| Indentation | ✅ Prettier |
| ghostAuthClassName | ✅ |
| authMountTransition | ✅ |
| ghostCardClassName | ✅ |
| WebGLErrorBoundary interface | ✅ |
| auth-redirect JSDoc | ✅ |
| DPR tuple type | ✅ |
| matchMedia polyfill | ✅ src/test/setup.ts |
| builder-canvas empty catch | ✅ Comentário adicionado |

**Nota:** Erros de `tsc` em `canvas-node.tsx`, `node-properties-panel.tsx`, `templates-library.tsx` são pré-existentes e fora do escopo do Sprint S4.
