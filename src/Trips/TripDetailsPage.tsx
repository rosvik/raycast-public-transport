import { List } from "@raycast/api";
import { formatAsDate, getTransportIcon } from "../utils";
import { getLabelText } from "./TripsPage";
import { getTitleText } from "./TripsPage";
import { Detail } from "../Departures/Detail";
import { TripPattern } from "../api/tripsQuery";

type Props = {
  trip: TripPattern;
};
export default function TripDetailsPage({ trip }: Props) {
  const date = formatAsDate(trip.expectedStartTime);
  return (
    <List isShowingDetail={true}>
      <List.Section title={date === new Date().toDateString() ? "Today" : date}>
        {trip.legs.map((leg, idx) => (
          <List.Item
            key={idx}
            title={getTitleText(leg)}
            accessories={[
              {
                text: getLabelText(leg, false),
                icon: getTransportIcon(leg.mode, leg.transportSubmode),
              },
            ]}
            detail={
              leg.fromEstimatedCall && (
                <Detail ec={leg.fromEstimatedCall} destinationQuayId={leg.toPlace.quay.id} />
              )
            }
          />
        ))}
      </List.Section>
    </List>
  );
}
