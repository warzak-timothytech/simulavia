# Feature Specification: SimulaVia — Simulador de Micromobilidade Urbana (Piloto Guaíba/RS)

**Branch**: `001-simulador-micromobilidade`  
**Created**: 2026-11-27  
**Status**: Draft (v0.1 Exploratório)

## 1. Objetivo e Escopo do Protótipo (v0.1)
O **SimulaVia** é uma aplicação web interativa e gratuita (*client-first*, custo zero de servidor) para explorar cenários de convivência viária entre **patinetes elétricos (autopropelidos)**, **bicicletas elétricas (e-bikes)**, **pedestres** e **carros**, com recorte piloto inicial em **Guaíba, RS** (e estrutura preparada para futuras áreas delimitadas, como recortes próximos de ~2 km × 2 km).

### Fora de Escopo no v0.1
- Autenticação ou contas de usuário.
- Simulação de transporte coletivo pesado (ônibus, BRT, lotações).
- Backend pago ou persistência remota obrigatória.
- Emissão de laudo técnico, parecer oficial ou projeto de engenharia de tráfego.

## 2. Cenários de Usuário e Jornadas Principais

### Cenário 1 — Exploração do Piloto em Guaíba no Celular (Mobile-First)
- **Fluxo:** O usuário abre a aplicação em tela cheia com o mapa do recorte piloto de Guaíba/RS e um painel *bottom-sheet* retrátil na parte inferior.
- **Resultado esperado:** O mapa carrega sem travamentos, exibe a atribuição obrigatória `© OpenStreetMap contributors` e permite iniciar/pausar/reiniciar a simulação a partir do *bottom-sheet*.

### Cenário 2 — Observação de Conflitos de Circulação e Contramão
- **Fluxo:** O usuário alterna densidades ou comportamentos de agentes no *bottom-sheet* (ex.: presença de calçada estreita/ausente, ausência de ciclofaixa dedicada, circulação de micromobilidade em calçada ou deslocamento na contramão).
- **Resultado esperado:** O motor determinístico roda em um *Web Worker* e destaca visualmente no mapa os trechos/pontos de conflito de forma reproduzível para a mesma semente (*seed*) e parâmetros.

### Cenário 3 — Transparência de Dados e Regra de Fallback
- **Fluxo:** O usuário inspeciona uma via ou trecho do grafo onde o OpenStreetMap não possui informação explícita (ex.: calçada não mapeada ou sentido indefinido).
- **Resultado esperado:** O sistema aplica uma regra de *fallback* documentada e sinaliza claramente que o comportamento deriva de premissa/fallback e não de cadastro oficial completo.

## 3. Agentes e Referência Normativa (CTB / CONTRAN 996)
- **Pedestres:** deslocamento em passeios/calçadas e travessias, com prioridade em áreas pedonais.
- **Patinetes elétricos / Autopropelidos:** parâmetros de velocidade, faixa de circulação e restrições/diretrizes inspiradas na Resolução CONTRAN 996 e no CTB, modelados como premissas de simulação exploratória.
- **Bicicletas elétricas (e-bikes):** comportamento distinto de velocidade e interação em vias compartilhadas, ciclofaixas/ciclovias ou bordo da pista conforme parâmetros configuráveis.
- **Carros:** fluxo veicular em pista de rolamento, respeitando sentidos de via e regras de preferência/interseção definidas no modelo.

## 4. Requisitos Funcionais e Não Funcionais
- **FR-01 (Determinismo):** Dado o mesmo grafo, *seed* e conjunto de parâmetros, a simulação deve produzir resultados consistentes e reproduzíveis.
- **FR-02 (Isolamento de Thread):** O loop de simulação em TypeScript puro deve rodar em *Web Worker*, mantendo a interface responsiva no *main thread*.
- **FR-03 (Grafo Viário e Fallbacks):** O sistema deve consumir um grafo viário (ex.: pré-empacotado em JSON/GeoJSON para o piloto de Guaíba) e aplicar *fallbacks* explícitos quando tags do OpenStreetMap estiverem ausentes.
- **FR-04 (Visualização):** Renderização do mapa base com MapLibre GL JS e camadas de agentes/conflitos via Canvas / Deck.gl, com painel *bottom-sheet* acessível em telas pequenas.
- **FR-05 (Atribuição e Aviso):** Exibir de forma visível `© OpenStreetMap contributors` e o aviso de caráter exploratório/educativo (não oficial).

## 5. Critérios de Aceitação (v0.1)
- A simulação executa localmente no navegador sem exigir servidor de aplicação.
- Pelo menos um recorte piloto de Guaíba/RS é carregado com *fallbacks* documentados para atributos ausentes.
- Os quatro perfis de agentes (pedestre, patinete elétrico/autopropelido, e-bike e carro) interagem no modelo e geram métricas/marcadores visuais de conflito.
- O layout funciona confortavelmente em viewport mobile (mapa em tela cheia + *bottom-sheet*) e desktop.
