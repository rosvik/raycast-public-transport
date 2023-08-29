import { Color, LaunchProps, List } from "@raycast/api";
import { useEffect, useState } from "react";
import { Actions } from "./Actions";
import { fetchDepartures, fetchVenue } from "./api";
import { Detail } from "./Detail";
import { Departures, DirectionType } from "./types";
import {
  formatAsClock,
  formatAsClockWithSeconds,
  formatDirection,
  getTransportIcon,
} from "./utils";

interface CommandArguments {
  query: string;
}

export default function Command(props: LaunchProps<{ arguments: CommandArguments }>) {
  const [isLoading, setIsLoading] = useState(true);
  const [items, setItems] = useState<Departures>();
  const [numberOfDepartures, setNumberOfDepartures] = useState(5);
  const [showDetails, setShowDetails] = useState(false);

  const [clock, setClock] = useState(formatAsClockWithSeconds(new Date().toISOString()));
  setInterval(() => setClock(formatAsClockWithSeconds(new Date().toISOString())), 1000);

  useEffect(() => {
    setIsLoading(true);
    fetchVenue(props.arguments.query).then((feature) => {
      const stopId = feature?.properties.id;
      if (!stopId) return;
      fetchDepartures(stopId, numberOfDepartures).then((departures) => {
        setItems(departures);
        setIsLoading(false);
      });
    });
  }, [props.arguments.query, numberOfDepartures]);

  const departuresWithSortedQuays = items?.quays?.sort((a, b) => {
    if (a.name + a.publicCode < b.name + b.publicCode) return -1;
    if (a.name + a.publicCode > b.name + b.publicCode) return 1;
    return 0;
  });

  return (
    <List
      navigationTitle={clock}
      searchBarPlaceholder={
        isLoading
          ? "Laster..."
          : `${items?.name}${items?.description ? " " + items?.description : ""}`
      }
      filtering={{ keepSectionOrder: true }}
      isShowingDetail={showDetails}
      searchBarAccessory={
        <List.Dropdown
          tooltip="Select number of departures to show"
          onChange={(newValue) => setNumberOfDepartures(parseInt(newValue))}
        >
          <List.Dropdown.Section title="Number of departures pr. platform">
            <List.Dropdown.Item title="5" value="5" />
            <List.Dropdown.Item title="10" value="10" />
            <List.Dropdown.Item title="50" value="50" />
          </List.Dropdown.Section>
        </List.Dropdown>
      }
    >
      {!isLoading &&
        items &&
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
                const lineName = `${ec.serviceJourney.line.publicCode ?? ""} ${
                  ec.destinationDisplay?.frontText ?? ""
                }`;
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
                        quayId={quay.id}
                        departures={items}
                        setShowDetails={() => setShowDetails(!showDetails)}
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
                      ec.destinationDisplay?.frontText ?? "",
                      ec.serviceJourney.line.description ?? "",
                      ec.serviceJourney.line.publicCode ?? "",
                      ec.serviceJourney.line.transportMode ?? "",
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
