# Builder State-of-the-Art Evolution Plan

> **Goal**: Elevate `/builder` to Figma/Linear/Vercel Canvas level with world-class Developer Experience (DX) and User Experience (UX).

**Branch**: `feature/builder-state-of-art`  
**Status**: Planning  
**Created**: 2025-03-02

---

## Current State Summary

| Area             | Current                                | Gap                                           |
| ---------------- | -------------------------------------- | --------------------------------------------- |
| **Edges**        | Static default ReactFlow edges         | No animation, no gradient, no flow indication |
| **Auto Layout**  | Instant jump to new positions          | No spring/transition animation                |
| **Add Node**     | Click sidebar → node appears at center | No drag-and-drop from sidebar                 |
| **Organization** | Flat canvas only                       | No frames/groups/sub-workflows                |
| **Navigation**   | No minimap                             | Hard to navigate large flows                  |
| **Context Menu** | None                                   | No right-click actions                        |
| **Shortcuts**    | Fixed panel bottom-right               | No CMD+K command palette                      |
| **Keyboard**     | Full shortcuts exist                   | Could surface via CMD+K                       |

---

## Phase 1: Dinamismo e Animações de Fluxo (Edges)

### 1.1 Linhas de Conexão Animadas

**Objetivo**: Edges que comunicam estado (execução) e hierarquia visual.

**Implementação**:

- Criar custom edge types em `src/components/builder/edges/`:
  - `AnimatedFlowEdge`: partículas/círculo animado ao longo do path quando `isRunning` (via `data.isRunning` ou contexto de execução)
  - `GradientEdge`: degradê da cor do node de origem para o node de destino (usar `getBezierPath`, `BaseEdge`, SVG `linearGradient` com `id` único)
- ReactFlow suporta `edgeTypes`; registrar tipos e aplicar via `type` em cada edge
- Prop `animated` nativo do ReactFlow para dash animation como fallback leve
- **Arquivos**: `workflow-to-reactflow.ts` (adicionar `type` e `data` às edges), novo `animated-flow-edge.tsx`, `gradient-edge.tsx`

**Dependências**: Nenhuma (SVG + CSS animations)

**Estimativa**: 2–3 dias

---

### 1.2 Auto-Layout com Spring Animation

**Objetivo**: Transição suave ao invés de "pulo" instantâneo.

**Implementação**:

- **Opção A (recomendada)**: Usar `@xyflow/react` `nodeOrigin` + `transitionDuration` (se disponível em v12) ou interpolar posições no cliente
- **Opção B**: Framer Motion – adicionar `framer-motion` e animar `position` dos nodes via `motion` wrapper ou `animate` em `useEffect` quando layout muda
- **Opção C**: CSS `transition` em `transform` – ReactFlow usa `transform` para posição; ao atualizar nodes com novas posições, aplicar `transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)` via `style` ou className
- Fluxo: `handleAutoLayout` → API retorna novas posições → atualizar nodes em batches com `requestAnimationFrame` ou animação por frame
- **Arquivos**: `builder-canvas.tsx`, `auto-layout.ts` (API), possivelmente `canvas-node.tsx`

**Dependências**: `framer-motion` (opcional, ~30kb) ou CSS puro

**Estimativa**: 1–2 dias

---

## Phase 2: Micro-Interações de Drag & Drop

### 2.1 Drag do Sidebar para o Canvas

**Objetivo**: Arrastar node do sidebar e soltar no ponto exato do canvas.

**Implementação**:

- Sidebar: `draggable={true}` nos botões de node, `onDragStart` com `dataTransfer.setData('application/reactflow', JSON.stringify({ type, label }))`
- Canvas: `onDrop` e `onDragOver` no container do ReactFlow (ou wrapper)
- `onDragOver`: `e.preventDefault()`, `e.dataTransfer.dropEffect = 'move'`
- `onDrop`: `e.preventDefault()`, `screenToFlowPosition({ x: e.clientX, y: e.clientY })`, chamar `handleAddNode(type, position)` com posição exata
- Ghost/drag preview: `e.dataTransfer.setDragImage(customElement, offsetX, offsetY)` ou usar `DataTransfer.setDragImage` com elemento estilizado
- **Arquivos**: `node-sidebar.tsx`, `builder-canvas.tsx`, `handleAddNode` (aceitar posição opcional)

**Dependências**: HTML5 Drag and Drop API (nativo)

**Estimativa**: 1–2 dias

---

## Phase 3: Organização de Workflows Complexos

### 3.1 Frames / Sub-workflows (Agrupamento)

**Objetivo**: Retângulos estilo Figma para agrupar nodes em "Fase 1", "Fase 2", etc.

**Implementação**:

- ReactFlow v12 suporta **Parent Nodes** (nodes que contêm outros nodes)
- Criar tipo `frame` como node especial: `position: absolute`, `style: { width, height }`, filhos com `parentId`
- Ou usar **Group** do ReactFlow se disponível
- UI: botão "Add Frame" ou desenhar retângulo (lasso) para criar frame em volta da seleção
- Estilo: `bg-white/5 backdrop-blur border border-white/10 rounded-lg` (glassmorphic)
- Label editável no canto do frame
- **Arquivos**: `canvas-node.tsx` (novo tipo `frame`), `workflow-types.ts` (adicionar `frame`), `builder-canvas.tsx`, API de nodes

**Dependências**: ReactFlow Parent Nodes

**Estimativa**: 3–4 dias

---

### 3.2 Minimap Glassmorphic

**Objetivo**: MiniMap no canto inferior esquerdo para navegação em fluxos grandes.

**Implementação**:

