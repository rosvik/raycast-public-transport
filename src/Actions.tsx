import { Action, ActionPanel, Icon, Image } from "@raycast/api";
import { getFavicon } from "@raycast/utils";
import { Departures, EstimatedCall } from "./types";
import { getDomainName } from "./utils";

type ActionsProps = {
  departures: Departures;
  quayId: string;
  stopPlaceId?: string;
  ec: EstimatedCall;
  setShowDetails: () => void;
  loadMore: () => void;
};

export function Actions({ setShowDetails, departures, ec, loadMore, stopPlaceId }: ActionsProps) {
  const urlString = ec.serviceJourney.line.authority?.url;
  const url = urlString ? new URL(urlString) : null;

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
      {stopPlaceId && (
        <Action.OpenInBrowser
          url={getTravelPlannerUrl(ec)}
          title="Open in AtB Travel Planner"
          icon={getFavicon("https://atb.no", { mask: Image.Mask.RoundedRectangle })}
          shortcut={{ modifiers: ["cmd"], key: "o" }}
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

function getTravelPlannerUrl(ec: EstimatedCall) {
  const base = "https://atb-staging.planner-web.mittatb.no/departures/details";
  const date = new Date(ec.date);
  const dateString = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;

  return `${base}/${ec.serviceJourney.id}?date=${dateString}&fromQuayId=${ec.quay.id}`;
}
