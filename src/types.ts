/* eslint-disable @typescript-eslint/no-explicit-any */

import { Image } from "@raycast/api";

export enum TransportMode {
  Air = "air",
  Bus = "bus",
  Cableway = "cableway",
  Coach = "coach",
  Funicular = "funicular",
  Lift = "lift",
  Metro = "metro",
  Monorail = "monorail",
  Rail = "rail",
  Tram = "tram",
  Trolleybus = "trolleybus",
  Unknown = "unknown",
  Water = "water",
}

export type StopPlaceQuayDeparturesQuery = {
  stopPlace?: {
    id: string;
    quays?: Array<{
      id: string;
      estimatedCalls: Array<EstimatedCall>;
      situations: Array<{
        id: string;
        situationNumber?: string;
        reportType?: string;
        summary: Array<{ language?: string; value: string }>;
        description: Array<{ language?: string; value: string }>;
        advice: Array<{ language?: string; value: string }>;
        infoLinks?: Array<{ uri: string; label?: string }>;
        validityPeriod?: { startTime?: any; endTime?: any };
      }>;
    }>;
  };
};

export type EstimatedCall = {
  date: any;
  expectedDepartureTime: any;
  aimedDepartureTime: any;
  realtime: boolean;
  cancellation: boolean;
  quay: { id: string };
  destinationDisplay?: { frontText?: string };
  serviceJourney: {
    id: string;
    line: {
      id: string;
      description?: string;
      publicCode?: string;
      transportMode?: TransportMode;
      transportSubmode?: string;
      notices: Array<{ id: string; text?: string }>;
    };
    journeyPattern?: { notices: Array<{ id: string; text?: string }> };
    notices: Array<{ id: string; text?: string }>;
  };
  situations: Array<{
    id: string;
    situationNumber?: string;
    reportType?: string;
    summary: Array<{ language?: string; value: string }>;
    description: Array<{ language?: string; value: string }>;
    advice: Array<{ language?: string; value: string }>;
    infoLinks?: Array<{ uri: string; label?: string }>;
    validityPeriod?: { startTime?: any; endTime?: any };
  }>;
  notices: Array<{ id: string; text?: string }>;
};

export type StopsDetailsQuery = {
  stopPlaces: StopPlace[];
};

export type StopPlace = {
  name: string;
  transportMode?: Array<TransportMode>;
  description?: string;
  id: string;
  latitude?: number;
  longitude?: number;
  quays?: Array<{
    id: string;
    description?: string;
    name: string;
    publicCode?: string;
    stopPlace?: { id: string };
    situations: Array<{
      id: string;
      situationNumber?: string;
      reportType?: string;
      summary: Array<{ language?: string; value: string }>;
      description: Array<{ language?: string; value: string }>;
      advice: Array<{ language?: string; value: string }>;
      infoLinks?: Array<{ uri: string; label?: string }>;
      validityPeriod?: { startTime?: any; endTime?: any };
    }>;
  }>;
};

export type FeatureResponse = {
  features: Feature[];
};

export type Feature = {
  properties: {
    id: string;
    name: string;
    label: string;
    county: string;
  };
};
