import { List, Toast, clearSearchBar } from "@raycast/api";
import { useEffect, useState } from "react";
import { addFavoriteStop, loadFavoriteStops, removeFavoriteStop } from "../storage";
import { Feature } from "../types";
import { formatAsClockWithSeconds, getVenueCategoryIcon } from "../utils";
import { Actions } from "./Actions";
import { useDebouncedVenues } from "./use-debounced-venues";

export default function SearchPage({ setVenue }: { setVenue: (venue: Feature) => void }) {
  const [clock, setClock] = useState(formatAsClockWithSeconds(new Date().toISOString()));
  setInterval(() => setClock(formatAsClockWithSeconds(new Date().toISOString())), 1000);

  const [query, setQuery] = useState<string>("");
  const [toast, setToast] = useState<Promise<Toast>>();
  const { venueResults } = useDebouncedVenues(query, toast, setToast);

  const [favorites, setFavorites] = useState<Feature[]>([]);
  useEffect(() => {
    loadFavoriteStops().then((preferredVenues) => {
      if (preferredVenues) setFavorites(preferredVenues);
    });
  }, []);

  return (
    <List
      navigationTitle={clock}
      searchBarPlaceholder="Search for a stop"
      searchText={query}
      onSearchTextChange={setQuery}
    >
      <List.Section title="Favorites">
        {favorites
          .filter((v) => v.properties.name.toUpperCase().indexOf(query?.toUpperCase() ?? "") >= 0)
          .map((venue) => {
            return (
              <VenueListItem
                key={venue.properties.id}
                onAction={() => {
                  clearSearchBar();
                  // Re-add favorite to bump it to the top of the list
                  addFavoriteStop(venue);
                  setVenue(venue);
                }}
                venue={venue}
                onSave={() => removeFavoriteStop(venue).then(setFavorites)}
                isFavorite={true}
              />
            );
          })}
      </List.Section>
      <List.Section title="Search Results">
        {venueResults.map((venue) => {
          const isSaved = favorites.some((v) => v.properties.id === venue.properties.id);
          return (
            <VenueListItem
              key={venue.properties.id}
              onAction={() => {
                clearSearchBar();
                // Re-add favorite to bump it to the top of the list
                if (isSaved) addFavoriteStop(venue);
                setVenue(venue);
              }}
              venue={venue}
              onSave={() =>
                isSaved
                  ? removeFavoriteStop(venue).then(setFavorites)
                  : addFavoriteStop(venue).then(setFavorites)
              }
              isFavorite={isSaved}
            />
          );
        })}
      </List.Section>
    </List>
  );
}

const VenueListItem = ({
  venue,
  isFavorite,
  onAction,
  onSave,
}: {
  venue: Feature;
  isFavorite: boolean;
  onAction: () => void;
  onSave: () => void;
}) => {
  return (
    <List.Item
      title={venue.properties.name}
      subtitle={{
        value: venue.properties.locality,
        tooltip: venue.properties.county,
      }}
      icon={getVenueCategoryIcon(venue.properties.category)}
      actions={
        <Actions venue={venue} onAction={onAction} isFavorite={isFavorite} onSave={onSave} />
      }
    />
  );
};
