import { Action, ActionPanel, Color, Icon, Image, LaunchProps, List } from "@raycast/api";
import fetch from "cross-fetch";
import { useEffect, useState } from "react";
import { FeatureResponse, StopPlace, StopPlaceQuayDeparturesQuery, StopsDetailsQuery, TransportMode } from "./types";

interface CommandArguments {
  query: string;
}

export default function Command(props: LaunchProps<{ arguments: CommandArguments }>) {
  const [isLoading, setIsLoading] = useState(true);

  const [items, setItems] = useState<StopPlaceQuayDeparturesQuery>();
  const [numberOfDepartures, setNumberOfDepartures] = useState(5);

  const [stopPlace, setStopPlace] = useState<StopPlace>();

  useEffect(() => {
    setIsLoading(true);
    fetchVenue(props.arguments.query).then((featureResponse) => {
      const stopId = featureResponse.features[0].properties.id;
      fetchStopDetails(stopId).then(setStopPlace);
      fetchDepartures(stopId, numberOfDepartures).then((value) => {
        setItems(value);
        setIsLoading(false);
      });
    });
  }, [props.arguments.query, numberOfDepartures]);

  const [showDetails, setShowDetails] = useState(false);

  return (
    <List
      navigationTitle="Search"
      searchBarPlaceholder="Filter Departures"
      filtering={{ keepSectionOrder: true }}
      isShowingDetail={showDetails}
      searchBarAccessory={
        <List.Dropdown
          tooltip="Select number of departures to show"
          onChange={(newValue) => setNumberOfDepartures(parseInt(newValue))}
        >
          <List.Dropdown.Section title="Number of departures pr. platform">
            <List.Dropdown.Item title="5" value="5"></List.Dropdown.Item>
            <List.Dropdown.Item title="10" value="10"></List.Dropdown.Item>
            <List.Dropdown.Item title="50" value="50"></List.Dropdown.Item>
          </List.Dropdown.Section>{" "}
        </List.Dropdown>
      }
    >
      {!isLoading &&
        items?.stopPlace?.quays?.map((quay, i) => {
          const quayDetails = getQuay(quay.id, stopPlace);
          return (
            <List.Section
              key={quay.id}
              title={`${quayDetails?.name ?? `Quay ${i}`} ${quayDetails?.publicCode}`}
              subtitle={quayDetails?.description}
            >
              {quay.estimatedCalls.map((ec) => {
                const d = new Date(ec.expectedDepartureTime);
                const time = `${padTime(d.getHours())}:${padTime(d.getMinutes())}`;
                const lineName = `${ec.serviceJourney.line.publicCode ?? ""} ${ec.destinationDisplay?.frontText ?? ""}`;
                return (
                  <List.Item
                    accessories={[
                      {
                        tag: {
                          value: new Date(ec.expectedDepartureTime),
                          color: ec.realtime ? "raycast-green" : "raycast-secondary-text",
                        },
                      },
                    ]}
                    icon={getTransportIcon(
                      ec.serviceJourney.line.transportMode,
                      ec.serviceJourney.line.transportSubmode
                    )}
                    actions={
                      <ActionPanel>
                        <Action title="Toggle Details" onAction={() => setShowDetails(!showDetails)} />
                      </ActionPanel>
                    }
                    key={ec.serviceJourney.id}
                    title={lineName}
                    subtitle={showDetails ? undefined : time}
                    detail={
                      <List.Item.Detail
                        metadata={
                          <List.Item.Detail.Metadata>
                            <List.Item.Detail.Metadata.Label title="Code" text={ec.serviceJourney.line.publicCode} />
                            <List.Item.Detail.Metadata.Label
                              title="Front text"
                              text={ec.destinationDisplay?.frontText}
                            />
                            <List.Item.Detail.Metadata.Label
                              title="Transport mode"
                              text={getModeText(
                                ec.serviceJourney.line.transportMode,
                                ec.serviceJourney.line.transportSubmode
                              )}
                              icon={
                                getTransportIcon(
                                  ec.serviceJourney.line.transportMode,
                                  ec.serviceJourney.line.transportSubmode
                                ) as Image.ImageLike
                              }
                            />
                            <List.Item.Detail.Metadata.Separator />
                            <List.Item.Detail.Metadata.Label
                              title="Date"
                              text={new Date(ec.aimedDepartureTime).toLocaleDateString("no-no")}
                            />
                            <List.Item.Detail.Metadata.Label
                              title="Scheduled departure"
                              text={new Date(ec.aimedDepartureTime).toLocaleTimeString("no-no")}
                            />
                            <List.Item.Detail.Metadata.Label
                              title={`Estimated departure (${ec.realtime ? "real time" : "inaccurate"})`}
                              text={new Date(ec.expectedDepartureTime).toLocaleTimeString("no-no")}
                              icon={
                                ec.realtime
                                  ? { source: Icon.CircleProgress100, tintColor: Color.Green }
                                  : { source: Icon.Signal1, tintColor: Color.SecondaryText }
                              }
                            />
                            <List.Item.Detail.Metadata.Separator />
                            <List.EmptyView></List.EmptyView>
                          </List.Item.Detail.Metadata>
                        }
                      />
                    }
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

function getQuay(quayId: string, stopPlace?: StopPlace) {
  return stopPlace?.quays?.find((q) => q.id === quayId);
}

function padTime(number: number) {
  return number.toString().padStart(2, "0");
}

type IconType =
  | Image.ImageLike
  | {
      value: Image.ImageLike | undefined | null;
      tooltip: string;
    };
function getTransportIcon(transportMode?: TransportMode, transportSubmode?: string): IconType {
  const tooltip = getModeText(transportMode, transportSubmode);
  switch (transportMode) {
    case TransportMode.Rail:
      return { source: "transport-modes/Train.svg", tintColor: Color.Red, tooltip };
    case TransportMode.Bus:
      if (transportSubmode === "localBus") {
        return { source: "transport-modes/Bus.svg", tintColor: Color.Green, tooltip };
      }
      return { source: "transport-modes/Bus.svg", tintColor: Color.Blue, tooltip };
    case TransportMode.Air:
      return { source: "transport-modes/Plane.svg", tintColor: Color.Orange, tooltip };
    case TransportMode.Water:
      return { source: "transport-modes/Ferry.svg", tintColor: Color.Blue, tooltip };
    case TransportMode.Tram:
      return { source: "transport-modes/Tram.svg", tintColor: Color.Yellow, tooltip };
    case TransportMode.Metro:
      return { source: "transport-modes/Subway.svg", tintColor: Color.Magenta, tooltip };
    default:
      return Icon.QuestionMark;
  }
}

function getModeText(transportMode?: TransportMode, transportSubmode?: string) {
  return transportSubmode === "unknown" ? transportMode : `${transportMode} / ${transportSubmode}`;
}

async function fetchDepartures(stopId: string, numberOfDepartures: number) {
  const response = await fetch(
    `https://atb-staging.api.mittatb.no/bff/v2/departures/stop-departures?id=${stopId}&numberOfDepartures=${numberOfDepartures}&timeRange=86400`,
    {
      method: "POST",
      headers: [["Content-Type", "application/x-www-form-urlencoded"]],
    }
  );
  return (await response.json()) as StopPlaceQuayDeparturesQuery;
}

async function fetchVenue(query: string) {
  const response = await fetch(
    `https://api.entur.io/geocoder/v1/autocomplete?text=${query}&size=1&lang=no&layers=venue`
  );
  return (await response.json()) as FeatureResponse;
}
async function fetchStopDetails(stopId: string): Promise<StopPlace> {
  const response = await fetch(`https://atb-staging.api.mittatb.no/bff/v2/departures/stops-details?ids=${stopId}`);
  const result = (await response.json()) as StopsDetailsQuery;
  return result.stopPlaces[0];
}
