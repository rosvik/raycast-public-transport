import { Fragment } from "react";
import { Feature, Leg, TripPattern } from "../types";
import { ActionPanel, Action, Color, List } from "@raycast/api";
import { fetchTrip } from "../api";
import { useCallback, useEffect, useState } from "react";
import {
  getTransportIcon,
  formatAsClock,
  formatTimeDifferenceAsClock,
  formatMetersToHuman,
  formatDestinationDisplay,
} from "../utils";
import Accessory = List.Item.Accessory;

const buildAccessories = (trip: TripPattern, isDetailsVisible: boolean): Accessory[] => {
  if (isDetailsVisible) {
    return [
      {
        tag: {
          value: formatTimeDifferenceAsClock(trip.expectedStartTime, trip.expectedEndTime),
          color: Color.Blue,
        },
      },
    ];
  }
  const accessories: Accessory[] = trip.legs
    .filter((leg) => !(leg.mode === "foot" && leg.fromPlace.name === leg.toPlace.name))
    .map((leg) => ({
      icon: getTransportIcon(leg.mode, leg.transportSubmode),
      text: leg.line?.publicCode,
    }));
  accessories.push({
    tag: {
      value: formatTimeDifferenceAsClock(trip.expectedStartTime, trip.expectedEndTime),
      color: Color.Blue,
    },
  });
  return accessories;
};

type Props = {
  origin: Feature;
  destination: Feature;
};
export default function Trip({ origin, destination }: Props) {
  const [trips, setTrips] = useState<TripPattern[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageCursor, setPageCursor] = useState("");
  const [isDetailVisible, setDetailVisible] = useState(false);

  const getTrips = useCallback(() => {
    setIsLoading(true);
    fetchTrip({
      originId: origin.properties.id,
      destinationId: destination.properties.id,
      pageCursor,
    })
      .then((data) => {
        const newTrips = trips?.concat(data.trip.tripPatterns);
        setTrips(newTrips);
        setPageCursor(data.trip.nextPageCursor);
      })
      .finally(() => setIsLoading(false));
  }, [pageCursor]);

  useEffect(() => {
    getTrips();
  }, []);

  return (
    <List
      isLoading={isLoading}
      isShowingDetail={isDetailVisible}
      searchBarPlaceholder={`From ${origin.properties.name} to ${destination.properties.name}...`}
    >
      {trips?.map((trip, idx) => (
        <List.Item
          detail={<List.Item.Detail metadata={<TripDetails trip={trip} />}></List.Item.Detail>}
          actions={
            <ActionPanel>
              <Action
                title="Toggle Details"
                onAction={() => {
                  setDetailVisible(!isDetailVisible);
                }}
              />
              <Action
                title="Load More"
                // TODO: Remove this in favor of `pagination` returned from
                // using the built-in useFetch/usePromise:
                // https://developers.raycast.com/utilities/react-hooks/usefetch#pagination
                onAction={getTrips}
              />
            </ActionPanel>
          }
          title={`${formatAsClock(trip.expectedStartTime)} - ${formatAsClock(trip.expectedEndTime)}`}
          // TODO: subtitle => "Little warning triangle if service disruptions are present"
          accessories={buildAccessories(trip, isDetailVisible)}
          key={idx}
        />
      ))}
    </List>
  );
}

const TripDetails = ({ trip }: { trip: TripPattern }) => {
  const getDestinationTitle = (leg: Leg) =>
    `${formatAsClock(leg.expectedEndTime)} ${leg.toPlace.quay.name} ${leg.toPlace.quay.publicCode || ""}`;

  const getTitleText = (leg: Leg) =>
    `${formatAsClock(leg.expectedStartTime)} ${leg.fromPlace.quay.name} ${leg.fromPlace.quay.publicCode || ""}`;

  const getLabelText = (leg: Leg) => {
    const timeTaken = formatTimeDifferenceAsClock(leg.expectedEndTime, leg.expectedStartTime);
    if (leg.mode === "foot") {
      return `${formatMetersToHuman(leg.distance)} (${timeTaken})`;
    }
    let label = "";
    if (leg.line?.publicCode) {
      label += `${leg.line?.publicCode} `;
    }
    if (leg.fromEstimatedCall?.destinationDisplay) {
      label += `${formatDestinationDisplay(leg.fromEstimatedCall?.destinationDisplay)} `;
    }
    label += `(${timeTaken})`;
    return label;
  };

  return (
    <List.Item.Detail.Metadata>
      {trip.legs.map((leg, idx) => (
        <Fragment key={`${leg.fromPlace.name}-${idx}`}>
          <List.Item.Detail.Metadata.Label
            title={getTitleText(leg)}
            icon={getTransportIcon(leg.mode, leg.transportSubmode)}
            text={getLabelText(leg)}
          />
          <List.Item.Detail.Metadata.Separator />
        </Fragment>
      ))}
      <List.Item.Detail.Metadata.Label
        title={getDestinationTitle(trip.legs[trip.legs.length - 1])}
      />
    </List.Item.Detail.Metadata>
  );
};
