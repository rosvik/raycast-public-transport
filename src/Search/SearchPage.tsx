import { Alert, List, clearSearchBar, confirmAlert } from "@raycast/api";
import { useEffect, useState } from "react";
import { fetchVenues } from "../api";
import {
  deletePreferredVenue,
  loadPreferrededVenue,
  storePreferredVenue,
  wipeStorage,
} from "../storage";
import { Feature } from "../types";
import { formatAsClockWithSeconds, getVenueCategoryIcon, useDebounce } from "../utils";
import { Actions } from "./Actions";

export default function SearchPage({ setVenue }: { setVenue: (venue: Feature) => void }) {
  const [query, setQuery] = useState<string>();

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

  const [savedVenues, setSavedVenues] = useState<Feature[]>([]);
  useEffect(() => {
    loadPreferrededVenue().then((preferredVenues) => {
      if (preferredVenues) setSavedVenues(preferredVenues);
    });
  }, []);

  return (
    <List
      navigationTitle={clock}
      searchBarPlaceholder={isLoading ? "Loading..." : `Enter stop name`}
      searchText={query}
      onSearchTextChange={setQuery}
    >
      <List.Section title="Saved Stops">
        {savedVenues
          .filter((v) => v.properties.name.toUpperCase().indexOf(query?.toUpperCase() ?? "") >= 0)
          .map((venue) => {
            return (
              <VenueListItem
                key={venue.properties.id}
                onAction={() => {
                  clearSearchBar();
                  // Re-add venue to saved venues to move it to the top of the list
                  storePreferredVenue(venue);
                  setVenue(venue);
                }}
                venue={venue}
                onSave={() => deletePreferredVenue(venue).then(setSavedVenues)}
                isSaved={true}
              />
            );
          })}
      </List.Section>
      <List.Section title="Search Results">
        {venueResults.map((venue) => {
          const isSaved = savedVenues.some((v) => v.properties.id === venue.properties.id);
          return (
            <VenueListItem
              key={venue.properties.id}
              onAction={() => {
                clearSearchBar();
                // Re-add venue to saved venues to move it to the top of the list
                if (isSaved) storePreferredVenue(venue);
                setVenue(venue);
              }}
              venue={venue}
              onSave={() =>
                isSaved
                  ? deletePreferredVenue(venue).then(setSavedVenues)
                  : storePreferredVenue(venue).then(setSavedVenues)
              }
              isSaved={isSaved}
            />
          );
        })}
      </List.Section>
    </List>
  );
}

const VenueListItem = ({
  venue,
  isSaved,
  onAction,
  onSave,
}: {
  venue: Feature;
  isSaved: boolean;
  onAction: () => void;
  onSave: () => void;
}) => {
  return (
    <List.Item
      title={venue.properties.name}
      subtitle={`${venue.properties.locality}, ${venue.properties.county}`}
      icon={getVenueCategoryIcon(venue.properties.category)}
      actions={<Actions venue={venue} onAction={onAction} isSaved={isSaved} onSave={onSave} />}
    />
  );
};
