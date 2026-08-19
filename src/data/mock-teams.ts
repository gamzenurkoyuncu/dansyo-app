export type Team = {
  id: string;
  name: string;
  dancerCount: number;
};

export type SeasonRegion = {
  teamId: string;
  season: string;
  regionName: string;
};

export const CURRENT_SEASON = '2025-2026';

export const initialTeams: Team[] = [
  { id: '1', name: '7-9 Yaş', dancerCount: 12 },
  { id: '2', name: '10-13 Yaş', dancerCount: 18 },
  { id: '3', name: '14-17 Yaş', dancerCount: 9 },
  { id: '4', name: 'Yetişkinler', dancerCount: 15 },
];

export const initialSeasonRegions: SeasonRegion[] = [
  { teamId: '1', season: CURRENT_SEASON, regionName: 'Zeybek' },
  { teamId: '2', season: CURRENT_SEASON, regionName: 'Karadeniz' },
  { teamId: '3', season: CURRENT_SEASON, regionName: 'Halay' },
  { teamId: '4', season: CURRENT_SEASON, regionName: 'Teke' },
];

export function getRegionForSeason(
  seasonRegions: SeasonRegion[],
  teamId: string,
  season: string = CURRENT_SEASON,
) {
  return seasonRegions.find((r) => r.teamId === teamId && r.season === season)?.regionName;
}
