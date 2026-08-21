export type ChoreographyPlanRow = {
  rowNumber: number;
  summary: string; // e.g. "Ela Yıldız (138cm), Kerem Demir (152cm)"
};

export type ChoreographyPlan = {
  id: string;
  teamId: string;
  teamName: string; // snapshot, in case the team is later renamed/deleted
  season: string;
  venueName: string | null; // snapshot, in case the venue is later renamed/deleted
  note: string;
  dancerCount: number;
  maleCount: number;
  femaleCount: number;
  unspecifiedGenderCount: number;
  avgHeight: number | null;
  fitsVenue: boolean | null;
  rows: ChoreographyPlanRow[];
  createdAt: string; // ISO datetime
};

export const initialChoreographyPlans: ChoreographyPlan[] = [];

export function getPlansForTeam(plans: ChoreographyPlan[], teamId: string): ChoreographyPlan[] {
  return plans
    .filter((plan) => plan.teamId === teamId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
