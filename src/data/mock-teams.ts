export type Team = {
  id: string;
  name: string;
};

export type SeasonRegion = {
  teamId: string;
  season: string;
  regionName: string;
};

export type TeamAssignment = {
  dancerId: string;
  teamId: string;
  season: string;
};

export const CURRENT_SEASON = '2025-2026';
export const PREVIOUS_SEASON = '2024-2025';
export const NEXT_SEASON = '2026-2027';

export const initialTeams: Team[] = [
  { id: '1', name: '7-9 Yaş' },
  { id: '2', name: '10-13 Yaş' },
  { id: '3', name: '14-17 Yaş' },
  { id: '4', name: 'Yetişkinler' },
];

export const initialSeasonRegions: SeasonRegion[] = [
  { teamId: '1', season: CURRENT_SEASON, regionName: 'Zeybek' },
  { teamId: '2', season: CURRENT_SEASON, regionName: 'Karadeniz' },
  { teamId: '3', season: CURRENT_SEASON, regionName: 'Halay' },
  { teamId: '4', season: CURRENT_SEASON, regionName: 'Teke' },

  { teamId: '1', season: PREVIOUS_SEASON, regionName: 'Horon' },
  { teamId: '2', season: PREVIOUS_SEASON, regionName: 'Zeybek' },
  { teamId: '3', season: PREVIOUS_SEASON, regionName: 'Teke' },
  { teamId: '4', season: PREVIOUS_SEASON, regionName: 'Karadeniz' },
];

export const initialTeamAssignments: TeamAssignment[] = [
  { dancerId: '1', teamId: '2', season: CURRENT_SEASON },
  { dancerId: '2', teamId: '2', season: CURRENT_SEASON },
  { dancerId: '3', teamId: '3', season: CURRENT_SEASON },
  { dancerId: '4', teamId: '4', season: CURRENT_SEASON },
];

export function getRegionForSeason(
  seasonRegions: SeasonRegion[],
  teamId: string,
  season: string = CURRENT_SEASON,
) {
  return seasonRegions.find((r) => r.teamId === teamId && r.season === season)?.regionName;
}

export function getAvailableSeasons(seasonRegions: SeasonRegion[]): string[] {
  const seasons = new Set(seasonRegions.map((region) => region.season));
  seasons.add(CURRENT_SEASON);
  seasons.add(NEXT_SEASON);
  return Array.from(seasons).sort((a, b) => b.localeCompare(a));
}

export function getAssignedDancerIds(
  assignments: TeamAssignment[],
  teamId: string,
  season: string,
): string[] {
  return assignments
    .filter((assignment) => assignment.teamId === teamId && assignment.season === season)
    .map((assignment) => assignment.dancerId);
}

export function getTeamDancerCount(
  assignments: TeamAssignment[],
  teamId: string,
  season: string,
): number {
  return getAssignedDancerIds(assignments, teamId, season).length;
}

export function assignDancerToTeam(
  assignments: TeamAssignment[],
  dancerId: string,
  teamId: string,
  season: string,
): TeamAssignment[] {
  const withoutDancer = assignments.filter(
    (assignment) => !(assignment.dancerId === dancerId && assignment.season === season),
  );
  return [...withoutDancer, { dancerId, teamId, season }];
}

export function unassignDancer(
  assignments: TeamAssignment[],
  dancerId: string,
  season: string,
): TeamAssignment[] {
  return assignments.filter(
    (assignment) => !(assignment.dancerId === dancerId && assignment.season === season),
  );
}

export function getTeamForDancer(
  assignments: TeamAssignment[],
  teams: Team[],
  dancerId: string,
  season: string,
): Team | undefined {
  const assignment = assignments.find(
    (item) => item.dancerId === dancerId && item.season === season,
  );
  if (!assignment) return undefined;
  return teams.find((team) => team.id === assignment.teamId);
}
