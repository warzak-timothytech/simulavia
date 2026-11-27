---
description: "Task list for SimulaVia v0.1 implementation (Micro-mobility simulator pilot in Guaíba/RS)"
---

# Tasks: SimulaVia — Simulador de Micromobilidade Urbana (Piloto Guaíba/RS)

**Input**: Design documents from `/specs/001-simulador-micromobilidade/` (`spec.md`, `plan.md`)

**Organization**: Tasks are grouped by foundational architecture and user stories in priority order, strictly prioritizing type contracts, static graph/fallbacks, deterministic simulation engine + Web Worker, before visual rendering (MapLibre GL JS & bottom-sheet).

## Format: `[ID] [P?] [Story] Description with file path`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., [US1], [US2], [US3])
- Include exact file paths in descriptions.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, Vite configuration, and directory structure setup.

- [ ] T001 Initialize Vite + TypeScript project structure per implementation plan
- [ ] T002 [P] Configure TypeScript compiler options (`tsconfig.json`) and project linting/formatting rules
- [ ] T003 [P] Install core dependencies (MapLibre GL JS, Deck.gl, Vitest) in `package.json`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure, TypeScript type definitions, and static graph with fallback rules that MUST be complete before simulation and UI work.

- [ ] T004 Create TypeScript type definitions for graph nodes, edges, agent states, simulation parameters, and worker messages in `src/types/simulation.ts`
- [ ] T005 [P] Create TypeScript type definitions for OSM attributes and fallback configurations in `src/types/osm.ts`
- [ ] T006 Implement Overpass/OSM data extraction script and fallback processor in `scripts/overpass/extract-guaiba.ts`
- [ ] T007 Generate and save the pre-processed static pilot graph with explicit fallback annotations in `src/data/guaiba-pilot.json`
- [ ] T008 Implement graph parser and fallback validation helper functions in `src/data/graph-loader.ts`
- [ ] T009 [P] Create unit tests for graph loading and fallback application rules in `tests/unit/graph-loader.test.ts`

**Checkpoint**: Foundation ready — TypeScript contracts, static graph, and fallback rules fully operational and tested.

---

## Phase 3: User Story 1 — Motor Determinístico e Web Worker (Priority: P1) 🎯 MVP

**Goal**: Implement the deterministic simulation engine in pure TypeScript, running inside a Web Worker, ensuring reproducible results based on a simulation seed (`seed`) without DOM dependencies.

**Independent Test**: Run unit tests verifying that running the simulation twice with the same seed produces identical agent trajectories and metrics.

### Tests for User Story 1 (Unit & Determinism Tests)
- [ ] T010 [P] [US1] Create unit tests for deterministic pseudo-random number generator and seed management in `tests/unit/rng.test.ts`
- [ ] T011 [P] [US1] Create unit tests for agent movement physics and speed profiles (pedestres, patinetes, e-bikes, carros) in `tests/unit/agent-physics.test.ts`
- [ ] T012 [P] [US1] Create unit tests for deterministic simulation tick execution in `tests/unit/simulation-engine.test.ts`

### Implementation for User Story 1
- [ ] T013 [P] [US1] Implement deterministic RNG and seed utility in `src/simulation/rng.ts`
- [ ] T014 [P] [US1] Implement agent behavior models (pedestres, patinetes autopropelidos, e-bikes, carros) adhering to CTB / CONTRAN 996 premissas in `src/simulation/agents.ts`
- [ ] T015 [US1] Implement core deterministic simulation engine loop, routing, and state updater in `src/simulation/engine.ts` (depends on T013, T014)
- [ ] T016 [US1] Implement Web Worker wrapper for the simulation engine in `src/simulation/simulation.worker.ts` (depends on T015)
- [ ] T017 [US1] Implement worker communication manager and state dispatcher in `src/simulation/worker-client.ts` (depends on T016)

---

## Phase 4: User Story 2 — Conflitos de Circulação, Contramão e Fallbacks (Priority: P2)

