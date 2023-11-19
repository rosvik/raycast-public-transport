import { Color, List } from "@raycast/api";
import { useEffect, useState } from "react";
import { Actions } from "./Actions";
import { Detail } from "./Detail";
import { fetchDepartures } from "../api";
import { Departures, DirectionType, Feature } from "../types";
import {
  formatAsClock,
  formatAsClockWithSeconds,
  formatDestinationDisplay,
  formatDirection,
  getTransportIcon,
} from "../utils";
import { loadFavorites } from "../storage";

export default function StopPlacePage({ venue }: { venue: Feature }) {
  const [isLoading, setIsLoading] = useState(true);
  const [items, setItems] = useState<Departures>();
  const [numberOfDepartures, setNumberOfDepartures] = useState(5);
  const [showDetails, setShowDetails] = useState(false);

  const [clock, setClock] = useState(formatAsClockWithSeconds(new Date().toISOString()));
  setInterval(() => setClock(formatAsClockWithSeconds(new Date().toISOString())), 1000);

  useEffect(() => {
    if (!venue?.properties.id) return;
    setIsLoading(true);
    fetchDepartures(venue.properties.id, numberOfDepartures).then((departures) => {
      setItems(departures);
      setIsLoading(false);
    });
  }, [venue?.properties.id, numberOfDepartures]);

  const departuresWithSortedQuays = items?.quays?.sort((a, b) => {
    if (a.name + a.publicCode < b.name + b.publicCode) return -1;
    if (a.name + a.publicCode > b.name + b.publicCode) return 1;
    return 0;
  });

  const [favorites, setFavorites] = useState<Feature[]>([]);
  useEffect(() => {
    loadFavorites().then((favorite) => {
      setFavorites(favorite ?? []);
    });
  }, []);

  return (
    <List
      navigationTitle={clock}
      searchBarPlaceholder={
        isLoading
          ? "Loading..."
          : `${items?.name}${items?.description ? " " + items?.description : ""}`
      }
      filtering={{ keepSectionOrder: true }}
      isShowingDetail={showDetails}
    >
      {items &&
        departuresWithSortedQuays?.map((quay, i) => {
          return (
            <List.Section
              key={quay.id}
              title={getQuayTitle({
                index: i,
                quayName: quay.name,
                quayPublicCode: quay.publicCode,
              })}
              subtitle={getQuayDescription({
                directionTypes: quay.estimatedCalls.map((ec) => ec.serviceJourney.directionType),
                description: quay.description,
              })}
            >
              {quay.estimatedCalls.map((ec) => {
                const lineName = `${
                  ec.serviceJourney.line.publicCode ?? ""
                } ${formatDestinationDisplay(ec.destinationDisplay)}`;
                return (
                  <List.Item
                    accessories={[
                      {
                        tag: {
                          value: new Date(ec.expectedDepartureTime ?? ec.aimedDepartureTime),
                          color: ec.realtime
                            ? ec.predictionInaccurate
                              ? Color.Yellow
                              : Color.Green
                            : Color.SecondaryText,
                        },
                      },
                    ]}
                    icon={getTransportIcon(
                      ec.serviceJourney.line.transportMode,
                      ec.serviceJourney.line.transportSubmode
                    )}
                    actions={
                      <Actions
                        ec={ec}
                        venue={venue}
                        departures={items}
                        setShowDetails={() => setShowDetails(!showDetails)}
                        loadMore={() => setNumberOfDepartures((n) => n + 5)}
                        isFavorite={favorites.some((f) => f.properties.id === venue.properties.id)}
                      />
                    }
                    key={ec.serviceJourney.id + ec.aimedDepartureTime}
                    title={lineName}
                    subtitle={
                      showDetails
                        ? undefined
                        : formatAsClock(ec.expectedDepartureTime ?? ec.aimedDepartureTime)
                    }
                    detail={<Detail ec={ec} />}
                    keywords={[
                      formatDestinationDisplay(ec.destinationDisplay) ?? "",
                      ec.serviceJourney.line.description ?? "",
                      ec.serviceJourney.line.publicCode ?? "",
                      ec.serviceJourney.line.transportMode ?? "",
                      ec.serviceJourney.line.authority?.name ?? "",
                    ]}
                  />
                );
              })}
            </List.Section>
          );
        })}
    </List>
  );
}

function getQuayTitle({
  index,
  quayName,
  quayPublicCode,
}: {
  index: number;
  quayName?: string;
  quayPublicCode?: string;
}): string {
  const name = quayName ?? `Quay ${index + 1}`;
  const publicCode = quayPublicCode ? ` ${quayPublicCode}` : "";

  return `${name}${publicCode}`;
}

function getQuayDescription({
  description,
  directionTypes,
}: {
  description?: string;
  directionTypes: DirectionType[];
}): string {
  const directions = new Set<DirectionType>(directionTypes);
  const commonDirection = directions.size === 1 ? Array.from(directions)[0] : undefined;
  const directionString =
    commonDirection && commonDirection !== "unknown" ? `(${formatDirection(commonDirection)})` : "";

  const descriptionString = description ? `${description} ` : "";

  return `${descriptionString}${directionString}`;
}
