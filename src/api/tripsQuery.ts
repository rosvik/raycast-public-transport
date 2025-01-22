import { DestinationDisplay, TransportMode } from "../types";
import { authorityFragment, Line, lineFragment, Quay, quayFragment } from "./fragments";

export type TripQuery = {
  trip: {
    nextPageCursor: string;
    tripPatterns: TripPattern[];
  };
};
export type TripPattern = {
  expectedStartTime: string;
  expectedEndTime: string;
  /** Duration in seconds */
  duration: number;
  /** Distance in meters */
  distance: number;
  legs: Leg[];
};
export type Leg = {
  mode: TransportMode;
  transportSubmode: string;
  /** Distance in meters */
  distance: number;
  expectedStartTime: string;
  expectedEndTime: string;
  line?: Line;
  fromPlace: { quay: Quay };
  toPlace: { quay: Quay };
  fromEstimatedCall?: {
    destinationDisplay?: DestinationDisplay;
  };
};

export const tripsQueryDocument = `
query planTrip($fromPlace: String, $toPlace: String, $pageCursor: String) {
  trip(
    from: {
      place: $fromPlace
    },
    to: {
      place: $toPlace
    },
    pageCursor: $pageCursor,
  ) {
    nextPageCursor
    tripPatterns {
      expectedStartTime
      expectedEndTime
      duration
      distance
      legs {
        mode
        transportSubmode
        expectedStartTime
        expectedEndTime
        distance
        fromPlace {
          quay {
            ...Q
          }
        }
        toPlace {
          quay {
            ...Q
          }
        }
        line {
          ...L
        }
        fromEstimatedCall {
          destinationDisplay {
            frontText
            via
          }
        }
      }
    }
  }
}
${quayFragment}
${lineFragment}
${authorityFragment}
`;
