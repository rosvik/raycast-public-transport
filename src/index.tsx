import { useState } from "react";
import SearchPage from "./Search/SearchPage";
import StopPlacePage from "./StopPlace/StopPlacePage";
import { Feature } from "./types";

export default function Command() {
  const [venue, setVenue] = useState<Feature>();

  if (venue) {
    return <StopPlacePage venue={venue}></StopPlacePage>;
  }
  return <SearchPage setVenue={setVenue}></SearchPage>;
}
