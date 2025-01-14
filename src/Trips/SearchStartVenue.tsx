import { useNavigation } from "@raycast/api";
import Search from "../Search/Search";
import SearchDestinationVenue from "./SearchDestinationVenue";

export default function SearchStartVenue() {
  const { push } = useNavigation();

  return (
    <Search
      searchBarPlaceholder="Find trip from..."
      primaryActionTitle="Select Start Stop"
      onSubmit={(venue) => push(<SearchDestinationVenue origin={venue} />)}
    />
  );
}
