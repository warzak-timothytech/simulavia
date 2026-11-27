# Implementation Plan: SimulaVia — Simulador de Micromobilidade Urbana (Piloto Guaíba/RS)

**Branch**: `001-simulador-micromobilidade` | **Date**: 2026-11-27 | **Spec**: [specs/001-simulador-micromobilidade/spec.md](spec.md)

**Input**: Feature specification from `/specs/001-simulador-micromobilidade/spec.md`

## Summary

Desenvolvimento do **SimulaVia v0.1**, uma aplicação web interativa e gratuita (*client-first*, custo zero de servidor) para simulação de micromobilidade urbana. Utiliza Vite e TypeScript puro, executando o motor de simulação determinístico (baseado em semente/*seed*) em um *Web Worker* isolado (sem acesso ao DOM). O grafo viário consome dados estáticos pré-processados do OpenStreetMap para o piloto de Guaíba/RS (`src/data/guaiba-pilot.json`), aplicando regras explícitas de *fallback* para tags ausentes (calçada, ciclofaixa e sentido). A renderização combina MapLibre GL JS para o mapa base e Canvas/Deck.gl para agentes e conflitos, com interface *mobile-first* (mapa em tela cheia e painel *bottom-sheet*).

## Technical Context

**Language/Version**: TypeScript 5.x / JavaScript (ESNext)

**Primary Dependencies**: 
- Vite (bundler/dev server)
- MapLibre GL JS (renderização de mapas vetoriais)
- Deck.gl / HTML5 Canvas (renderização de agentes e pontos de conflito em camadas de alta performance)
- Web Workers API (execução isolada do motor de simulação)

**Storage**: Armazenamento estático local (`src/data/guaiba-pilot.json` contendo grafo viário e metadados de *fallback* do piloto de Guaíba/RS). Sem dependência de banco de dados ou backend.

**Testing**: Vitest para testes unitários do motor determinístico, lógica de roteamento e regras de *fallback*.

**Target Platform**: Navegadores web modernos (Desktop e Mobile / Viewport mobile-first).

**Project Type**: Web Application (Client-First / SPA)

**Performance Goals**: 
- 60 FPS na renderização visual do mapa e agentes.
- Execução fluida do loop de simulação no *Web Worker* mantendo o *main thread* responsivo.
- Tempo de carregamento inicial menor que 2 segundos (bundle otimizado via Vite).

**Constraints**: 
- Custo zero de infraestrutura de servidor (totalmente client-first).
- Isolamento total do motor de simulação (Web Worker sem acesso ao DOM).
- Atribuição obrigatória e visível de `© OpenStreetMap contributors`.
- Sem autenticação, sem backend persistente e sem simulação de transporte coletivo pesado no v0.1.

**Scale/Scope**: 
- Recorte piloto urbano em Guaíba, RS (~2 km × 2 km de malha viária estática).
- Suporte a 4 perfis de agentes: pedestres, patinetes elétricos (autopropelidos), e-bikes e carros.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **Princípio I (Client-First e Custo Zero)**: A arquitetura roda inteiramente no navegador, sem backend pago, com motor determinístico em TypeScript executado em Web Worker. (Aprovado)
- [x] **Princípio II (Dados Abertos e Fallbacks)**: Uso de dados do OpenStreetMap com atribuição `© OpenStreetMap contributors` e regras explícitas e documentadas de *fallback* para atributos ausentes. (Aprovado)
- [x] **Princípio III (Escopo v0.1)**: Foco exploratório e educativo, sem autenticação, sem transporte coletivo pesado e sem laudo técnico oficial. (Aprovado)
- [x] **Princípio IV (Micromobilidade e Mobile-First)**: Foco na convivência (CTB / CONTRAN 996) com interface *mobile-first* (mapa em tela cheia e *bottom-sheet*). (Aprovado)

## Project Structure

### Documentation (this feature)

```text
specs/001-simulador-micromobilidade/
├── plan.md              # Este arquivo de plano de implementação
├── research.md          # Pesquisa técnica e decisões de arquitetura
├── data-model.md        # Modelo de dados do grafo, nós, arestas e agentes
├── quickstart.md        # Guia rápido de execução e validação local
└── tasks.md             # Tarefas detalhadas de implementação (gerado pelo /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── types/               # Tipos TypeScript compartilhados (grafo, agentes, estado da simulação, mensagens do worker)
├── data/                # Dados estáticos do piloto (guaiba-pilot.json e utilitários de parser/fallback)
├── simulation/          # Motor determinístico de simulação (lógica de agentes, movimentação, conflitos e Web Worker)
└── ui/                  # Camada de interface e renderização (MapLibre, Deck.gl/Canvas, componentes mobile-first bottom-sheet)

scripts/
└── overpass/            # Scripts utilitários para extração e processamento de dados do Overpass API / OSM para o piloto
```

**Structure Decision**: Estrutura modular em TypeScript puro com separação estrita entre os dados estáticos (`src/data`), tipos (`src/types`), motor de simulação em *Web Worker* (`src/simulation`) e interface visual MapLibre/Deck.gl (`src/ui`), complementada por scripts de extração de dados (`scripts/overpass`).

## Complexity Tracking

*Nenhuma violação da constituição identificada. Escopo alinhado aos princípios do v0.1.*
