export type Team = {
  id: string;
  name: string;
};

export type SeasonRegion = {
  teamId: string;
  season: string;
  regionName: string;
};

export type SeasonInstructor = {
  teamId: string;
  season: string;
  instructorName: string;
};

export type TeamAssignment = {
  dancerId: string;
  teamId: string;
  season: string;
};

export type DayOfWeek =
  | 'Pazartesi'
  | 'Salı'
  | 'Çarşamba'
  | 'Perşembe'
  | 'Cuma'
  | 'Cumartesi'
  | 'Pazar';

export const DAYS_OF_WEEK: DayOfWeek[] = [
  'Pazartesi',
  'Salı',
  'Çarşamba',
  'Perşembe',
  'Cuma',
  'Cumartesi',
  'Pazar',
];

export const DAY_ABBREVIATIONS: Record<DayOfWeek, string> = {
  Pazartesi: 'Pzt',
  Salı: 'Sal',
  Çarşamba: 'Çar',
  Perşembe: 'Per',
  Cuma: 'Cum',
  Cumartesi: 'Cmt',
  Pazar: 'Paz',
};

export type PracticeSlot = {
  id: string;
  teamId: string;
  season: string;
  day: DayOfWeek;
  startTime: string;
  endTime: string;
};

export type AttendanceRecord = {
  id: string;
  teamId: string;
  dancerId: string;
  date: string; // ISO date, e.g. '2026-08-17'
  present: boolean;
};

export const CURRENT_SEASON = '2025-2026';
export const PREVIOUS_SEASON = '2024-2025';
export const NEXT_SEASON = '2026-2027';

export const initialSeasons: string[] = [PREVIOUS_SEASON, CURRENT_SEASON, NEXT_SEASON];

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

export const initialSeasonInstructors: SeasonInstructor[] = [
  { teamId: '1', season: CURRENT_SEASON, instructorName: 'Ayşe Hoca' },
  { teamId: '2', season: CURRENT_SEASON, instructorName: 'Mehmet Hoca' },
];

export const initialTeamAssignments: TeamAssignment[] = [
  { dancerId: '1', teamId: '2', season: CURRENT_SEASON },
  { dancerId: '2', teamId: '2', season: CURRENT_SEASON },
  { dancerId: '3', teamId: '3', season: CURRENT_SEASON },
  { dancerId: '4', teamId: '4', season: CURRENT_SEASON },
];

export const initialPracticeSlots: PracticeSlot[] = [
  { id: 'ps1', teamId: '1', season: CURRENT_SEASON, day: 'Salı', startTime: '18:00', endTime: '19:00' },
  {
    id: 'ps2',
    teamId: '2',
    season: CURRENT_SEASON,
    day: 'Pazartesi',
    startTime: '18:00',
    endTime: '19:30',
  },
  {
    id: 'ps3',
    teamId: '2',
    season: CURRENT_SEASON,
    day: 'Perşembe',
    startTime: '18:00',
    endTime: '19:30',
  },
  {
    id: 'ps4',
    teamId: '3',
    season: CURRENT_SEASON,
    day: 'Çarşamba',
    startTime: '19:00',
    endTime: '20:30',
  },
  { id: 'ps5', teamId: '4', season: CURRENT_SEASON, day: 'Cuma', startTime: '20:00', endTime: '21:30' },
];

export const initialAttendanceRecords: AttendanceRecord[] = [
  { id: 'att1', teamId: '2', dancerId: '1', date: '2026-08-17', present: true },
  { id: 'att2', teamId: '2', dancerId: '2', date: '2026-08-17', present: false },
];

export function getRegionForSeason(
  seasonRegions: SeasonRegion[],
  teamId: string,
  season: string = CURRENT_SEASON,
) {
  return seasonRegions.find((r) => r.teamId === teamId && r.season === season)?.regionName;
}

export function getInstructorForSeason(
  instructors: SeasonInstructor[],
  teamId: string,
  season: string,
): string | undefined {
  return instructors.find((instructor) => instructor.teamId === teamId && instructor.season === season)
    ?.instructorName;
}

export function setInstructorForSeason(
  instructors: SeasonInstructor[],
  teamId: string,
  season: string,
  instructorName: string,
): SeasonInstructor[] {
  const withoutRecord = instructors.filter(
    (instructor) => !(instructor.teamId === teamId && instructor.season === season),
  );
  if (!instructorName.trim()) return withoutRecord;
  return [...withoutRecord, { teamId, season, instructorName: instructorName.trim() }];
}

