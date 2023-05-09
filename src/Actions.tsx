import { Action, ActionPanel } from "@raycast/api";
import { EstimatedCall } from "./types";

type ActionsProps = {
  ec: EstimatedCall;
  stopPlaceId?: string;
  quayId: string;
  setShowDetails: () => void;
};

export function Actions({ setShowDetails, ec, quayId, stopPlaceId }: ActionsProps) {
  return (
    <ActionPanel>
      <Action title="Toggle Details" onAction={setShowDetails} />
      <Action.OpenInBrowser
        url={enturUrl(ec, quayId, stopPlaceId ?? "unknown")}
        title="Open In Browser"
      />
    </ActionPanel>
  );
}

function enturUrl(ec: EstimatedCall, quayId: string, stopId: string) {
  const params = new URLSearchParams({
    id: stopId,
    "fromQuay[id]": quayId,
    mode: ec.serviceJourney.line.transportMode ?? "",
    subMode: ec.serviceJourney.line.transportSubmode ?? "",
    publicCode: ec.serviceJourney.line.publicCode ?? "",
    tripHeadsign: ec.destinationDisplay?.frontText ?? "",
    serviceJourneyId: ec.serviceJourney.id,
    currentStopTime: ec.aimedDepartureTime,
  });
  const url = `https://entur.no/kart/linje?${params.toString()}`;
  return encodeURI(url);
}
