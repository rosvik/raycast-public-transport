import { Fragment } from "react";
import { Feature, Leg, TripPattern } from "../types";
import { ActionPanel, Action, Color, List, Icon } from "@raycast/api";
import { fetchTrip } from "../api";
import { useCallback, useEffect, useState } from "react";
import {
  getTransportIcon,
  formatAsClock,
  formatTimeDifferenceAsClock,
  formatMetersToHuman,
  formatDestinationDisplay,
} from "../utils";

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
          accessories={getTripAccessories(trip, isDetailVisible)}
          key={idx}
        />
      ))}
    </List>
  );
}

const TripDetails = ({ trip }: { trip: TripPattern }) => {
  const getDestinationTitle = (leg: Leg) =>
    `${formatAsClock(leg.expectedEndTime)} ${leg.toPlace.quay.name} ${leg.toPlace.quay.publicCode || ""}`;

  return (
    <List.Item.Detail.Metadata>
      {trip.legs.map((leg, idx) => (
        <Fragment key={idx}>
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
        text={formatTimeDifferenceAsClock(trip.expectedStartTime, trip.expectedEndTime) + " total"}
        icon={Icon.Clock}
      />
    </List.Item.Detail.Metadata>
  );
};

const getTripAccessories = (
  trip: TripPattern,
  isDetailsVisible: boolean,
): List.Item.Accessory[] => {
  // Filter out insignificant walk distances
  const legs = trip.legs.filter(
    (leg) => leg.fromPlace.quay.stopPlace.id !== leg.toPlace.quay.stopPlace.id,
  );

  let accessories: List.Item.Accessory[] = legs.map((leg) => ({
    icon: getTransportIcon(leg.mode, leg.transportSubmode),
    // Show public code only if there's space for it (less than 4 legs when
    // details are open)
    text: !isDetailsVisible || legs.length < 4 ? leg.line?.publicCode : undefined,
    tooltip: `${getTitleText(leg)} - ${getLabelText(leg)}`,
  }));

  // Truncate and show ellipsis if details are open and there's more than 5 legs
  if (isDetailsVisible && accessories.length > 5) {
    accessories = accessories.slice(0, 4);
    accessories.push({
      icon: { source: Icon.Ellipsis, tintColor: Color.SecondaryText },
      tooltip: `${legs.length - 4} more`,
    });
  }

  // Only show duration tag if details are closed
  if (!isDetailsVisible) {
    accessories.push({
      tag: {
        value: formatTimeDifferenceAsClock(trip.expectedStartTime, trip.expectedEndTime),
        color: Color.Blue,
      },
    });
  }
  return accessories;
};

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
