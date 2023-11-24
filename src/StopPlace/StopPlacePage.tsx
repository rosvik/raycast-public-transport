import { Color, Icon, List, Toast, showToast } from "@raycast/api";
import { useEffect, useState } from "react";
import { Actions } from "./Actions";
import { Detail } from "./Detail";
import { fetchDepartures } from "../api";
import { DirectionType, EstimatedCall, Feature, StopPlaceQuayDeparturesQuery } from "../types";
import {
  formatAsClock,
  formatAsClockWithSeconds,
  formatAsTimestamp,
  formatDestinationDisplay,
  formatDirection,
  getTransportIcon,
} from "../utils";

export default function StopPlacePage({ venue }: { venue: Feature }) {
  const [items, setItems] = useState<StopPlaceQuayDeparturesQuery>();
  const [numberOfDepartures, setNumberOfDepartures] = useState(5);
  const [showDetails, setShowDetails] = useState(false);
  const departures = items?.stopPlace;
  const favorites = items?.favorites;

  const [clock, setClock] = useState(formatAsClockWithSeconds(new Date().toISOString()));
  setInterval(() => setClock(formatAsClockWithSeconds(new Date().toISOString())), 1000);

  useEffect(() => {
    if (!venue?.properties.id) return;
    const toast = showToast({
      title: "Loading departures...",
      style: Toast.Style.Animated,
    });
    fetchDepartures(venue.properties.id, numberOfDepartures).then((departures) => {
      setItems(departures);
      toast.then((t) => t.hide());
    });
  }, [venue?.properties.id, numberOfDepartures]);

  const departuresWithSortedQuays = departures?.quays?.sort((a, b) => {
    if (a.name + a.publicCode < b.name + b.publicCode) return -1;
    if (a.name + a.publicCode > b.name + b.publicCode) return 1;
    return 0;
  });

  return (
    <List
      navigationTitle={clock}
      searchBarPlaceholder={
        departures
          ? `${departures.name}${departures.description ? " " + departures.description : ""}`
          : ""
      }
      filtering={{ keepSectionOrder: true }}
      isShowingDetail={showDetails}
    >
      {favorites && favorites.length > 0 && (
        <List.Section title="Favorites">
          {favorites
            .flatMap((favorite) => favorite.estimatedCalls)
            .sort(
              (a, b) =>
                new Date(a.expectedDepartureTime ?? a.aimedDepartureTime).valueOf() -
                new Date(b.expectedDepartureTime ?? b.aimedDepartureTime).valueOf()
            )
            .slice(0, numberOfDepartures)
            .map((ec) => {
              return (
                <EstimatedCallItem
                  ec={ec}
                  loadMore={() => setNumberOfDepartures((n) => n + 5)}
                  setShowDetails={() => setShowDetails(!showDetails)}
                  isShowingDetails={showDetails}
                  venue={venue}
                  isFavorite={true}
                />
              );
            })}
        </List.Section>
      )}
      {departures &&
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
              {quay.estimatedCalls.map((ec) => (
                <EstimatedCallItem
                  ec={ec}
                  loadMore={() => setNumberOfDepartures((n) => n + 5)}
                  setShowDetails={() => setShowDetails(!showDetails)}
                  isShowingDetails={showDetails}
                  venue={venue}
                />
              ))}
            </List.Section>
          );
        })}
    </List>
  );
}

function EstimatedCallItem({
  ec,
  loadMore,
  setShowDetails,
  venue,
  isShowingDetails,
  isFavorite = false,
}: {
  ec: EstimatedCall;
  venue: Feature;
  setShowDetails: () => void;
  loadMore: () => void;
  isShowingDetails?: boolean;
  isFavorite?: boolean;
}) {
  const lineName = `${ec.serviceJourney.line.publicCode ?? ""} ${formatDestinationDisplay(
    ec.destinationDisplay
  )}`;

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
        isFavorite
          ? {
              icon: {
                source: Icon.Star,
                tintColor: Color.Yellow,
              },
            }
          : {},
      ]}
      icon={getTransportIcon(
        ec.serviceJourney.line.transportMode,
        ec.serviceJourney.line.transportSubmode
      )}
      actions={
        <Actions ec={ec} venue={venue} setShowDetails={setShowDetails} loadMore={loadMore} />
      }
      key={ec.serviceJourney.id + ec.aimedDepartureTime}
      title={lineName}
      subtitle={
        isShowingDetails
          ? undefined
          : {
              value: formatAsClock(ec.expectedDepartureTime ?? ec.aimedDepartureTime),
              tooltip: formatAsTimestamp(ec.expectedDepartureTime ?? ec.aimedDepartureTime),
            }
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
