import { Team, Score, Event } from '../types';

export interface Round1TopTeamData {
  teamName: string;
  domain: string;
  problemStatement: string;
  round1Score: number;
  rank: number;
}

export interface Round1AllTeamsData {
  teamName: string;
  domain: string;
  problemStatement: string;
  members: string;
  allocatedJudges: string;
  round1Score: number;
  rankInDomain: number;
  overallRank: number;
  status: string;
}

/**
 * Calculate average Round 1 score for a team
 */
function calculateRound1AverageScore(teamId: string, scores: Score[]): number {
  const teamScores = scores.filter(
    s => s.teamId === teamId && s.isFinalized
  );

  if (teamScores.length === 0) return 0;

  const total = teamScores.reduce((sum, score) => sum + score.totalScore, 0);
  return Math.round((total / teamScores.length) * 100) / 100;
}

/**
 * Get top 3 teams from each domain for Round 1
 */
export function getTop3TeamsPerDomain(
  teams: Team[],
  scores: Score[],
  eventId: string
): Round1TopTeamData[] {
  // Filter teams for the specific event that are qualified
  const eventTeams = teams.filter(
    t => t.eventId === eventId && t.qualificationStatus === 'Qualified'
  );

  // Group teams by domain
  const domainGroups: { [domain: string]: Team[] } = {};
  eventTeams.forEach(team => {
    if (!domainGroups[team.domain]) {
      domainGroups[team.domain] = [];
    }
    domainGroups[team.domain].push(team);
  });

  const result: Round1TopTeamData[] = [];

  // For each domain, calculate scores and get top 3
  Object.entries(domainGroups).forEach(([domain, domainTeams]) => {
    // Calculate average scores for each team
    const teamsWithScores = domainTeams.map(team => ({
      team,
      averageScore: calculateRound1AverageScore(team.id, scores)
    }));

    // Sort by score (descending)
    teamsWithScores.sort((a, b) => b.averageScore - a.averageScore);

    // Get top 3
    const top3 = teamsWithScores.slice(0, 3);

    // Add to result with rank
    top3.forEach((item, index) => {
      result.push({
        teamName: item.team.teamName,
        domain: item.team.domain,
        problemStatement: item.team.problemStatement || 'Not provided',
        round1Score: item.averageScore,
        rank: index + 1
      });
    });
  });

  return result;
}

/**
 * Export Round 1 top 3 teams to CSV format
 */
