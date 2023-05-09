import fetch from "cross-fetch";
import { Departures, Feature, StopPlace } from "./types";

export type StopPlaceQuayDeparturesQuery = {
  stopPlace?: Departures;
};

export async function fetchDepartures(stopId: string, numberOfDepartures: number): Promise<Departures | undefined> {
  const response = await fetch(
    `https://atb-staging.api.mittatb.no/bff/v2/departures/stop-departures?id=${stopId}&numberOfDepartures=${numberOfDepartures}&timeRange=86400`,
    {
      method: "POST",
      headers: [["Content-Type", "application/x-www-form-urlencoded"]],
    }
  );
  const departuresQuery = (await response.json()) as StopPlaceQuayDeparturesQuery;
  return departuresQuery.stopPlace;
}

export type FeatureResponse = {
  features: Feature[];
};
export async function fetchVenue(query: string): Promise<Feature | undefined> {
  const response = await fetch(
    `https://api.entur.io/geocoder/v1/autocomplete?text=${query}&size=1&lang=no&layers=venue`
  );
  const featureResponse = (await response.json()) as FeatureResponse;
  return featureResponse.features[0];
}

export type StopsDetailsQuery = {
  stopPlaces: StopPlace[];
};
export async function fetchStopDetails(stopId: string): Promise<StopPlace | undefined> {
  const response = await fetch(`https://atb-staging.api.mittatb.no/bff/v2/departures/stops-details?ids=${stopId}`);
  const result = (await response.json()) as StopsDetailsQuery;
  return result.stopPlaces[0];
}
