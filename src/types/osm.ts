/**
@file osm.ts
@description Definições de tipos TypeScript para atributos do OpenStreetMap (OSM) e regras de fallback para o SimulaVia v0.1.
*/

export type OsmHighwayType =
  | 'residential'
  | 'tertiary'
  | 'secondary'
  | 'primary'
  | 'service'
  | 'unclassified'
  | 'footway'
  | 'cycleway'
  | 'path'
  | 'pedestrian';

export type SidewalkTag = 'left' | 'right' | 'both' | 'none' | 'yes' | 'no';

export type SurfaceType = 'asphalt' | 'paved' | 'unpaved' | 'gravel' | 'dirt' | 'concrete';

export interface OsmRawTags {
  highway?: string;
  maxspeed?: string;
  sidewalk?: string;
  cycleway?: string;
  'cycleway:left'?: string;
  'cycleway:right'?: string;
  oneway?: string;
  surface?: string;
  width?: string;
  name?: string;
  [key: string]: string | undefined;
}

export interface FallbackDetail {
  attribute: string;
  originalValue: unknown;
  fallbackValue: unknown;
  reason: string;
}

export interface ProcessedOsmAttributes {
  highway: OsmHighwayType;
  maxspeed: number; // em km/h
  sidewalk: SidewalkTag;
  cycleway: string;
  oneway: boolean;
  surface: SurfaceType;
  width: number; // em metros
  fallbacks: Record<string, FallbackDetail>;
}