export function exportRound1Top3ToCSV(
  teams: Team[],
  scores: Score[],
  event: Event
): void {
  const topTeams = getTop3TeamsPerDomain(teams, scores, event.id);

  if (topTeams.length === 0) {
    alert('No data available to export. Please ensure teams have been scored.');
    return;
  }

  // Create CSV content
  const headers = ['Domain', 'Rank', 'Team Name', 'Problem Statement', 'Round 1 Score'];
  const rows = topTeams.map(team => [
    team.domain,
    team.rank.toString(),
    team.teamName,
    `"${team.problemStatement.replace(/"/g, '""')}"`, // Escape quotes in problem statement
    team.round1Score.toString()
  ]);

  const csvContent = [
    `"${event.name} - Round 1 Top 3 Teams per Domain"`,
    `"Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}"`,
    '',
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${event.name.replace(/\s+/g, '_')}_Round1_Top3_Teams.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export Round 1 top 3 teams to Excel-compatible format (TSV for better Excel compatibility)
 */
export function exportRound1Top3ToExcel(
  teams: Team[],
  scores: Score[],
  event: Event
): void {
  const topTeams = getTop3TeamsPerDomain(teams, scores, event.id);

  if (topTeams.length === 0) {
    alert('No data available to export. Please ensure teams have been scored in Round 1.');
    return;
  }

  // Group by domain for better organization
  const domainGroups: { [domain: string]: Round1TopTeamData[] } = {};
  topTeams.forEach(team => {
    if (!domainGroups[team.domain]) {
      domainGroups[team.domain] = [];
    }
    domainGroups[team.domain].push(team);
  });

  // Get scoring criteria from event
  const criteriaNames = event.scoringCriteria.map(c => c.name);
  
  // Create Excel-compatible content with proper formatting
  let excelContent = `${event.name} - Round 1 Top 3 Teams per Domain\n`;
  excelContent += `Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}\n\n`;
  excelContent += `Scoring Criteria: ${criteriaNames.join(', ')} + Bonus Marks (up to +5)\n\n`;

  // Add data grouped by domain with detailed scoring
  Object.entries(domainGroups).forEach(([domain, domainTeams]) => {
    excelContent += `\n${domain}\n`;
    excelContent += `Rank\tTeam Name\tProblem Statement\t`;
    
    // Add criteria headers
    event.scoringCriteria.forEach(criterion => {
      excelContent += `${criterion.name} (/${criterion.maxScore})\t`;
    });
    excelContent += `Bonus\tTotal Score\n`;
    
    // Add team data with detailed scores
    domainTeams.forEach(teamData => {
      const team = teams.find(t => t.teamName === teamData.teamName);
      if (!team) return;
      
      // Get average scores for each criterion
      const teamScores = scores.filter(s => s.teamId === team.id && s.isFinalized);
      const avgCriteriaScores: { [key: string]: number } = {};
      let avgBonus = 0;
      
      if (teamScores.length > 0) {
        event.scoringCriteria.forEach(criterion => {
          const criterionScores = teamScores.map(s => s.scores[criterion.id] || 0);
          avgCriteriaScores[criterion.id] = criterionScores.reduce((a, b) => a + b, 0) / criterionScores.length;
        });
        
        const bonusScores = teamScores.map(s => s.bonusScore || 0);
        avgBonus = bonusScores.reduce((a, b) => a + b, 0) / bonusScores.length;
      }
      
      excelContent += `${teamData.rank}\t${teamData.teamName}\t${teamData.problemStatement}\t`;
      
      // Add individual criterion scores
      event.scoringCriteria.forEach(criterion => {
        const score = avgCriteriaScores[criterion.id] || 0;
        excelContent += `${score.toFixed(2)}\t`;
      });
      
      excelContent += `${avgBonus.toFixed(2)}\t${teamData.round1Score}\n`;
    });
  });

  // Create blob and download as .xls file
  const blob = new Blob([excelContent], { type: 'application/vnd.ms-excel' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${event.name.replace(/\s+/g, '_')}_Round1_Top3_Teams.xls`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export ALL Round 1 scores for all teams across all domains
 */
export function exportAllRound1ScoresToExcel(
  teams: Team[],
  scores: Score[],
  event: Event,
  judges: any[]
): void {
  // Filter teams for the specific event
  const eventTeams = teams.filter(t => t.eventId === event.id);

  if (eventTeams.length === 0) {
    alert('No teams available to export.');
    return;
  }

  // Calculate scores for all teams
  const teamsWithScores = eventTeams.map(team => ({
    team,
    averageScore: calculateRound1AverageScore(team.id, scores)
  }));

  // Sort by score (descending) for overall ranking
  const sortedTeams = [...teamsWithScores].sort((a, b) => b.averageScore - a.averageScore);

  // Group by domain for domain-wise ranking
  const domainGroups: { [domain: string]: typeof teamsWithScores } = {};
  teamsWithScores.forEach(item => {
    if (!domainGroups[item.team.domain]) {
      domainGroups[item.team.domain] = [];
    }
    domainGroups[item.team.domain].push(item);
  });

  // Sort each domain group
  Object.keys(domainGroups).forEach(domain => {
    domainGroups[domain].sort((a, b) => b.averageScore - a.averageScore);
  });

  // Get scoring criteria from event
  const criteriaNames = event.scoringCriteria.map(c => c.name);
  
  // Create Excel content with comprehensive data
  let excelContent = `${event.name} - Complete Round 1 Scores - All Teams\n`;
  excelContent += `Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}\n`;
  excelContent += `Total Teams: ${eventTeams.length}\n`;
  excelContent += `Scoring Criteria: ${criteriaNames.join(', ')} + Bonus Marks (up to +5)\n\n`;

  // Add summary by domain
  excelContent += `SUMMARY BY DOMAIN\n`;
  excelContent += `Domain\tTotal Teams\tAverage Score\tTop Score\n`;
  
  Object.entries(domainGroups).forEach(([domain, domainTeams]) => {
    const avgScore = domainTeams.reduce((sum, t) => sum + t.averageScore, 0) / domainTeams.length;
    const topScore = domainTeams[0]?.averageScore || 0;
    excelContent += `${domain}\t${domainTeams.length}\t${avgScore.toFixed(2)}\t${topScore.toFixed(2)}\n`;
  });

  excelContent += `\n\n`;

  // Add detailed scores grouped by domain with criteria breakdown
  Object.entries(domainGroups).forEach(([domain, domainTeams]) => {
    excelContent += `\n${domain.toUpperCase()}\n`;
    excelContent += `Rank\tTeam Name\tMembers\tProblem Statement\tAllocated Judges\t`;
    
    // Add criteria headers
    event.scoringCriteria.forEach(criterion => {
      excelContent += `${criterion.name} (/${criterion.maxScore})\t`;
    });
    excelContent += `Bonus\tTotal Score\tStatus\n`;
    
    domainTeams.forEach((item, index) => {
      const members = item.team.members.map(m => m.name).join(', ');
      const judgeIds = item.team.allocatedJudges?.round1 || [];
      const judgeNames = judgeIds.map(jId => {
        const judge = judges.find(j => j.id === jId);
        return judge ? judge.name : jId;
      }).join(', ');
      
      // Calculate average scores for each criterion
      const teamScores = scores.filter(s => s.teamId === item.team.id && s.isFinalized);
      const avgCriteriaScores: { [key: string]: number } = {};
      let avgBonus = 0;
      
      if (teamScores.length > 0) {
        event.scoringCriteria.forEach(criterion => {
          const criterionScores = teamScores.map(s => s.scores[criterion.id] || 0);
          avgCriteriaScores[criterion.id] = criterionScores.reduce((a, b) => a + b, 0) / criterionScores.length;
        });
        
        const bonusScores = teamScores.map(s => s.bonusScore || 0);
        avgBonus = bonusScores.reduce((a, b) => a + b, 0) / bonusScores.length;
      }
      
      const status = item.averageScore > 0 ? 'Scored' : 'Not Scored';
      const domainRank = index + 1;
      
      excelContent += `${domainRank}\t${item.team.teamName}\t${members}\t${item.team.problemStatement || 'Not provided'}\t${judgeNames}\t`;
      
      // Add individual criterion scores
      event.scoringCriteria.forEach(criterion => {
        const score = avgCriteriaScores[criterion.id] || 0;
        excelContent += `${score > 0 ? score.toFixed(2) : '-'}\t`;
      });
      
      excelContent += `${avgBonus > 0 ? avgBonus.toFixed(2) : '-'}\t${item.averageScore.toFixed(2)}\t${status}\n`;
    });
  });

  // Add overall rankings at the end
  excelContent += `\n\nOVERALL RANKINGS (All Domains Combined)\n`;
  excelContent += `Overall Rank\tTeam Name\tDomain\tRound 1 Score\n`;
  
  sortedTeams.forEach((item, index) => {
    if (item.averageScore > 0) {
      excelContent += `${index + 1}\t${item.team.teamName}\t${item.team.domain}\t${item.averageScore.toFixed(2)}\n`;
    }
  });

  // Create blob and download as .xls file
  const blob = new Blob([excelContent], { type: 'application/vnd.ms-excel' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${event.name.replace(/\s+/g, '_')}_Round1_Complete_Scores.xls`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export Round 2 Results (Top 15 teams - Simplified)
 */
export function exportRound2ResultsToExcel(
  teams: Team[],
  scores: Score[],
  event: Event,
  judges: any[]
): void {
  // Get top 15 teams (top 3 from each domain based on Round 1)
  const top15Teams = getTop3TeamsPerDomain(teams, scores, event.id);

  if (top15Teams.length === 0) {
    alert('No Round 2 teams available. Please ensure Round 1 has been completed and scored.');
    return;
  }

  // Get external judges for Round 2 scoring
  const externalJudges = judges.filter(j => j.type === 'External');

  // Calculate Round 2 scores for each team
  const round2Results = top15Teams.map(topTeam => {
    const team = teams.find(t => t.teamName === topTeam.teamName);
    if (!team) return null;

    // Get Round 2 scores for this team from external judges
    const teamRound2Scores = scores.filter(s => 
      s.teamId === team.id && 
      s.isFinalized &&
      externalJudges.some(j => j.id === s.judgeId)
    );

    // Calculate average Round 2 score
    const round2Average = teamRound2Scores.length > 0
      ? teamRound2Scores.reduce((sum, s) => sum + s.totalScore, 0) / teamRound2Scores.length
      : 0;

    return {
      teamId: team.id,
      teamName: topTeam.teamName,
      leaderName: team.members[0]?.name || 'N/A',
      problemStatement: topTeam.problemStatement,
      ideaDescription: team.problemStatement || 'N/A',
      round2Average
    };
  }).filter(r => r !== null);

  // Sort by Round 2 average score (descending)
  round2Results.sort((a, b) => b!.round2Average - a!.round2Average);

  // Create simplified Excel content
  let excelContent = `${event.name} - Round 2 Results (Top 15 Teams)\n`;
  excelContent += `Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}\n\n`;

  // Header row
  excelContent += `Rank\tTeam ID\tTeam Name\tTeam Leader Name\tProblem Statement\tIdea Description\tTotal Score\n`;

  // Data rows
  round2Results.forEach((result, index) => {
    if (!result) return;
    
    const rank = index + 1;

    excelContent += `${rank}\t${result.teamId}\t${result.teamName}\t${result.leaderName}\t${result.problemStatement}\t${result.ideaDescription}\t${result.round2Average.toFixed(2)}\n`;
  });

  // Add Top 3 Summary
  excelContent += `\n\nTOP 3 RANKINGS\n`;
  excelContent += `Rank\tTeam ID\tTeam Name\tTeam Leader Name\tTotal Score\n`;
  
  round2Results.slice(0, 3).forEach((result, index) => {
    if (!result) return;
    const rank = index + 1;
    excelContent += `${rank}\t${result.teamId}\t${result.teamName}\t${result.leaderName}\t${result.round2Average.toFixed(2)}\n`;
  });

  // Create blob and download
  const blob = new Blob([excelContent], { type: 'application/vnd.ms-excel' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${event.name.replace(/\s+/g, '_')}_Round2_Results.xls`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}