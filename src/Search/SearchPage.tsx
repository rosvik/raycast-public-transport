import { Alert, List, clearSearchBar, confirmAlert } from "@raycast/api";
import { useEffect, useState } from "react";
import { fetchVenues } from "../api";
import { removeFavorite, loadFavorites, addFavorite, wipeStorage } from "../storage";
import { Feature } from "../types";
import { formatAsClockWithSeconds, getVenueCategoryIcon, useDebounce } from "../utils";
import { Actions } from "./Actions";

export default function SearchPage({ setVenue }: { setVenue: (venue: Feature) => void }) {
  const [query, setQuery] = useState<string>("");

  const [clock, setClock] = useState(formatAsClockWithSeconds(new Date().toISOString()));
  setInterval(() => setClock(formatAsClockWithSeconds(new Date().toISOString())), 1000);

  const [isLoading, setIsLoading] = useState(true);
  const [venueResults, setVenueResults] = useState<Feature[]>([]);

  const debouncedQuery = useDebounce(query, 250);
  useEffect(() => {
    if (debouncedQuery === undefined || debouncedQuery === "") return;
    if (debouncedQuery === "DEBUG_WIPE_STORAGE") {
      confirmAlert({
        title: "Wipe Storage",
        message: "Are you sure you want to wipe storage?",
        primaryAction: {
          title: "Yes",
          style: Alert.ActionStyle.Destructive,
          onAction: wipeStorage,
        },
      });
    }
    setIsLoading(true);
    fetchVenues(debouncedQuery)
      .then((features) => {
        if (!features || features.length === 0) return;
        setVenueResults(features);
      })
      .finally(() => setIsLoading(false));
  }, [debouncedQuery]);

  const [favorites, setFavorites] = useState<Feature[]>([]);
  useEffect(() => {
    loadFavorites().then((preferredVenues) => {
      if (preferredVenues) setFavorites(preferredVenues);
    });
  }, []);

  return (
    <List
      navigationTitle={clock}
      searchBarPlaceholder={isLoading ? "Loading..." : `Enter stop name`}
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
                  // Re-add favorite to move it to the top of the list
                  addFavorite(venue);
                  setVenue(venue);
                }}
                venue={venue}
                onSave={() => removeFavorite(venue).then(setFavorites)}
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
                // Re-add favorite to move it to the top of the list
                if (isSaved) addFavorite(venue);
                setVenue(venue);
              }}
              venue={venue}
              onSave={() =>
                isSaved
                  ? removeFavorite(venue).then(setFavorites)
                  : addFavorite(venue).then(setFavorites)
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
      subtitle={`${venue.properties.locality}, ${venue.properties.county}`}
      icon={getVenueCategoryIcon(venue.properties.category)}
      actions={
        <Actions venue={venue} onAction={onAction} isFavorite={isFavorite} onSave={onSave} />
      }
    />
  );
};
