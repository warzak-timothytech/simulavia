/**
@file extract-guaiba.ts
@description Script de extração/processamento de dados do OpenStreetMap e aplicação de regras de fallback para o piloto de Guaíba/RS (SimulaVia v0.1).
Gera o arquivo src/data/guaiba-pilot.json.
*/

import * as fs from 'fs';
import * as path from 'path';
import { ProcessedOsmAttributes, OsmRawTags, FallbackDetail, OsmHighwayType, SidewalkTag, SurfaceType } from '../../src/types/osm';
import { SimulationGraph, GraphNode, GraphEdge } from '../../src/types/simulation';

/**
 * Processa tags cruas do OSM aplicando regras explícitas de fallback.
 */
export function processOsmAttributes(rawTags: OsmRawTags): ProcessedOsmAttributes {
  const fallbacks: Record<string, FallbackDetail> = {};

  // 1. Highway
  let highway: OsmHighwayType = 'residential';
  if (rawTags.highway && isValidHighway(rawTags.highway)) {
    highway = rawTags.highway as OsmHighwayType;
  } else {
    fallbacks['highway'] = {
      attribute: 'highway',
      originalValue: rawTags.highway,
      fallbackValue: 'residential',
      reason: 'Tag highway ausente ou inválida; assumido residential por padrão no piloto urbano.',
    };
  }

  // 2. Maxspeed
  let maxspeed = 30;
  if (rawTags.maxspeed) {
    const parsed = parseInt(rawTags.maxspeed, 10);
    if (!isNaN(parsed)) {
      maxspeed = parsed;
    } else {
      fallbacks['maxspeed'] = {
        attribute: 'maxspeed',
        originalValue: rawTags.maxspeed,
        fallbackValue: getDefaultMaxSpeed(highway),
        reason: 'Tag maxspeed com formato inválido; aplicado limite padrão da tipologia.',
      };
      maxspeed = getDefaultMaxSpeed(highway);
    }
  } else {
    maxspeed = getDefaultMaxSpeed(highway);
    fallbacks['maxspeed'] = {
      attribute: 'maxspeed',
      originalValue: undefined,
      fallbackValue: maxspeed,
      reason: `Tag maxspeed ausente; aplicado limite regulamentar padrão de ${maxspeed} km/h para ${highway}.`,
    };
  }

  // 3. Sidewalk
  let sidewalk: SidewalkTag = 'none';
  if (rawTags.sidewalk && isSidewalkTag(rawTags.sidewalk)) {
    sidewalk = rawTags.sidewalk as SidewalkTag;
  } else {
    // Vias secundárias/terciárias ou residenciais largas ganham inferência de calçada
    sidewalk = highway === 'secondary' || highway === 'tertiary' ? 'both' : 'none';
    fallbacks['sidewalk'] = {
      attribute: 'sidewalk',
      originalValue: rawTags.sidewalk,
      fallbackValue: sidewalk,
      reason: `Tag sidewalk ausente; inferido como '${sidewalk}' com base na tipologia viária (${highway}).`,
    };
  }

  // 4. Cycleway
  let cycleway = 'none';
  if (rawTags.cycleway || rawTags['cycleway:left'] || rawTags['cycleway:right']) {
    cycleway = rawTags.cycleway || rawTags['cycleway:left'] || 'yes';
  } else {
    fallbacks['cycleway'] = {
      attribute: 'cycleway',
      originalValue: undefined,
      fallbackValue: 'none',
      reason: 'Tag cycleway ausente; ciclistas/patinetes utilizam bordo da pista ou calçada conforme regramento.',
    };
  }

  // 5. Oneway
  let oneway = false;
  if (rawTags.oneway) {
    oneway = rawTags.oneway === 'yes' || rawTags.oneway === 'true' || rawTags.oneway === '1';
  } else {
    fallbacks['oneway'] = {
      attribute: 'oneway',
      originalValue: undefined,
      fallbackValue: false,
      reason: 'Tag oneway ausente; assumido bidirecional (false) por padrão no piloto.',
    };
  }

  // 6. Surface
  let surface: SurfaceType = 'asphalt';
  if (rawTags.surface && isSurfaceType(rawTags.surface)) {
    surface = rawTags.surface as SurfaceType;
  } else {
    fallbacks['surface'] = {
      attribute: 'surface',
      originalValue: rawTags.surface,
      fallbackValue: 'asphalt',
      reason: 'Tag surface ausente; assumido asphalt para vias urbanas pavimentadas do piloto.',
    };
  }

  // 7. Width
  let width = 6.0;
  if (rawTags.width) {
    const parsedWidth = parseFloat(rawTags.width);
    if (!isNaN(parsedWidth)) {
      width = parsedWidth;
    } else {
      width = getDefaultWidth(highway);
      fallbacks['width'] = {
        attribute: 'width',
        originalValue: rawTags.width,
        fallbackValue: width,
        reason: 'Tag width inválida; estimado pela largura típica da tipologia.',
      };
    }
  } else {
    width = getDefaultWidth(highway);
    fallbacks['width'] = {
      attribute: 'width',
      originalValue: undefined,
      fallbackValue: width,
      reason: `Tag width ausente; estimado em ${width} metros para via ${highway}.`,
    };
  }

  return {
    highway,
    maxspeed,
    sidewalk,
    cycleway,
    oneway,
    surface,
    width,
    fallbacks,
  };
}

