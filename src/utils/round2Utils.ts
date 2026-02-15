import { Team, Score } from '../types';

/**
 * Calculate average Round 1 score for a team
 */
export function calculateRound1AverageScore(teamId: string, scores: Score[]): number {
  const teamScores = scores.filter(
    s => s.teamId === teamId && s.isFinalized
  );

  if (teamScores.length === 0) return 0;

  const total = teamScores.reduce((sum, score) => sum + score.totalScore, 0);
  return Math.round((total / teamScores.length) * 100) / 100;
}

/**
 * Get the IDs of top 3 teams from each domain based on Round 1 scores
 * This returns exactly 15 team IDs (3 per domain x 5 domains)
 */
export function getTop15TeamIds(
  teams: Team[],
  scores: Score[],
  eventId: string
): string[] {
  // Filter teams for the specific event
  const eventTeams = teams.filter(t => t.eventId === eventId);

  // Group teams by domain
  const domainGroups: { [domain: string]: Team[] } = {};
  eventTeams.forEach(team => {
    if (!domainGroups[team.domain]) {
      domainGroups[team.domain] = [];
    }
    domainGroups[team.domain].push(team);
  });

  const top15TeamIds: string[] = [];

  // For each domain, calculate scores and get top 3
  Object.entries(domainGroups).forEach(([domain, domainTeams]) => {
    // Calculate average scores for each team
    const teamsWithScores = domainTeams.map(team => ({
      teamId: team.id,
      averageScore: calculateRound1AverageScore(team.id, scores)
    }));

    // Sort by score (descending)
    teamsWithScores.sort((a, b) => b.averageScore - a.averageScore);

    // Get top 3 team IDs
    const top3Ids = teamsWithScores.slice(0, 3).map(t => t.teamId);
    top15TeamIds.push(...top3Ids);
  });

  return top15TeamIds;
}

/**
 * Check if a team is in the top 15 (top 3 per domain) for Round 2
 */
export function isTeamInRound2(
  teamId: string,
  teams: Team[],
  scores: Score[],
  eventId: string
): boolean {
  const top15Ids = getTop15TeamIds(teams, scores, eventId);
  return top15Ids.includes(teamId);
}

/**
 * Get all teams that qualified for Round 2 (top 3 from each domain)
 */
export function getRound2Teams(
  teams: Team[],
  scores: Score[],
  eventId: string
): Team[] {
  const top15Ids = getTop15TeamIds(teams, scores, eventId);
  return teams.filter(t => top15Ids.includes(t.id));
}
