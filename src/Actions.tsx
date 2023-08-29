import { Action, ActionPanel } from "@raycast/api";
import { getFavicon } from "@raycast/utils";
import { useEffect, useState } from "react";
import { fetchVehicleId } from "./api";
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

  const [vehicleId, setVehicleId] = useState<string | undefined>();
  useEffect(() => {
    fetchVehicleId(ec.serviceJourney.id).then((id) => setVehicleId(id));
  }, [ec.serviceJourney.id]);

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
      {vehicleId && (
        <Action.OpenInBrowser
          url={`https://vehicle-map.entur.org/?vehicleRef=${vehicleId}`}
          title="Show Position in Map"
          icon={getFavicon("https://entur.no")}
        />
      )}
    </ActionPanel>
  );
}

function getSkjermenUrl(departures: Departures) {
  const url = `https://skjer.men/${departures.latitude}/${departures.longitude}`;
  return encodeURI(url);
}
