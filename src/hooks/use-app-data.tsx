import { createContext, Dispatch, ReactNode, SetStateAction, useContext, useState } from 'react';

import { Dancer, initialDancers } from '@/data/mock-dancers';
import {
  initialSeasonRegions,
  initialTeamAssignments,
  initialTeams,
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
};

const AppDataContext = createContext<AppDataContextValue | null>(null);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [teams, setTeams] = useState<Team[]>(initialTeams);
  const [seasonRegions, setSeasonRegions] = useState<SeasonRegion[]>(initialSeasonRegions);
  const [dancers, setDancers] = useState<Dancer[]>(initialDancers);
  const [assignments, setAssignments] = useState<TeamAssignment[]>(initialTeamAssignments);

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
