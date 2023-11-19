import { Action, ActionPanel, Icon, Image } from "@raycast/api";
import { getFavicon } from "@raycast/utils";
import { addFavorite, removeFavorite } from "../storage";
import { EstimatedCall, Feature } from "../types";
import { getDomainName } from "../utils";

type ActionsProps = {
  ec: EstimatedCall;
  venue: Feature;
  isFavorite: boolean;
  setShowDetails: () => void;
  loadMore: () => void;
};

export function Actions({ ec, venue, isFavorite, setShowDetails, loadMore }: ActionsProps) {
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
        title={
          isFavorite
            ? `Remove Favorite ${venue.properties.name}`
            : `Favorite ${venue.properties.name}`
        }
        icon={isFavorite ? Icon.StarDisabled : Icon.Star}
        shortcut={
          isFavorite ? { modifiers: ["cmd", "shift"], key: "s" } : { modifiers: ["cmd"], key: "s" }
        }
        onAction={() => (isFavorite ? removeFavorite(venue) : addFavorite(venue))}
      />
      {venue.properties.id && (
        <Action.OpenInBrowser
          url={getTravelPlannerUrl(ec)}
          title="Open Trip in AtB Travel Planner"
          icon={getFavicon("https://atb.no", { mask: Image.Mask.RoundedRectangle })}
          shortcut={{ modifiers: ["cmd"], key: "o" }}
        />
      )}
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

function getTravelPlannerUrl(ec: EstimatedCall) {
  const base = "https://atb-staging.planner-web.mittatb.no/departures/details";
  const date = new Date(ec.date);
  const dateString = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;

  return `${base}/${ec.serviceJourney.id}?date=${dateString}&fromQuayId=${ec.quay.id}`;
}
