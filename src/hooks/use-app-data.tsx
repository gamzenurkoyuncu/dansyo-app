import { createContext, Dispatch, ReactNode, SetStateAction, useContext, useState } from 'react';

import { CostumeArchiveEntry, initialCostumeArchive } from '@/data/mock-costume-archive';
import { Dancer, initialDancers } from '@/data/mock-dancers';
import { initialPaymentRecords, PaymentRecord } from '@/data/mock-payments';
import { initialVenues, Venue } from '@/data/mock-venues';
import {
  AttendanceRecord,
  CURRENT_SEASON,
  initialAttendanceRecords,
  initialPracticeSlots,
  initialSeasonInstructors,
  initialSeasonRegions,
  initialSeasons,
  initialTeamAssignments,
  initialTeams,
  PracticeSlot,
  SeasonInstructor,
  SeasonRegion,
  Team,
  TeamAssignment,
} from '@/data/mock-teams';

export type ThemePreference = 'light' | 'dark' | 'system';

type AppDataContextValue = {
  themePreference: ThemePreference;
  setThemePreference: Dispatch<SetStateAction<ThemePreference>>;
  teams: Team[];
  setTeams: Dispatch<SetStateAction<Team[]>>;
  seasonRegions: SeasonRegion[];
  setSeasonRegions: Dispatch<SetStateAction<SeasonRegion[]>>;
  seasonInstructors: SeasonInstructor[];
  setSeasonInstructors: Dispatch<SetStateAction<SeasonInstructor[]>>;
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
  paymentRecords: PaymentRecord[];
  setPaymentRecords: Dispatch<SetStateAction<PaymentRecord[]>>;
  costumeArchive: CostumeArchiveEntry[];
  setCostumeArchive: Dispatch<SetStateAction<CostumeArchiveEntry[]>>;
  venues: Venue[];
  setVenues: Dispatch<SetStateAction<Venue[]>>;
};

const AppDataContext = createContext<AppDataContextValue | null>(null);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [themePreference, setThemePreference] = useState<ThemePreference>('system');
  const [teams, setTeams] = useState<Team[]>(initialTeams);
  const [seasonRegions, setSeasonRegions] = useState<SeasonRegion[]>(initialSeasonRegions);
  const [seasonInstructors, setSeasonInstructors] =
    useState<SeasonInstructor[]>(initialSeasonInstructors);
  const [dancers, setDancers] = useState<Dancer[]>(initialDancers);
  const [assignments, setAssignments] = useState<TeamAssignment[]>(initialTeamAssignments);
  const [seasons, setSeasons] = useState<string[]>(initialSeasons);
  const [currentSeason, setCurrentSeason] = useState<string>(CURRENT_SEASON);
  const [practiceSlots, setPracticeSlots] = useState<PracticeSlot[]>(initialPracticeSlots);
  const [attendanceRecords, setAttendanceRecords] =
    useState<AttendanceRecord[]>(initialAttendanceRecords);
  const [paymentRecords, setPaymentRecords] = useState<PaymentRecord[]>(initialPaymentRecords);
  const [costumeArchive, setCostumeArchive] =
    useState<CostumeArchiveEntry[]>(initialCostumeArchive);
  const [venues, setVenues] = useState<Venue[]>(initialVenues);

  return (
    <AppDataContext
      value={{
        themePreference,
        setThemePreference,
        teams,
        setTeams,
        seasonRegions,
        setSeasonRegions,
        seasonInstructors,
        setSeasonInstructors,
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
        paymentRecords,
        setPaymentRecords,
        costumeArchive,
        setCostumeArchive,
        venues,
        setVenues,
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
