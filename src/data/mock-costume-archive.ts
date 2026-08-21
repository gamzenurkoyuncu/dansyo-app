import { SeasonRegion } from '@/data/mock-teams';

export type CostumeArchiveEntry = {
  id: string;
  regionName: string;
  season: string;
  imageUri: string;
  createdAt: string; // ISO date, for sorting
};

export const initialCostumeArchive: CostumeArchiveEntry[] = [];

export function getArchiveRegionNames(
  entries: CostumeArchiveEntry[],
  seasonRegions: SeasonRegion[],
): string[] {
  const names = new Set<string>();
  seasonRegions.forEach((region) => {
    if (region.regionName.trim()) names.add(region.regionName.trim());
  });
  entries.forEach((entry) => names.add(entry.regionName));
  return Array.from(names).sort((a, b) => a.localeCompare(b, 'tr'));
}

export function getArchiveEntriesFor(
  entries: CostumeArchiveEntry[],
  regionName: string,
  season: string,
): CostumeArchiveEntry[] {
  return entries
    .filter((entry) => entry.regionName === regionName && entry.season === season)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
