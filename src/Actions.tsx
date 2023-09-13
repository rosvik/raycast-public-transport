import { Action, ActionPanel, Icon, Image } from "@raycast/api";
import { getFavicon } from "@raycast/utils";
import { useEffect, useState } from "react";
import { fetchVehicleId } from "./api";
import { Departures, EstimatedCall } from "./types";
import { getDomainName } from "./utils";

type ActionsProps = {
  departures: Departures;
  quayId: string;
  ec: EstimatedCall;
  setShowDetails: () => void;
  loadMore: () => void;
};

export function Actions({ setShowDetails, departures, ec, loadMore }: ActionsProps) {
  const urlString = ec.serviceJourney.line.authority?.url;
  const url = urlString ? new URL(urlString) : null;

  const [vehicleId, setVehicleId] = useState<string | undefined>();
  useEffect(() => {
    fetchVehicleId(ec.serviceJourney.id).then((id) => setVehicleId(id));
  }, [ec.serviceJourney.id]);

  return (
    <ActionPanel>
      <Action title="Toggle Details" icon={Icon.AppWindowSidebarLeft} onAction={setShowDetails} />
      <Action
        title="Load More Departures"
        icon={Icon.Plus}
        shortcut={{ modifiers: ["cmd"], key: "+" }}
        onAction={loadMore}
      />
      {url && (
        <Action.OpenInBrowser
          url={url.href}
          // eslint-disable-next-line @raycast/prefer-title-case
          title={`Open ${getDomainName(url.href)}`}
          icon={getFavicon(url.origin, {
            mask: Image.Mask.RoundedRectangle,
          })}
        />
      )}
      {vehicleId && (
        <Action.OpenInBrowser
          url={`https://vehicle-map.entur.org/?vehicleRef=${vehicleId}`}
          title="Open in Vehicle Map"
          icon={getFavicon("https://entur.no", {
            mask: Image.Mask.RoundedRectangle,
          })}
          shortcut={{ modifiers: ["cmd"], key: "m" }}
        />
      )}
      <Action.OpenInBrowser
        url={getSkjermenUrl(departures)}
        title="Open in skjer.men"
        icon={getFavicon("https://skjer.men", {
          mask: Image.Mask.RoundedRectangle,
        })}
        shortcut={{ modifiers: ["cmd"], key: "s" }}
      />
    </ActionPanel>
  );
}

function getSkjermenUrl(departures: Departures) {
  const url = `https://skjer.men/${departures.latitude}/${departures.longitude}`;
  return encodeURI(url);
}
