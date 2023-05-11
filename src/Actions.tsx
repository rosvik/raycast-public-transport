import { Action, ActionPanel } from "@raycast/api";
import { getFavicon } from "@raycast/utils";
import { Departures, EstimatedCall } from "./types";

type ActionsProps = {
  departures: Departures;
  quayId: string;
  ec: EstimatedCall;
  setShowDetails: () => void;
};

export function Actions({ setShowDetails, departures }: ActionsProps) {
  return (
    <ActionPanel>
      <Action title="Toggle Details" onAction={setShowDetails} />
      <Action.OpenInBrowser
        url={getSkjermenUrl(departures)}
        title="Open in skjer.men"
        icon={getFavicon("https://skjer.men")}
      />
    </ActionPanel>
  );
}

function getSkjermenUrl(departures: Departures) {
  const url = `https://skjer.men/https://www.google.com/maps/@${departures.latitude.toFixed(
    7
  )},${departures.longitude.toFixed(7)}`;
  return encodeURI(url);
}
