import fetch from "cross-fetch";
import { Departures, Feature, StopPlace } from "./types";

type FeatureResponse = {
  features: Feature[];
};
export async function fetchVenue(query: string): Promise<Feature | undefined> {
  const response = await fetch(
    `https://api.entur.io/geocoder/v1/autocomplete?text=${query}&size=1&lang=no&layers=venue`
  );
  const featureResponse = (await response.json()) as FeatureResponse;
  return featureResponse.features[0];
}

const DeparturesQueryDocument = `
query stopPlaceQuayDepartures(
  $id: String!,
  $numberOfDepartures: Int,
) {
  stopPlace(id: $id) {
    id
    name
    description
    quays(filterByInUse: true) {
      id
      name
      description
      estimatedCalls(
        numberOfDepartures: $numberOfDepartures
        timeRange: 86400
      ) {
        date
        expectedDepartureTime
        aimedDepartureTime
        realtime
        cancellation
        quay {
          id
        }
        destinationDisplay {
          frontText
        }
        serviceJourney {
          id
          line {
            id
            description
            publicCode
            transportMode
            transportSubmode
          }
        }
      }
    }
  }
}
`;
type StopPlaceQuayDeparturesQuery = {
  stopPlace?: Departures;
};
export async function fetchDepartures(
  stopId: string,
  numberOfDepartures: number
): Promise<Departures | undefined> {
  const departuresQuery = await fetchJourneyPlannerData<StopPlaceQuayDeparturesQuery>(
    DeparturesQueryDocument,
    {
      id: stopId,
      numberOfDepartures,
    }
  );
  return departuresQuery.stopPlace;
}

const StopsDetailsDocument = `
query stopsDetails($id: String!) {
  stopPlace(id: $id) {
    name
    quays(filterByInUse: true) {
      id
      description
      name
      publicCode
      stopPlace {
        id
      }
    }
    transportMode
    description
    id
    latitude
    longitude
  }
}
`;
type StopsDetailsQuery = {
  stopPlace: StopPlace;
};
export async function fetchStopDetails(stopId: string): Promise<StopPlace | undefined> {
  const response = await fetchJourneyPlannerData<StopsDetailsQuery>(StopsDetailsDocument, {
    id: stopId,
  });
  return response.stopPlace;
}

async function fetchJourneyPlannerData<T>(document: string, variables: object): Promise<T> {
  const journeyPlannerUrl = "https://api.entur.io/journey-planner/v3/graphql";

  const response = await fetch(journeyPlannerUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: document,
      variables,
    }),
  });
  const result = (await response.json()) as { data: T };
  return result.data;
}
