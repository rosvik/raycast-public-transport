import { DeparturesQuery, QuayDepartures } from "./api/departuresQuery";
import { Line } from "./api/fragments";

export type QuayLineFavorites = {
  stopPlaceId: string;
  quayId: string;
  lineIds: string[];
};

export type StopPlaceQuayDeparturesQuery = {
  stopPlace?: DeparturesQuery;
  favorites: QuayDepartures[];
};

export type DirectionType = "unknown" | "outbound" | "inbound" | "clockwise" | "anticlockwise";

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
  Foot = "foot",
}

export type Leg = {
  mode: TransportMode;
  transportSubmode: string; // TODO: make enums like we have for TransportMode?
  distance: number;
  expectedStartTime: string;
  expectedEndTime: string;
  line?: Line;
  fromPlace: {
    quay: {
      publicCode?: string;
      name: string;
      stopPlace: {
        id: string;
      };
    };
  };
  toPlace: {
    quay: {
      publicCode?: string;
      name: string;
      stopPlace: {
        id: string;
      };
    };
  };
  fromEstimatedCall?: {
    destinationDisplay?: DestinationDisplay;
  };
};

export type DestinationDisplay = {
  frontText?: string;
  via?: string[];
};

export type SjEstimatedCall = {
  quay: {
    id: string;
    name: string;
    publicCode?: string;
  };
  aimedDepartureTime: string;
  expectedDepartureTime: string | null;
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
  }>;
};

export type Feature = {
  properties: {
    id: string;
    name: string;
    label: string; // name, locality
    locality?: string; // kommune
    county?: string; // fylke
    category: VenueCategory[];
  };
  geometry: {
    coordinates: [number, number];
  };
};

export type VenueCategory =
  | "onstreetBus"
  | "onstreetTram"
  | "airport"
  | "railStation"
  | "metroStation"
  | "busStation"
  | "coachStation"
  | "tramStation"
  | "harbourPort"
  | "ferryPort"
  | "ferryStop"
  | "liftStation"
  | "vehicleRailInterchange";

export type TripPattern = {
  expectedStartTime: string; // ISO 8601
  expectedEndTime: string; // ISO 8601
  duration: number; // seconds
  distance: number; // meters
  legs: Leg[];
};

export type TripQuery = {
  trip: {
    nextPageCursor: string;
    tripPatterns: TripPattern[];
  };
};
