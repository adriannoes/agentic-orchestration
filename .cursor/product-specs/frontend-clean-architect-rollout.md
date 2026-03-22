# Plano de Migração Visual Clean Architect

## Objetivo

Alinhar o frontend ao padrão "The Clean Architect" (base zinc + indigo/violet, tipografia Geist, minimalismo funcional), com rollout faseado para minimizar regressão e sem quebrar as interações existentes do builder.

## Fase 0 — Baseline e critérios

- Criar e usar uma única branch para todo o rollout visual: `feat/clean-architect-rollout`.
- Revisar exatamente o que entrou na PR #2 (arquivos, decisões visuais e impactos no builder) e ajustar este plano antes de iniciar a implementação das fases.
- Definir checklist visual e técnico de aceite (contraste, borda 1px, redução de glow, consistência de estados hover/focus).
- Congelar baseline de telas críticas para comparação: `/`, `/builder`, `/connectors`, `/marketplace`, `/mcp`, `/runs`, `/settings`.
- Confirmar que o builder mantém as animações/interações atuais e só recebe ajustes visuais controlados.

Arquivos de referência:

- [src/app/globals.css](src/app/globals.css)
- [src/app/layout.tsx](src/app/layout.tsx)
- [src/components/builder/builder-canvas.tsx](src/components/builder/builder-canvas.tsx)

## Fase 1 — Design tokens e shell global

- Ajustar tokens globais para paleta Clean Architect (dark zinc predominante, contraste alto, acentos indigo/violet discretos).
- Padronizar tipografia Geist (sans/mono) e seleção de texto (`selection:bg-indigo-500/30`) no layout.
- Garantir comportamento de tema: dark por padrão + opção de light disponível apenas em Settings.
- Consolidar uso do `cn()` (`clsx + tailwind-merge`) nas bases de UI quando houver conflito de classes.

Arquivos-alvo:

- [src/app/globals.css](src/app/globals.css)
- [src/app/layout.tsx](src/app/layout.tsx)
- [src/components/theme-provider.tsx](src/components/theme-provider.tsx)
- [src/lib/utils.ts](src/lib/utils.ts)
- [src/components/sidebar.tsx](src/components/sidebar.tsx)

## Fase 2 — Primitives Shadcn e consistência de componentes

- Harmonizar primitives para o novo visual (botões, cards, inputs, badges, separators, dialogs, scroll areas, command).
- Remover inconsistências de sombra/blur excessivo nas primitives e padronizar focus rings.
- Validar impacto transversal em páginas que já usam essas primitives.

Arquivos-alvo (mínimo):

- [src/components/ui/button.tsx](src/components/ui/button.tsx)
- [src/components/ui/card.tsx](src/components/ui/card.tsx)
- [src/components/ui/input.tsx](src/components/ui/input.tsx)
- [src/components/ui/badge.tsx](src/components/ui/badge.tsx)
- [src/components/ui/separator.tsx](src/components/ui/separator.tsx)
- [src/components/ui/scroll-area.tsx](src/components/ui/scroll-area.tsx)
- [src/components/ui/command.tsx](src/components/ui/command.tsx)
- [src/components/ui/dialog.tsx](src/components/ui/dialog.tsx)
- [src/components/ui/context-menu.tsx](src/components/ui/context-menu.tsx)

## Fase 3 — Páginas de catálogo e dashboards

- Aplicar visual consistente em cards/listagens e estados de página (empty/loading/error) sem alterar regras de negócio.
- Reduzir cores ad-hoc e migrar para semântica do tema.
- Uniformizar espaçamentos, densidade e hierarquia tipográfica das páginas principais.

Arquivos-alvo (prioritários):

- [src/components/agents-dashboard.tsx](src/components/agents-dashboard.tsx)
- [src/components/templates-library.tsx](src/components/templates-library.tsx)
- [src/components/tools-library.tsx](src/components/tools-library.tsx)
- [src/components/connector-registry.tsx](src/components/connector-registry.tsx)
- [src/components/integration-marketplace.tsx](src/components/integration-marketplace.tsx)
- [src/components/mcp-manager.tsx](src/components/mcp-manager.tsx)
- [src/components/runs-history.tsx](src/components/runs-history.tsx)

## Fase 4 — Builder (somente refinamento visual)

- Manter eventos, atalhos, drag/drop, context menus e animações já funcionais.
- Ajustar aparência para Clean Architect: menos glow, menos gradiente chamativo, bordas sutis e contraste claro.
- Validar legibilidade de nós, conexões, toolbar e painéis laterais em dark e light.

Arquivos-alvo (prioritários):

- [src/components/builder/builder-canvas.tsx](src/components/builder/builder-canvas.tsx)
- [src/components/builder/canvas-node.tsx](src/components/builder/canvas-node.tsx)
- [src/components/builder/node-sidebar.tsx](src/components/builder/node-sidebar.tsx)
- [src/components/builder/node-properties-panel.tsx](src/components/builder/node-properties-panel.tsx)
- [src/components/builder/builder-context-menu.tsx](src/components/builder/builder-context-menu.tsx)
- [src/components/builder/builder-command-palette.tsx](src/components/builder/builder-command-palette.tsx)

## Fase 5 — Tooling de qualidade e formatação

- Configurar Prettier com `printWidth: 100` + `prettier-plugin-tailwindcss`.
- Garantir alinhamento com ESLint do Next.js sem relaxar qualidade nas mudanças novas.
- Validar que ajustes de formatação não introduzem ruído desnecessário (aplicar incrementalmente por arquivos tocados em cada fase).

Arquivos-alvo:

- [package.json](package.json)
- [eslint.config.mjs](eslint.config.mjs)
- [.prettierrc](.prettierrc)
- [prettier.config.mjs](prettier.config.mjs)

## Estratégia de entrega e validação

- Execução em branch única com commits atômicos por fase para manter rastreabilidade e facilitar review interno.
- Estrutura recomendada de commits:
  - `docs(plan): adjust phase 0 after pr #2 review`
  - `feat(theme): align globals and layout with clean architect`
  - `refactor(ui): standardize shadcn primitives styling`
  - `refactor(pages): harmonize dashboard and catalog visuals`
  - `refactor(builder): simplify visual effects preserving behavior`
  - `chore(tooling): configure prettier and tailwind plugin`
- Abrir PR única ao final, mas com histórico limpo por fase e validação visual das rotas críticas em cada etapa.
- Executar lint/typecheck/testes relevantes a cada fase.
- Critério de conclusão: consistência visual global no padrão Clean Architect, builder estável e opção de light presente em Settings sem impacto em dark default.
