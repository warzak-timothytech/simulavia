# SimulaVia Constitution

## Core Principles

### I. Arquitetura Client-First e Custo Zero
Todo o núcleo de simulação deve rodar no navegador do usuário, sem necessidade de servidores pagos ou infraestrutura complexa no v0.1. O motor de simulação deve ser determinístico, escrito em TypeScript puro e executado em Web Worker para manter a interface fluida.

### II. Transparência de Dados Abertos e Fallbacks Explícitos
Os mapas e grafos viários baseiam-se em dados abertos do OpenStreetMap, com atribuição obrigatória `© OpenStreetMap contributors`. Quando atributos viários (como existência de calçada, ciclofaixa ou sentido de via) estiverem ausentes ou incompletos no OSM, o sistema deve aplicar regras de fallback documentadas e explícitas em vez de falhar silenciosamente.

### III. Escopo Exploratório e Educativo (v0.1)
O SimulaVia v0.1 é um protótipo exploratório e educativo. Não inclui autenticação de usuários, não simula transporte coletivo pesado (ônibus/BRT) e não constitui laudo técnico, parecer viário ou projeto oficial de engenharia de tráfego.

### IV. Foco em Micromobilidade e Interface Mobile-First
A simulação foca na convivência entre patinetes elétricos (autopropelidos), bicicletas elétricas (e-bikes), pedestres e carros, tomando como referência geral o Código de Trânsito Brasileiro (CTB) e a Resolução CONTRAN 996. A interface deve priorizar o uso mobile-first com mapa em tela cheia e controles em painel *bottom-sheet*.

## Additional Constraints & Scope
- **Cenário piloto:** Guaíba, RS (com preparação arquitetural para futuras áreas delimitadas, como recorte aproximado de 2 km × 2 km via OpenStreetMap / grafo estático).
- **Renderização:** MapLibre GL JS combinado com Canvas/Deck.gl para visualização de agentes e pontos de conflito (como circulação na calçada e contramão).

## Development Workflow & Quality Gates
- Manter separação clara entre o núcleo determinístico em TypeScript puro (testável sem depender do DOM/navegador) e a camada visual/de interface.
- Versionar especificações (`constitution`, `spec`, `plan`, `tasks`) e código em commits pequenos e rastreáveis no GitHub.

## Governance
Esta constituição estabelece as diretrizes fundamentais do SimulaVia v0.1 e prevalece sobre escolhas pontuais de implementação. Alterações relevantes de escopo ou arquitetura devem ser registradas neste arquivo com atualização da versão e da data.

**Version**: 0.1.0 | **Ratified**: 2026-11-27 | **Last Amended**: 2026-11-27
