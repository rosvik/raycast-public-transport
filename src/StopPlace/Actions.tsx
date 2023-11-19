import { Action, ActionPanel, Icon, Image } from "@raycast/api";
import { getFavicon } from "@raycast/utils";
import { Departures, EstimatedCall, Feature } from "../types";
import { getDomainName } from "../utils";
import { deletePreferredVenue, storePreferredVenue } from "../storage";

type ActionsProps = {
  departures: Departures;
  ec: EstimatedCall;
  venue: Feature;
  isSaved: boolean;
  setShowDetails: () => void;
  loadMore: () => void;
};

export function Actions({
  departures,
  ec,
  venue,
  isSaved,
  setShowDetails,
  loadMore,
}: ActionsProps) {
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
      <Action
        // eslint-disable-next-line @raycast/prefer-title-case
        title={isSaved ? `Remove ${venue.properties.name}` : `Save ${venue.properties.name}`}
        icon={isSaved ? Icon.StarDisabled : Icon.Star}
        shortcut={{ modifiers: ["cmd"], key: "s" }}
        onAction={() => (isSaved ? deletePreferredVenue(venue) : storePreferredVenue(venue))}
      />
      {venue.properties.id && (
        <Action.OpenInBrowser
          url={getTravelPlannerUrl(ec)}
          title="Open Trip in AtB Travel Planner"
          icon={getFavicon("https://atb.no", { mask: Image.Mask.RoundedRectangle })}
          shortcut={{ modifiers: ["cmd"], key: "o" }}
        />
      )}
      <Action.OpenInBrowser
        url={getSkjermenUrl(departures)}
        title="Open Location in skjer.men"
        icon={getFavicon("https://skjer.men", {
          mask: Image.Mask.RoundedRectangle,
        })}
        shortcut={{ modifiers: ["cmd"], key: "m" }}
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
