import { createContext, Dispatch, ReactNode, SetStateAction, useContext, useState } from 'react';

import { Dancer, initialDancers } from '@/data/mock-dancers';
import {
  AttendanceRecord,
  CURRENT_SEASON,
  initialAttendanceRecords,
  initialPracticeSlots,
  initialSeasonRegions,
  initialSeasons,
  initialTeamAssignments,
  initialTeams,
  PracticeSlot,
  SeasonRegion,
  Team,
  TeamAssignment,
} from '@/data/mock-teams';

type AppDataContextValue = {
  teams: Team[];
  setTeams: Dispatch<SetStateAction<Team[]>>;
  seasonRegions: SeasonRegion[];
  setSeasonRegions: Dispatch<SetStateAction<SeasonRegion[]>>;
  dancers: Dancer[];
  setDancers: Dispatch<SetStateAction<Dancer[]>>;
  assignments: TeamAssignment[];
  setAssignments: Dispatch<SetStateAction<TeamAssignment[]>>;
  seasons: string[];
  setSeasons: Dispatch<SetStateAction<string[]>>;
  currentSeason: string;
  setCurrentSeason: Dispatch<SetStateAction<string>>;
  practiceSlots: PracticeSlot[];
  setPracticeSlots: Dispatch<SetStateAction<PracticeSlot[]>>;
  attendanceRecords: AttendanceRecord[];
  setAttendanceRecords: Dispatch<SetStateAction<AttendanceRecord[]>>;
};

const AppDataContext = createContext<AppDataContextValue | null>(null);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [teams, setTeams] = useState<Team[]>(initialTeams);
  const [seasonRegions, setSeasonRegions] = useState<SeasonRegion[]>(initialSeasonRegions);
  const [dancers, setDancers] = useState<Dancer[]>(initialDancers);
  const [assignments, setAssignments] = useState<TeamAssignment[]>(initialTeamAssignments);
  const [seasons, setSeasons] = useState<string[]>(initialSeasons);
  const [currentSeason, setCurrentSeason] = useState<string>(CURRENT_SEASON);
  const [practiceSlots, setPracticeSlots] = useState<PracticeSlot[]>(initialPracticeSlots);
  const [attendanceRecords, setAttendanceRecords] =
    useState<AttendanceRecord[]>(initialAttendanceRecords);

  return (
    <AppDataContext
      value={{
        teams,
        setTeams,
        seasonRegions,
        setSeasonRegions,
        dancers,
        setDancers,
        assignments,
        setAssignments,
        seasons,
        setSeasons,
        currentSeason,
        setCurrentSeason,
        practiceSlots,
        setPracticeSlots,
        attendanceRecords,
        setAttendanceRecords,
      }}>
      {children}
    </AppDataContext>
  );
}

export function useAppData() {
  const context = useContext(AppDataContext);
  if (!context) {
    throw new Error('useAppData must be used within an AppDataProvider');
  }
  return context;
}
