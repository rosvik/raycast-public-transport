import { LocalStorage } from "@raycast/api";
import { Feature } from "./types";

enum StorageKeys {
  savedFeatures = "@departures/SavedFeatures/v1",

  /**
   * @deprecated Use preferredFeatures instead
   */
  preferredFeatures = "@departures/PreferredFeatures/v1",
}

export async function storePreferredVenue(feature: Feature): Promise<Feature[]> {
  const features = await loadPreferrededVenue();
  const deDupedFeatures = features?.filter((f) => f.properties.id !== feature.properties.id);
  const newFeatures = deDupedFeatures ? [feature, ...deDupedFeatures] : [feature];
  await LocalStorage.setItem(StorageKeys.savedFeatures, JSON.stringify(newFeatures));
  return newFeatures;
}
export async function loadPreferrededVenue(): Promise<Feature[] | undefined> {
  const item = await LocalStorage.getItem<string>(StorageKeys.savedFeatures);
  if (!item) return undefined;
  return JSON.parse(item) as Feature[];
}

export async function wipeStorage() {
  Object.values(StorageKeys).forEach(async (key) => {
    await LocalStorage.removeItem(key);
  });
}
