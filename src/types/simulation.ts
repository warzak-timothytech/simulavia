/**
@file simulation.ts
@description Definições de tipos TypeScript para nós, arestas, estados de agentes, parâmetros de simulação e mensagens do Web Worker no SimulaVia v0.1.
*/

import { ProcessedOsmAttributes } from './osm';

export interface GraphNode {
  id: string;
  lat: number;
  lng: number;
  elevation?: number;
}

export interface GraphEdge {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  length: number; // em metros
  geometry: Array<[number, number]>; // [[lat, lng], ...]
  attributes: ProcessedOsmAttributes;
}

export interface SimulationGraph {
  nodes: Record<string, GraphNode>;
  edges: Record<string, GraphEdge>;
  metadata: {
    areaName: string;
    bbox: [number, number, number, number]; // [minLat, minLng, maxLat, maxLng]
    generatedAt: string;
    source: string;
    attribution: string;
  };
}

export type AgentType = 'pedestrian' | 'scooter' | 'ebike' | 'car';

export type AgentBehaviorState = 'moving' | 'stopped' | 'conflicted' | 'arrived';

export interface AgentState {
  id: string;
  type: AgentType;
  currentEdgeId: string;
  progress: number; // 0.0 a 1.0 ao longo da aresta atual
  speed: number; // em m/s
  targetSpeed: number; // em m/s
  route: string[]; // IDs dos nós até o destino
  routeIndex: number; // índice atual no array route
  behaviorState: AgentBehaviorState;
  hasConflict: boolean;
  distanceTraveled: number; // em metros
  waitTime: number; // em segundos
}

export interface SimulationParameters {
  seed: number;
  timeStep: number; // duração de cada tick em segundos (ex: 0.5s ou 1.0s)
  duration: number; // duração total da simulação em segundos
  agentCounts: {
    pedestrian: number;
    scooter: number;
    ebike: number;
    car: number;
  };
  behavioralPreferences?: {
    scooterOnSidewalkProbability: number; // proporção de patinetes na calçada vs pista
    ebikeRespectCycleway: number; // proporção de e-bikes respeitando ciclofaixa
  };
}

export interface ConflictEvent {
  id: string;
  timestamp: number;
  edgeId: string;
  position: [number, number]; // [lat, lng]
  agentIds: string[];
  conflictType: 'sidewalk_crowding' | 'wrong_way' | 'car_micromobility_conflict' | 'speed_dispute';
  severity: 'low' | 'medium' | 'high';
}

export interface SimulationMetrics {
  timestamp: number;
  activeAgents: {
    pedestrian: number;
    scooter: number;
    ebike: number;
    car: number;
  };
  averageSpeeds: {
    pedestrian: number;
    scooter: number;
    ebike: number;
    car: number;
  };
  totalConflicts: number;
  conflictsByType: Record<string, number>;
  averageWaitTime: number;
}

export interface SimulationState {
  time: number; // segundos decorridos
  isRunning: boolean;
  agents: AgentState[];
  conflicts: ConflictEvent[];
  metrics: SimulationMetrics;
}

export interface SimulationSummary {
  totalDuration: number;
  totalTripsCompleted: number;
  totalConflictsRecorded: number;
  averageSpeedOverall: number;
  metricsHistory: SimulationMetrics[];
}

// Mensagens do Web Worker
export type WorkerInputMessage =
  | { type: 'INIT'; graph: SimulationGraph; params: SimulationParameters }
  | { type: 'START' }
  | { type: 'PAUSE' }
  | { type: 'STEP' }
  | { type: 'SET_PARAMS'; params: Partial<SimulationParameters> }
  | { type: 'RESET' };

export type WorkerOutputMessage =
  | { type: 'READY' }
  | { type: 'TICK_UPDATE'; state: SimulationState }
  | { type: 'COMPLETE'; summary: SimulationSummary }
  | { type: 'ERROR'; message: string };
