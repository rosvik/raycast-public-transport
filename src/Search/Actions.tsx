import { Action, ActionPanel, Icon, Image } from "@raycast/api";
import { getFavicon } from "@raycast/utils";
import { Feature } from "../types";

type ActionsProps = {
  venue: Feature;
  isFavorite: boolean;
  onAction: () => void;
  onSave: () => void;
};

export function Actions({ venue, isFavorite, onAction, onSave }: ActionsProps) {
  return (
    <ActionPanel>
      <Action title="View Departures" icon={Icon.ArrowRight} onAction={onAction} />
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
        onAction={onSave}
      />
      {venue.properties.id && (
        <Action.OpenInBrowser
          url={`https://atb-staging.planner-web.mittatb.no/departures/${venue.properties.id}`}
          title="Open Stop in AtB Travel Planner"
          icon={getFavicon("https://atb.no", { mask: Image.Mask.RoundedRectangle })}
          shortcut={{ modifiers: ["cmd"], key: "o" }}
        />
      )}
      <Action.OpenInBrowser
        url={getSkjermenUrl(venue)}
        title="Open Stop in skjer.men"
        icon={getFavicon("https://skjer.men", {
          mask: Image.Mask.RoundedRectangle,
        })}
        shortcut={{ modifiers: ["cmd"], key: "m" }}
      />
    </ActionPanel>
  );
}

function getSkjermenUrl(venue: Feature) {
  const url = `https://skjer.men/${venue.geometry.coordinates[1]}/${venue.geometry.coordinates[0]}`;
  return encodeURI(url);
}
