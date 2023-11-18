import { useState } from "react";
import SearchPage from "./Search/Search";
import StopPlacePage from "./StopPlace/StopPlace";
import { Feature } from "./types";

export default function Command() {
  const [venue, setVenue] = useState<Feature>();

  if (venue) {
    return <StopPlacePage venue={venue}></StopPlacePage>;
  }
  return <SearchPage setVenue={setVenue}></SearchPage>;
}