export function getAvailableSeasons(seasons: string[], seasonRegions: SeasonRegion[]): string[] {
  const merged = new Set(seasons);
  seasonRegions.forEach((region) => merged.add(region.season));
  return Array.from(merged).sort((a, b) => b.localeCompare(a));
}

export function getNextSeasonLabel(seasons: string[]): string {
  const [latest] = [...seasons].sort((a, b) => b.localeCompare(a));
  const match = latest?.match(/^(\d{4})-(\d{4})$/);
  if (!match) return '';

  const [, startYear, endYear] = match;
  return `${Number(startYear) + 1}-${Number(endYear) + 1}`;
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

export function getPracticeSlotsForTeam(
  slots: PracticeSlot[],
  teamId: string,
  season: string,
): PracticeSlot[] {
  return slots
    .filter((slot) => slot.teamId === teamId && slot.season === season)
    .sort((a, b) => DAYS_OF_WEEK.indexOf(a.day) - DAYS_OF_WEEK.indexOf(b.day));
}

export function formatPracticeSlot(slot: PracticeSlot): string {
  return `${slot.day} ${slot.startTime}-${slot.endTime}`;
}

export function getConflictingPracticeSlots(
  slots: PracticeSlot[],
  excludeTeamId: string,
  season: string,
  day: DayOfWeek,
  startTime: string,
  endTime: string,
): PracticeSlot[] {
  return slots.filter(
    (slot) =>
      slot.teamId !== excludeTeamId &&
      slot.season === season &&
      slot.day === day &&
      slot.startTime < endTime &&
      startTime < slot.endTime,
  );
}

export function getTodayDayOfWeek(): DayOfWeek {
  const jsDay = new Date().getDay(); // 0 (Sunday) .. 6 (Saturday)
  const index = (jsDay + 6) % 7; // convert to Pazartesi=0 .. Pazar=6
  return DAYS_OF_WEEK[index];
}

export function getTeamsPracticingToday(
  slots: PracticeSlot[],
  teams: Team[],
  season: string,
): Team[] {
  const today = getTodayDayOfWeek();
  const teamIds = new Set(
    slots.filter((slot) => slot.season === season && slot.day === today).map((slot) => slot.teamId),
  );
  return teams.filter((team) => teamIds.has(team.id));
}

export function isValidTime(value: string): boolean {
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(value.trim());
}

export function getAttendanceForTeamDate(
  records: AttendanceRecord[],
  teamId: string,
  date: string,
): AttendanceRecord[] {
  return records.filter((record) => record.teamId === teamId && record.date === date);
}

export function getAttendanceStatus(
  records: AttendanceRecord[],
  teamId: string,
  dancerId: string,
  date: string,
): boolean | undefined {
  return records.find(
    (record) => record.teamId === teamId && record.dancerId === dancerId && record.date === date,
  )?.present;
}

export function setAttendance(
  records: AttendanceRecord[],
  teamId: string,
  dancerId: string,
  date: string,
  present: boolean,
): AttendanceRecord[] {
  const withoutRecord = records.filter(
    (record) =>
      !(record.teamId === teamId && record.dancerId === dancerId && record.date === date),
  );
  return [
    ...withoutRecord,
    { id: `${teamId}-${dancerId}-${date}`, teamId, dancerId, date, present },
  ];
}

export function getAttendanceForDancer(
  records: AttendanceRecord[],
  dancerId: string,
): AttendanceRecord[] {
  return records
    .filter((record) => record.dancerId === dancerId)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getConsecutiveAbsences(records: AttendanceRecord[], dancerId: string): number {
  const dancerRecords = getAttendanceForDancer(records, dancerId);
  let count = 0;
  for (const record of dancerRecords) {
    if (record.present) break;
    count += 1;
  }
  return count;
}

export type AttendanceSummary = {
  total: number;
  present: number;
  absent: number;
  absenceRate: number;
};

export function getTeamAttendanceSummary(
  records: AttendanceRecord[],
  teamId: string,
): AttendanceSummary {
  const teamRecords = records.filter((record) => record.teamId === teamId);
  const total = teamRecords.length;
  const absent = teamRecords.filter((record) => !record.present).length;
  return { total, present: total - absent, absent, absenceRate: total > 0 ? absent / total : 0 };
}

export function getAttendanceSummary(
  records: AttendanceRecord[],
  dancerId: string,
): AttendanceSummary {
  const dancerRecords = records.filter((record) => record.dancerId === dancerId);
  const total = dancerRecords.length;
  const absent = dancerRecords.filter((record) => !record.present).length;
  return { total, present: total - absent, absent, absenceRate: total > 0 ? absent / total : 0 };
}
