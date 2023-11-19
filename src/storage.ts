import { LocalStorage } from "@raycast/api";
import { Feature } from "./types";

enum StorageKeys {
  savedFeatures = "@departures/SavedFeatures/v1",

  /**
   * @deprecated Use preferredFeatures instead
   */
  preferredFeatures = "@departures/PreferredFeatures/v1",
}

export async function addFavorite(venue: Feature): Promise<Feature[]> {
  const favorites = await loadFavorites();
  const deDupedFavorites = favorites?.filter((f) => f.properties.id !== venue.properties.id);
  const newFavorites = deDupedFavorites ? [venue, ...deDupedFavorites] : [venue];
  await LocalStorage.setItem(StorageKeys.savedFeatures, JSON.stringify(newFavorites));
  return newFavorites;
}
export async function removeFavorite(venue: Feature): Promise<Feature[]> {
  const favorites = await loadFavorites();
  if (!favorites) return [];
  const newFavorites = favorites.filter((f) => f.properties.id !== venue.properties.id);
  await LocalStorage.setItem(StorageKeys.savedFeatures, JSON.stringify(newFavorites));
  return newFavorites;
}
export async function loadFavorites(): Promise<Feature[] | undefined> {
  const favorites = await LocalStorage.getItem<string>(StorageKeys.savedFeatures);
  if (!favorites) return undefined;
  return JSON.parse(favorites) as Feature[];
}

export async function wipeStorage() {
  Object.values(StorageKeys).forEach(async (key) => {
    await LocalStorage.removeItem(key);
  });
}
