import { Action, ActionPanel } from "@raycast/api";
import { getFavicon } from "@raycast/utils";
import { Departures, EstimatedCall } from "./types";

type ActionsProps = {
  departures: Departures;
  quayId: string;
  ec: EstimatedCall;
  setShowDetails: () => void;
};

export function Actions({ setShowDetails, departures, ec }: ActionsProps) {
  const urlString = ec.serviceJourney.line.authority?.url;
  const url = urlString ? new URL(urlString) : null;
  return (
    <ActionPanel>
      <Action title="Toggle Details" onAction={setShowDetails} />
      <Action.OpenInBrowser
        url={getSkjermenUrl(departures)}
        title="Open in skjer.men"
        icon={getFavicon("https://skjer.men")}
      />
      {url && (
        <Action.OpenInBrowser
          url={url.href}
          // eslint-disable-next-line @raycast/prefer-title-case
          title={`Open ${url.host}`}
          icon={getFavicon(url.origin)}
        />
      )}
    </ActionPanel>
  );
}

function getSkjermenUrl(departures: Departures) {
  const url = `https://skjer.men/${departures.latitude}/${departures.longitude}`;
  return encodeURI(url);
}