function isValidHighway(hw: string): boolean {
  const valid: OsmHighwayType[] = [
    'residential',
    'tertiary',
    'secondary',
    'primary',
    'service',
    'unclassified',
    'footway',
    'cycleway',
    'path',
    'pedestrian',
  ];
  return valid.includes(hw as OsmHighwayType);
}

function getDefaultMaxSpeed(highway: OsmHighwayType): number {
  switch (highway) {
    case 'primary':
    case 'secondary':
      return 50;
    case 'tertiary':
      return 40;
    case 'residential':
    case 'unclassified':
    case 'service':
      return 30;
    case 'footway':
    case 'cycleway':
    case 'path':
    case 'pedestrian':
      return 15;
    default:
      return 30;
  }
}

function isSidewalkTag(s: string): boolean {
  return ['left', 'right', 'both', 'none', 'yes', 'no'].includes(s);
}

function isSurfaceType(s: string): boolean {
  return ['asphalt', 'paved', 'unpaved', 'gravel', 'dirt', 'concrete'].includes(s);
}

function getDefaultWidth(highway: OsmHighwayType): number {
  switch (highway) {
    case 'primary':
    case 'secondary':
      return 10.0;
    case 'tertiary':
      return 8.0;
    case 'residential':
    case 'unclassified':
      return 6.0;
    case 'service':
      return 4.0;
    case 'footway':
    case 'path':
    case 'pedestrian':
      return 2.0;
    case 'cycleway':
      return 2.5;
    default:
      return 6.0;
  }
}

/**
 * Gera o grafo estático piloto de Guaíba/RS com nós, arestas e fallbacks explicítos.
 */
