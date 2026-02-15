export type EventType = 'Startup Pitching' | 'Hackathon' | 'Technical' | 'Cultural';

export type QualificationStatus = 'Pending' | 'Qualified' | 'Eliminated' | 'Winner';

export type UserRole = 'admin' | 'judge';

export type JudgeType = 'Internal' | 'External';

export type RoundType = 'Round 1' | 'Round 2' | 'Finals';

export interface TeamMember {
  name: string;
  email: string;
  phone: string;
}

export interface TeamAllocation {
  teamId: string;
  judgeIds: string[];
  round: RoundType;
}

export interface Team {
  id: string;
  teamName: string;
  eventId: string;
  members: TeamMember[];
  domain: string;
  problemStatement?: string;
  qualificationStatus: QualificationStatus;
  createdAt: string;
  currentRound?: RoundType;
  allocatedJudges?: {
    round1?: string[];
    round2?: string[];
  };
}

export interface ScoringCriterion {
  id: string;
  name: string;
  maxScore: number;
  description?: string;
}

export interface Event {
  id: string;
  name: string;
  type: EventType;
  description: string;
  domains: string[];
  date: string;
  registrationFee: number;
  format: string;
  deadlines: string[];
  prizePool: string;
  assignedJudges: string[];
  scoringCriteria: ScoringCriterion[];
  isLocked: boolean;
  createdAt: string;
}

export interface Score {
  id: string;
  eventId: string;
  teamId: string;
  judgeId: string;
  judgeName: string;
  scores: { [criterionId: string]: number };
  bonusScore?: number;
  totalScore: number;
  remarks?: string;
  submittedAt: string;
  isFinalized: boolean;
}

export interface Judge {
  id: string;
  name: string;
  email: string;
  expertise: string[];
  assignedEventIds: string[];
  type: JudgeType;
  assignedDomain?: string; // For Internal judges - their assigned domain
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  judgeProfile?: Judge;
}

export interface TeamWithScores extends Team {
  averageScore: number;
  totalJudges: number;
  scoresReceived: number;
  rank?: number;
  individualScores: Score[];
}