- ReactFlow exporta `MiniMap` de `@xyflow/react`
- Adicionar `<MiniMap nodeColor="#fff" nodeStrokeColor="#fff" maskColor="rgba(0,0,0,0.6)" className="!bg-transparent rounded-lg border border-white/10 backdrop-blur" />`
- Posicionar `absolute bottom-4 left-4` (atualmente o shortcuts está em `right-4`)
- Estilo glassmorphic: `bg-card/40 backdrop-blur-xl border border-white/10 rounded-lg`
- **Arquivos**: `builder-canvas.tsx`

**Dependências**: Nenhuma (componente nativo)

**Estimativa**: 0.5 dia

---

## Phase 4: Acessibilidade e Ferramentas Globais

### 4.1 Custom Context Menu (Botão Direito)

**Objetivo**: Menu contextual ao clicar com botão direito em node ou no fundo.

**Implementação**:

- Usar `@radix-ui/react-context-menu` (já no projeto)
- `ContextMenu` no container do ReactFlow com `onContextMenu` para capturar posição
- Ou usar `ReactFlow` prop `onPaneContextMenu` e `onNodeContextMenu`
- Opções no node: Duplicar, Copiar, Deletar, Adicionar Comentário (placeholder futuro)
- Opções no pane (fundo): Colar, Auto Layout, Adicionar Frame
- **Arquivos**: `builder-canvas.tsx`, novo `builder-context-menu.tsx`

**Dependências**: Radix Context Menu (já instalado)

**Estimativa**: 1–2 dias

---

### 4.2 Command Palette (CMD+K / ?)

**Objetivo**: Substituir caixa fixa de shortcuts por palette estilo Linear/Vercel.

**Implementação**:

- Projeto já tem `cmdk` e `Command`/`CommandDialog` em `src/components/ui/command.tsx`
- Criar `BuilderCommandPalette` que abre com `Cmd+K` (Mac) ou `Ctrl+K` (Win)
- Grupos: Ações (Save, Undo, Redo, Auto Layout), Navegação (Zoom In/Out, Fit View), Adicionar Node (Agent, Start, End, …)
- Atalho `?` para abrir "Shortcuts help" ou integrar no mesmo palette
- Remover ou minimizar o painel fixo de shortcuts no canto
- **Arquivos**: `builder-canvas.tsx`, novo `builder-command-palette.tsx`

**Dependências**: cmdk (já instalado)

**Estimativa**: 1–2 dias

---

### 4.3 Shortcuts Visíveis (Complementar)

**Objetivo**: Manter atalhos rápidos (Ctrl+Shift+S, etc.) e documentá-los no CMD+K.

**Implementação**:

- Todos os shortcuts já existem; garantir que `CommandShortcut` no palette mostre `Ctrl+S`, `Ctrl+Z`, etc.
- Opcional: toast sutil ao executar ação via shortcut ("Saved" com ícone)

**Estimativa**: 0.5 dia (junto com 4.2)

---

## Phase 5: Polish e Testes

### 5.1 Testes

- Unit: `AnimatedFlowEdge`, `GradientEdge`, `BuilderCommandPalette`
- E2E: Drag from sidebar to canvas, context menu actions, CMD+K open/close
- Acessibilidade: `aria-label`, foco no command palette, navegação por teclado

### 5.2 Performance

- Lazy load `BuilderCommandPalette` e `MiniMap` se necessário
- Debounce em animações de edges para fluxos com muitas conexões

---

## Ordem de Execução Sugerida

| #   | Fase                                 | Prioridade                    | Esforço  |
| --- | ------------------------------------ | ----------------------------- | -------- |
| 1   | 4.2 Command Palette (CMD+K)          | Alta – impacto imediato na DX | 1–2 dias |
| 2   | 4.1 Context Menu                     | Alta                          | 1–2 dias |
| 3   | 2.1 Drag Sidebar → Canvas            | Alta                          | 1–2 dias |
| 4   | 1.1 Edges Animadas (gradient + flow) | Média                         | 2–3 dias |
| 5   | 3.2 Minimap                          | Média                         | 0.5 dia  |
| 6   | 1.2 Auto-Layout Spring               | Média                         | 1–2 dias |
| 7   | 3.1 Frames                           | Média–Baixa (mais complexo)   | 3–4 dias |

**Total estimado**: ~12–18 dias de desenvolvimento

---

## Arquivos Principais a Criar/Modificar

| Arquivo                                               | Ação                                               |
| ----------------------------------------------------- | -------------------------------------------------- |
| `src/components/builder/edges/animated-flow-edge.tsx` | Criar                                              |
| `src/components/builder/edges/gradient-edge.tsx`      | Criar                                              |
| `src/components/builder/edges/index.ts`               | Criar                                              |
| `src/components/builder/builder-command-palette.tsx`  | Criar                                              |
| `src/components/builder/builder-context-menu.tsx`     | Criar                                              |
| `src/components/builder/node-sidebar.tsx`             | Modificar (drag)                                   |
| `src/components/builder/builder-canvas.tsx`           | Modificar (drop, palette, context, minimap, edges) |
| `src/lib/builder/workflow-to-reactflow.ts`            | Modificar (edge types)                             |
| `package.json`                                        | Opcional: `framer-motion` para spring              |

---

## Referências

- [React Flow 12 – Custom Edges](https://reactflow.dev/learn/customization/custom-edges)
- [React Flow – Animating Edges](https://reactflow.dev/examples/edges/animating-edges)
- [React Flow – MiniMap](https://reactflow.dev/api-reference/components/minimap)
- [cmdk – Command Menu](https://cmdk.paco.me/)
- [Radix Context Menu](https://www.radix-ui.com/primitives/docs/components/context-menu)
