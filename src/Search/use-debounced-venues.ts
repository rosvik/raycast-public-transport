import { Alert, Toast, confirmAlert, showToast } from "@raycast/api";
import { useEffect, useState } from "react";
import { fetchVenues } from "../api";
import { wipeStorage } from "../storage";
import { Feature } from "../types";
import { useDebounce } from "../utils";

export function useDebouncedVenues(
  query: string,
  toast: Promise<Toast> | undefined,
  setToast: (toast: Promise<Toast> | undefined) => void
) {
  const [venueResults, setVenueResults] = useState<Feature[]>([]);

  const resetToast = () => {
    toast && toast.then((t) => t.hide());
    setToast(undefined);
  };

  const debouncedQuery = useDebounce(query, 250);

  useEffect(() => {
    if (!query) return;
    if (toast) return;
    setToast(
      showToast({
        title: "Searching...",
        style: Toast.Style.Animated,
      })
    );
  }, [query]);

  useEffect(() => {
    if (debouncedQuery === undefined || debouncedQuery === "") {
      resetToast();
      return;
    }
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
      resetToast();
      return;
    }
    fetchVenues(debouncedQuery)
      .then((features) => {
        console.log(features?.length);
        if (!features || features.length === 0) {
          setToast(
            showToast({
              title: `No results searching for "${debouncedQuery}"`,
              style: Toast.Style.Failure,
            })
          );
          return;
        }
        setVenueResults(features);
        resetToast();
      })
      .catch(() => {
        setToast(
          showToast({
            title: "Something went wrong",
            style: Toast.Style.Failure,
          })
        );
      });
  }, [debouncedQuery]);

  return {
    venueResults,
  };
}