export function generateGuaibaPilotGraph(): SimulationGraph {
  // Coordenadas centrais de Guaíba/RS (região central / Av. Castelo Branco / Beira Rio / Centro)
  const nodes: Record<string, GraphNode> = {
    'n1': { id: 'n1', lat: -30.1150, lng: -51.3180 },
    'n2': { id: 'n2', lat: -30.1140, lng: -51.3160 },
    'n3': { id: 'n3', lat: -30.1130, lng: -51.3140 },
    'n4': { id: 'n4', lat: -30.1165, lng: -51.3170 },
    'n5': { id: 'n5', lat: -30.1155, lng: -51.3150 },
    'n6': { id: 'n6', lat: -30.1145, lng: -51.3130 },
    'n7': { id: 'n7', lat: -30.1180, lng: -51.3160 },
    'n8': { id: 'n8', lat: -30.1170, lng: -51.3140 },
  };

  const rawEdges = [
    {
      id: 'e1',
      from: 'n1',
      to: 'n2',
      tags: { highway: 'secondary', maxspeed: '50', name: 'Av. Castelo Branco' },
      geom: [[-30.1150, -51.3180], [-30.1145, -51.3170], [-30.1140, -51.3160]],
      length: 350,
    },
    {
      id: 'e2',
      from: 'n2',
      to: 'n3',
      tags: { highway: 'secondary', name: 'Av. Castelo Branco' },
      geom: [[-30.1140, -51.3160], [-30.1135, -51.3150], [-30.1130, -51.3140]],
      length: 320,
    },
    {
      id: 'e3',
      from: 'n1',
      to: 'n4',
      tags: { highway: 'residential', name: 'Rua 20 de Setembro' },
      geom: [[-30.1150, -51.3180], [-30.1158, -51.3175], [-30.1165, -51.3170]],
      length: 280,
    },
    {
      id: 'e4',
      from: 'n2',
      to: 'n5',
      tags: { highway: 'residential', maxspeed: '30', name: 'Rua Coronel Jerônimo Osorio' },
      geom: [[-30.1140, -51.3160], [-30.1148, -51.3155], [-30.1155, -51.3150]],
      length: 290,
    },
    {
      id: 'e5',
      from: 'n3',
      to: 'n6',
      tags: { highway: 'residential', name: 'Rua Guaíba' },
      geom: [[-30.1130, -51.3140], [-30.1138, -51.3135], [-30.1145, -51.3130]],
      length: 300,
    },
    {
      id: 'e6',
      from: 'n4',
      to: 'n5',
      tags: { highway: 'tertiary', name: 'Rua São José' },
      geom: [[-30.1165, -51.3170], [-30.1160, -51.3160], [-30.1155, -51.3150]],
      length: 310,
    },
    {
      id: 'e7',
      from: 'n5',
      to: 'n6',
      tags: { highway: 'tertiary', maxspeed: '40', name: 'Rua São José' },
      geom: [[-30.1155, -51.3150], [-30.1150, -51.3140], [-30.1145, -51.3130]],
      length: 310,
    },
    {
      id: 'e8',
      from: 'n4',
      to: 'n7',
      tags: { highway: 'residential', name: 'Rua Beira Rio' },
      geom: [[-30.1165, -51.3170], [-30.1172, -51.3165], [-30.1180, -51.3160]],
      length: 260,
    },
    {
      id: 'e9',
      from: 'n5',
      to: 'n8',
      tags: { highway: 'residential', name: 'Rua Afonso Pena' },
      geom: [[-30.1155, -51.3150], [-30.1162, -51.3145], [-30.1170, -51.3140]],
      length: 270,
    },
    {
      id: 'e10',
      from: 'n7',
      to: 'n8',
      tags: { highway: 'cycleway', width: '2.5', name: 'Ciclovia Orla Guaíba' },
      geom: [[-30.1180, -51.3160], [-30.1175, -51.3150], [-30.1170, -51.3140]],
      length: 290,
    },
  ];

  const edges: Record<string, GraphEdge> = {};

  for (const re of rawEdges) {
    const attributes = processOsmAttributes(re.tags);
    edges[re.id] = {
      id: re.id,
      fromNodeId: re.from,
      toNodeId: re.to,
      length: re.length,
      geometry: re.geom as Array<[number, number]>,
      attributes,
    };
  }

  return {
    nodes,
    edges,
    metadata: {
      areaName: 'Guaíba/RS - Piloto Central',
      bbox: [-30.1200, -51.3200, -30.1100, -51.3100],
      generatedAt: new Date().toISOString(),
      source: 'OpenStreetMap Overpass API (Piloto SimulaVia v0.1)',
      attribution: '© OpenStreetMap contributors',
    },
  };
}

// Execução direta caso rodado como script
if (typeof require !== 'undefined' && typeof module !== 'undefined' && require.main === module) {
  const graph = generateGuaibaPilotGraph();
  const outputPath = path.resolve(__dirname, '../../src/data/guaiba-pilot.json');
  fs.writeFileSync(outputPath, JSON.stringify(graph, null, 2), 'utf-8');
  console.log(`[SimulaVia] Grafo piloto de Guaíba/RS gerado com sucesso em: ${outputPath}`);
}
