import fetch from "node-fetch";
import { getDepartureQuery } from "./departureQuery";
import { Feature, QuayDeparture, QuayLineFavorites, StopPlaceQuayDeparturesQuery } from "./types";

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

export async function fetchDepartures(
  stopId: string,
  numberOfDepartures: number,
  favorites: QuayLineFavorites[]
): Promise<StopPlaceQuayDeparturesQuery | undefined> {
  const departuresQuery = await fetchJourneyPlannerData(getDepartureQuery(favorites), {
    id: stopId,
    numberOfDepartures,
  });

  const departures = mapDepartureQueryKeys(departuresQuery, favorites);
  return departures;
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
  if (response.status !== 200) {
    console.error(response);
    throw new Error("Failed to fetch data");
  }
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

function mapDepartureQueryKeys(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any,
  favorites: QuayLineFavorites[]
): StopPlaceQuayDeparturesQuery {
  const favoriteQuayIds = favorites.map((fav) => fav.quayId);
  const quayDepartures = favoriteQuayIds
    .map((favoriteQuayId) => {
      const key = favoriteQuayId.replaceAll(":", "_");
      if (!Object.keys(data).includes(key)) return;
      return data[key] as QuayDeparture;
    })
    .filter(Boolean) as QuayDeparture[];
  const quaysWithDepartures = quayDepartures.filter((quay) => quay.estimatedCalls.length > 0);
  return {
    stopPlace: data.stopPlace,
    favorites: quaysWithDepartures,
  };
}
