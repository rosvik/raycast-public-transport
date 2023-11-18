import { Action, ActionPanel, Alert, Icon, List, confirmAlert } from "@raycast/api";
import { useEffect, useState } from "react";
import { fetchVenues } from "../api";
import { loadPreferrededVenue, wipeStorage } from "../storage";
import { Feature } from "../types";
import { formatAsClockWithSeconds, useDebounce } from "../utils";

export default function SearchPage({ setVenue }: { setVenue: (venue: Feature) => void }) {
  const [query, setQuery] = useState<string>();

  const [clock, setClock] = useState(formatAsClockWithSeconds(new Date().toISOString()));
  setInterval(() => setClock(formatAsClockWithSeconds(new Date().toISOString())), 1000);

  const [isLoadingPreferredVenues, setIsLoadingPreferredVenues] = useState(true);
  const [venueResults, setVenueResults] = useState<Feature[]>([]);

  const debouncedQuery = useDebounce(query, 250);
  useEffect(() => {
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
    setIsLoadingPreferredVenues(true);
    loadPreferrededVenue().then((preferredVenuesIds) => {
      if (debouncedQuery === undefined) {
        setIsLoadingPreferredVenues(false);
        return;
      }
      fetchVenues(debouncedQuery)
        .then((features) => {
          if (!features || features.length === 0) return;
          const venueId = preferredVenuesIds?.find((id) =>
            features.some((f) => f.properties.id === id)
          );
          const venue = features.find((f) => f.properties.id === venueId);
          if (venue) {
            setVenueResults([venue, ...features.filter((f) => f.properties.id !== venueId)]);
          } else {
            setVenueResults(features);
          }
        })
        .finally(() => setIsLoadingPreferredVenues(false));
    });
  }, [debouncedQuery]);

  return (
    <List
      navigationTitle={clock}
      searchBarPlaceholder={isLoadingPreferredVenues ? "Loading..." : `Enter stop name`}
      filtering={{ keepSectionOrder: true }}
      onSearchTextChange={setQuery}
    >
      {!isLoadingPreferredVenues && (
        <List.Section title={"Saved stops"}>
          {venueResults.map((venue) => {
            return (
              <List.Item
                key={venue.properties.id}
                title={venue.properties.label}
                subtitle={venue.properties.label + ", " + venue.properties.county}
                actions={
                  <ActionPanel>
                    <Action
                      title="Open Departures"
                      icon={Icon.ArrowRight}
                      onAction={() => setVenue(venue)}
                    />
                  </ActionPanel>
                }
              />
            );
          })}
        </List.Section>
      )}
    </List>
  );
}
