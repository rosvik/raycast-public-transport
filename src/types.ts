export type QuayLineFavorites = {
  stopPlaceId: string;
  quayId: string;
  lineIds: string[];
};

export type StopPlaceQuayDeparturesQuery = {
  stopPlace?: Departures;
  favorites: QuayDeparture[];
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

export type Departures = {
  id: string;
  name: string;
  description?: string;
  latitude: number;
  longitude: number;
  quays?: Array<QuayDeparture>;
};

export type QuayDeparture = {
  id: string;
  name: string;
  description?: string;
  publicCode?: string;
  estimatedCalls: Array<EstimatedCall>;
};

export type Authority = {
  id: string;
  name: string;
  url?: string;
};

export type Line = {
  id: string;
  description?: string;
  publicCode?: string;
  transportMode?: TransportMode;
  transportSubmode?: string;
  authority?: Authority;
};

export type Leg = {
  mode: TransportMode;
  transportSubmode: string; // TODO: make enums like we have for TransportMode?
  distance: number;
  expectedStartTime: string;
  expectedEndTime: string;
  line?: Line;
  fromPlace: {
    name: string;
    quay: {
      publicCode?: string;
      name: string;
    };
  };
  toPlace: {
    name: string;
    quay: {
      publicCode?: string;
      name: string;
    };
  };
  fromEstimatedCall?: {
    destinationDisplay?: DestinationDisplay;
  };
};

export type EstimatedCall = {
  date: string;
  expectedDepartureTime: string | null;
  aimedDepartureTime: string;
  realtime: boolean;
  predictionInaccurate: boolean;
  cancellation: boolean;
  quay: { id: string };
  destinationDisplay?: DestinationDisplay;
  serviceJourney: {
    id: string;
    directionType: DirectionType;
    line: Line;
    estimatedCalls: Array<SjEstimatedCall>;
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
