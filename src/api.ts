import fetch from "node-fetch";
import { Departures, Feature } from "./types";

const CLIENT_NAME = "rosvik-raycast-departures";

type FeatureResponse = {
  features: Feature[];
};
export async function fetchVenues(query: string): Promise<Feature[] | undefined> {
  const params = new URLSearchParams({
    text: query,
    size: "7",
    lang: "no",
    layers: "venue",
  });

  const url = `https://api.entur.io/geocoder/v1/autocomplete?${params.toString()}`;
  console.debug(url);
  const response = await fetch(url, {
    headers: {
      "ET-Client-Name": CLIENT_NAME,
    },
  });
  const featureResponse = (await response.json()) as FeatureResponse;
  return featureResponse.features;
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
    latitude
    longitude
    quays(filterByInUse: true) {
      id
      name
      description
      publicCode
      estimatedCalls(
        numberOfDepartures: $numberOfDepartures
        timeRange: 604800
      ) {
        date
        expectedDepartureTime
        aimedDepartureTime
        realtime
        predictionInaccurate
        cancellation
        quay {
          id
        }
        destinationDisplay {
          frontText
          via
        }
        serviceJourney {
          id
          directionType
          line {
            id
            description
            publicCode
            transportMode
            transportSubmode
            authority {
              id
              name
              url
            }
          }
          estimatedCalls {
            quay {
              id
              name
              publicCode
            }
            aimedDepartureTime
            expectedDepartureTime
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

async function fetchJourneyPlannerData<T>(document: string, variables: object): Promise<T> {
  const url = "https://api.entur.io/journey-planner/v3/graphql";
  console.debug(url, JSON.stringify(variables));
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "ET-Client-Name": CLIENT_NAME,
    },
    body: JSON.stringify({
      query: document,
      variables,
    }),
  });
  const result = (await response.json()) as { data: T };
  return result.data;
}

const VehicleIdQueryDocument = `
query getVehicleId($id: String!) {
  vehicles(serviceJourneyId: $id) {
    vehicleId
  }
}
`;
type VehicleIdQuery = {
  vehicles: { vehicleId: string }[];
};
export async function fetchVehicleId(serviceJourneyId: string): Promise<string | undefined> {
  const vehiclesIdQuery = await fetchVehiclesData<VehicleIdQuery>(VehicleIdQueryDocument, {
    id: serviceJourneyId,
  });
  if (vehiclesIdQuery && vehiclesIdQuery.vehicles && vehiclesIdQuery.vehicles.length > 0) {
    return vehiclesIdQuery.vehicles[0].vehicleId;
  }
}

async function fetchVehiclesData<T>(document: string, variables: object): Promise<T> {
  const url = "https://api.entur.io/realtime/v1/vehicles/graphql";
  console.debug(url, JSON.stringify(variables));
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "ET-Client-Name": CLIENT_NAME,
    },
    body: JSON.stringify({
      query: document,
      variables,
    }),
  });
  const result = (await response.json()) as { data: T };
  return result.data;
}
