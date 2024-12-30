import { Toast, useNavigation, ActionPanel, Action, List, Icon, Keyboard } from "@raycast/api";
import { useEffect, useState } from "react";
import { addFavoriteStop, removeFavoriteStop, loadFavoriteStops } from "../storage";
import { Feature } from "../types";

import { useDebouncedVenues } from "../Search/use-debounced-venues";
import { getVenueCategoryIcon } from "../utils";
import SearchDestinationVenue from "./SearchDestinationVenue";

export default function SearchStartVenue() {
  const [query, setQuery] = useState<string>("");
  const [toast, setToast] = useState<Promise<Toast>>();
  const { venueResults, isLoading } = useDebouncedVenues(query, toast, setToast);
  const { push } = useNavigation();

  const [favorites, setFavorites] = useState<Feature[]>([]);
  useEffect(() => {
    loadFavoriteStops().then((preferredVenues) => {
      if (preferredVenues) setFavorites(preferredVenues);
    });
  }, []);

  return (
    <List
      searchBarPlaceholder="Find trip from..."
      throttle
      searchText={query}
      onSearchTextChange={setQuery}
      isLoading={isLoading}
    >
      {!favorites.length && !venueResults.length && (
        <List.EmptyView
          description={`Search for a place to depart from\n\nIf you add any stops as favorites, they will show up here`}
        />
      )}
      <List.Section title="Favorites">
        {favorites
          .filter((v) => v.properties.name.toUpperCase().indexOf(query?.toUpperCase() ?? "") >= 0)
          .map((venue) => {
            return (
              <List.Item
                key={venue.properties.id}
                title={venue.properties.name}
                subtitle={{
                  value: venue.properties.locality,
                  tooltip: venue.properties.county,
                }}
                icon={getVenueCategoryIcon(venue.properties.category)}
                actions={
                  <ActionPanel>
                    <Action
                      title="Set Start"
                      onAction={() => {
                        push(<SearchDestinationVenue origin={venue} />);
                      }}
                    />
                    <Action
                      icon={Icon.StarDisabled}
                      shortcut={Keyboard.Shortcut.Common.Pin}
                      title={`Remove ${venue.properties.name} from Favorites`}
                      onAction={() => removeFavoriteStop(venue).then(setFavorites)}
                    />
                  </ActionPanel>
                }
              />
            );
          })}
      </List.Section>
      <List.Section title="Search Results">
        {venueResults.map((venue) => {
          const isFavorite = favorites.some((v) => v.properties.id === venue.properties.id);
          return (
            <List.Item
              key={venue.properties.id}
              title={venue.properties.name}
              subtitle={{
                value: venue.properties.locality,
                tooltip: venue.properties.county,
              }}
              icon={getVenueCategoryIcon(venue.properties.category)}
              actions={
                <ActionPanel>
                  <Action
                    title="Set Start"
                    onAction={() => {
                      push(<SearchDestinationVenue origin={venue} />);
                    }}
                  />
                  <Action
                    title={
                      isFavorite
                        ? `Remove ${venue.properties.name} from Favorites`
                        : `Add ${venue.properties.name} to Favorites`
                    }
                    icon={isFavorite ? Icon.StarDisabled : Icon.Star}
                    shortcut={Keyboard.Shortcut.Common.Pin}
                    onAction={() => {
                      if (isFavorite) {
                        removeFavoriteStop(venue).then(setFavorites);
                      } else {
                        addFavoriteStop(venue).then(setFavorites);
                      }
                    }}
                  />
                </ActionPanel>
              }
            />
          );
        })}
      </List.Section>
    </List>
  );
}
