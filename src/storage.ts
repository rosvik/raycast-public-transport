import { LocalStorage } from "@raycast/api";

enum StorageKeys {
  preferredFeatures = "@departures/PreferredFeatures/v1",
}

export async function storePreferredVenue(featureId: string): Promise<string[]> {
  const features = await loadPreferrededVenue();
  const deDupedFeatures = features?.filter((f) => f !== featureId);
  const newFeatures = deDupedFeatures ? [featureId, ...deDupedFeatures] : [featureId];
  await LocalStorage.setItem(StorageKeys.preferredFeatures, JSON.stringify(newFeatures));
  return newFeatures;
}
export async function loadPreferrededVenue(): Promise<string[] | undefined> {
  const item = await LocalStorage.getItem<string>(StorageKeys.preferredFeatures);
  if (!item) return undefined;
  return JSON.parse(item) as string[];
}

export async function wipeStorage() {
  Object.values(StorageKeys).forEach(async (key) => {
    await LocalStorage.removeItem(key);
  });
}