**Goal**: Detect conflict points (e.g. micromobility on narrow sidewalks, wrong-way travel) and propagate fallback metadata through the simulation engine.

**Independent Test**: Verify via unit tests and simulation ticks that conflict markers are correctly generated when agents interact on edges lacking dedicated infrastructure.

### Tests for User Story 2
- [ ] T018 [P] [US2] Create unit tests for conflict detection algorithms in `tests/unit/conflict-detector.test.ts`
- [ ] T019 [P] [US2] Create unit tests for fallback impact on agent routing and safety metrics in `tests/unit/fallback-rules.test.ts`

### Implementation for User Story 2
- [ ] T020 [P] [US2] Implement conflict detection module (sidewalk crowding, wrong-way movement, intersection disputes) in `src/simulation/conflicts.ts`
- [ ] T021 [US2] Integrate fallback attributes and conflict metrics into simulation state updates in `src/simulation/engine.ts` (depends on T020)

---

## Phase 5: User Story 3 — Interface Mobile-First com MapLibre GL JS e Bottom-Sheet (Priority: P3)

**Goal**: Provide a full-screen interactive map centered on Guaíba/RS using MapLibre GL JS, rendering agents and conflicts via Deck.gl/Canvas, paired with a collapsible mobile-first bottom-sheet control panel.

**Independent Test**: Open the application in mobile viewport, verify full-screen map loading with `© OpenStreetMap contributors` attribution, start/pause simulation via bottom-sheet, and observe agent rendering.

### Implementation for User Story 3
- [ ] T022 [P] [US3] Create MapLibre GL JS map initialization component with Guaíba initial coordinates and OSM attribution in `src/ui/map-view.ts`
- [ ] T023 [P] [US3] Implement Deck.gl / Canvas layers for rendering static edges, agents, and conflict points in `src/ui/simulation-layers.ts`
- [ ] T024 [P] [US3] Create mobile-first collapsible bottom-sheet control panel component (play/pause/restart, speed control, agent density sliders) in `src/ui/bottom-sheet.ts`
- [ ] T025 [US3] Integrate simulation worker client with UI state and render loops in `src/ui/app-controller.ts` (depends on T017, T022, T023, T024)
- [ ] T026 [US3] Implement main entry point styling (CSS) ensuring responsive mobile-first layout with full-screen map and bottom-sheet in `src/ui/styles.css`

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation, documentation, and build verification.

- [ ] T027 Create quickstart guide and instructions for local execution in `specs/001-simulador-micromobilidade/quickstart.md`
- [ ] T028 Run full test suite (`npm test`) and verify production build (`npm run build`)
- [ ] T029 Perform end-to-end verification of mobile-first layout and simulation responsiveness

---

## Dependencies & Execution Order

### Dependency Graph
- **Phase 1 (Setup)** → **Phase 2 (Foundational)**: Foundational requires Setup.
- **Phase 3 (US1 - Motor + Web Worker)**: Requires Phase 2 (Types & Static Graph).
- **Phase 4 (US2 - Conflitos & Fallbacks)**: Requires Phase 3.
- **Phase 5 (US3 - Interface Visual)**: Requires Phase 3 (Worker client) and Phase 4.
- **Phase 6 (Polish)**: Requires Phase 5.

### Parallel Opportunities
- **Phase 2**: T004 and T005 can run in parallel; T006 and T008 can be structured independently.
- **Phase 3**: T010, T011, T012 (tests) and T013, T014 (RNG & agents) can be developed in parallel.
- **Phase 5**: T022, T023, T024 (UI components) can be implemented in parallel before integration in T025.

### Suggested MVP Scope
- **MVP Milestone**: Phase 1 + Phase 2 + Phase 3 (User Story 1: Deterministic simulation engine running in Web Worker with static Guaíba graph and unit tests). This validates the core client-first architectural requirement before adding the visual UI layer.
