import fetch from "cross-fetch";
import { Departures, Feature } from "./types";

const CLIENT_NAME = "rosvik-raycast-departures";

type FeatureResponse = {
  features: Feature[];
};
export async function fetchVenue(query: string): Promise<Feature | undefined> {
  const params = new URLSearchParams({
    text: query,
    size: "1",
    lang: "no",
    layers: "venue",
  });

  const response = await fetch(
    `https://api.entur.io/geocoder/v1/autocomplete?${params.toString()}`,
    {
      headers: {
        "ET-Client-Name": CLIENT_NAME,
      },
    }
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
        }
        serviceJourney {
          id
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
  const journeyPlannerUrl = "https://api.entur.io/journey-planner/v3/graphql";

  const response = await fetch(journeyPlannerUrl, {
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
