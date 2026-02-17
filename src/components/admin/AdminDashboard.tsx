import { useMemo } from 'react';
import { Link } from 'react-router';
import { 
  Calendar, Users, Gavel, Trophy, 
  TrendingUp, FileText, Download, CheckCircle,
  Clock, XCircle, Award, ChevronDown
} from 'lucide-react';
  import { Loader2 } from 'lucide-react';
import { Event, Team, Score, Judge, JudgeType } from '../../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { exportRound1Top3ToExcel, exportAllRound1ScoresToExcel, exportRound2ResultsToExcel } from '../../utils/excelExport';
import { exportJsonToExcel } from '../../utils/exportUtils';
import * as XLSX from 'xlsx';
import { listRoundOneResults, calculateRoundOneResults, calculateRoundTwoResults, listRoundTwoAllocations, setupRoundTwo, getRoundOneStatus, createJudge, updateJudge, listRoundTwoTeamsScores, listRoundTwoResults } from '../../api/scoringApi';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '../ui/collapsible';

interface AdminDashboardProps {
  events: Event[];
  teams: Team[];
  scores: Score[];
  judges: Judge[];
  onJudgeCreated: (judge: Judge) => void;
  onJudgeUpdated: (judge: Judge) => void;
  onRefreshRound2Allocations?: () => Promise<void> | void;
}

export function AdminDashboard({ events, teams, scores, judges, onJudgeCreated, onJudgeUpdated, onRefreshRound2Allocations }: AdminDashboardProps) {
  // Calculate statistics
  const stats = useMemo(() => {
    const totalEvents = events.length;
    const totalTeams = teams.length;
    const totalJudges = judges.length;
    const round1ScoresSubmitted = scores.filter(s => s.round !== 'Round 2').length;
    const round2ScoresSubmitted = scores.filter(s => s.round === 'Round 2').length;
    
    const qualified = teams.filter(t => t.qualificationStatus === 'Qualified').length;
    const winners = teams.filter(t => t.qualificationStatus === 'Winner').length;

    return {
      totalEvents,
      totalTeams,
      totalJudges,
      round1ScoresSubmitted,
      round2ScoresSubmitted,
      qualified,
      winners
    };
  }, [events, teams, scores, judges]);

  // Calculate if all teams have at least one Round 1 score
  const round1ScoredTeams = useMemo(() => {
    const ids = new Set(scores.filter(s => s.round !== 'Round 2').map(s => s.teamId));
    return ids.size;
  }, [scores]);

  const canCalculateRound1 = teams.length > 0 && round1ScoredTeams === teams.length;

  // Round 2: determine allocated teams for round 2 and whether all have scores
  const [round2AllocatedCount, setRound2AllocatedCount] = useState<number | null>(null);
  const [round2Calculated, setRound2Calculated] = useState(false);
  const round2ScoredTeams = useMemo(() => {
    const ids = new Set(scores.filter(s => s.round === 'Round 2').map(s => s.teamId));
    return ids.size;
  }, [scores]);

  const canCalculateRound2 = round2AllocatedCount !== null && round2AllocatedCount > 0 && round2ScoredTeams === round2AllocatedCount;

  const refreshRound2Allocations = async () => {
    const rows: any[] = await listRoundTwoAllocations().catch(() => []);
    const unique = new Set(rows.map(r => r.teamId));
    setRound2AllocatedCount(unique.size);
  };

  useEffect(() => {
    let mounted = true;
    refreshRound2Allocations().catch(() => {
      if (!mounted) return;
      setRound2AllocatedCount(0);
    });
    return () => { mounted = false; };
  }, []);

  // On mount, check if Round 2 results already exist (persist green state)
  useEffect(() => {
    let mounted = true;
    listRoundTwoResults()
      .then((res: any) => {
        if (!mounted) return;
        if (Array.isArray(res) && res.length > 0) {
          setRound2Calculated(true);
        }
      })
      .catch(() => {})
      .finally(() => {});
    return () => { mounted = false; };
  }, []);

  const [loadingRound1, setLoadingRound1] = useState(false);
  const [loadingRound2, setLoadingRound2] = useState(false);
  const [loadingSetupRound2, setLoadingSetupRound2] = useState(false);
  const [round1Calculated, setRound1Calculated] = useState(false);
  const [displayRound1ScoredTeams, setDisplayRound1ScoredTeams] = useState(0);
  const [round1HasResults, setRound1HasResults] = useState(false);
  const [loadingRound1Status, setLoadingRound1Status] = useState(false);
  const [round2SetupCompleted, setRound2SetupCompleted] = useState(false);

  const [judgeName, setJudgeName] = useState('');
  const [judgeId, setJudgeId] = useState('');
  const [judgeType, setJudgeType] = useState<JudgeType>('Internal');
  const [editingJudgeId, setEditingJudgeId] = useState<string>('');
  const [savingJudge, setSavingJudge] = useState(false);
  const [isJudgeFormOpen, setIsJudgeFormOpen] = useState(false);

  const externalJudges = useMemo(() => judges.filter(j => j.type === 'External'), [judges]);
  const hasRound2Setup = round2SetupCompleted || (round2AllocatedCount || 0) > 0;
  const canSetupRound2 = externalJudges.length > 0 && round1HasResults && !hasRound2Setup;

  useEffect(() => {
    setRound2SetupCompleted((round2AllocatedCount || 0) > 0);
  }, [round2AllocatedCount]);

  const handleSelectJudge = (value: string) => {
    setEditingJudgeId(value);
    const target = judges.find(j => j.backendId === value);
    if (!target) {
      setJudgeName('');
      setJudgeId('');
      setJudgeType('Internal');
      return;
    }
    setJudgeName(target.name);
    setJudgeId(target.id);
    setJudgeType(target.type);
  };

  const resetJudgeForm = () => {
    setEditingJudgeId('');
    setJudgeName('');
    setJudgeId('');
    setJudgeType('Internal');
  };

  const handleSaveJudge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!judgeName.trim() || !judgeId.trim()) return;
    setSavingJudge(true);
    try {
      if (editingJudgeId) {
        const res: any = await updateJudge(editingJudgeId, {
          name: judgeName.trim(),
          judgeId: judgeId.trim(),
          judgeType
        });
        onJudgeUpdated({
          backendId: res.id || editingJudgeId,
          id: res.judgeId || judgeId.trim(),
          name: res.name || judgeName.trim(),
          email: '',
          expertise: [],
          assignedEventIds: ['event-1'],
          type: res.judgeType || judgeType
        });
        toast.success('Judge updated');
      } else {
        const res: any = await createJudge({
          name: judgeName.trim(),
          judgeId: judgeId.trim(),
          judgeType
        });
        onJudgeCreated({
          backendId: res.id,
          id: res.judgeId || judgeId.trim(),
          name: res.name || judgeName.trim(),
          email: '',
          expertise: [],
          assignedEventIds: ['event-1'],
          type: res.judgeType || judgeType
        });
        toast.success('Judge added');
      }
      resetJudgeForm();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save judge');
    } finally {
      setSavingJudge(false);
    }
  };

  // Handler for Round 1 export
  const handleExportRound1Top3 = async () => {
    if (events.length === 0) {
      alert('No events available. Please create an event first.');
      return;
    }
    
    const mainEvent = events[0];
    const allDomains = ['fintech_ecommerce', 'health_biotech', 'agritech_rural', 'sustainable_smart_cities', 'skills_edtech'];
    const domainNames: Record<string, string> = {
      'fintech_ecommerce': 'Fintech and E-commerce',
      'health_biotech': 'Health and BioTech',
      'agritech_rural': 'Agri-Tech & Rural Empowerment',
      'sustainable_smart_cities': 'Sustainable solutions and smart cities',
      'skills_edtech': 'Skills and Edtech'
    };
    
    const allResults: any[] = [];
    
    // Fetch top 3 teams from each domain
    for (const domainKey of allDomains) {
      const scores = await listRoundOneResults(domainKey).catch(() => []);
      
      if (scores.length > 0) {
        // Group by team to calculate rank
        const teamTotals = new Map<string, { teamName: string; totalScore: number; scores: any[] }>();
        
        scores.forEach((score: any) => {
          if (!teamTotals.has(score.teamId)) {
            teamTotals.set(score.teamId, {
              teamName: score.teamName,
              totalScore: 0,
              scores: []
            });
          }
          const team = teamTotals.get(score.teamId)!;
          team.totalScore += Number(score.total ?? 0);
          team.scores.push(score);
        });
        
        // Sort teams by total score and get top 3
        const sortedTeams = Array.from(teamTotals.entries())
          .sort((a, b) => b[1].totalScore - a[1].totalScore)
          .slice(0, 3);
        
        // Add all judge scores for top 3 teams with rank
        sortedTeams.forEach(([teamId, teamData], index) => {
          const rank = index + 1;
          teamData.scores.forEach((score: any) => {
            allResults.push({
              Domain: domainNames[domainKey] || domainKey,
              Rank: rank,
              'Team Name': score.teamName,
              'Judge Name': score.judgeName || 'N/A',
              'Problem Statement': score.teamProblemStatement || '',
              'Problem Identification': Number(score.problemIdentification ?? 0),
              'Innovation & Creativity': Number(score.innovationCreativity ?? 0),
              'Feasibility & Practicality': Number(score.feasibilityPracticality ?? 0),
              'Market/Impact Potential': Number(score.marketImpactPotential ?? 0),
              'Technology/Domain Relevance': Number(score.technologyDomainRelevance ?? 0),
              'Pitch Delivery & Q&A': Number(score.pitchDeliveryQA ?? 0),
              'Bonus': Number(score.bonus ?? 0),
              'Total Score': Number(score.total ?? 0)
            });
          });
        });
      }
    }
    
    if (!allResults.length) {
      alert('No Round 1 results found. Please calculate Round 1 results first.');
      return;
    }

    exportJsonToExcel(allResults, `${mainEvent.name}_Round1_Top3_Per_Domain`);
  };

  // Utility: apply wrapText and set column widths on a worksheet
  const applyWrapAndWidths = (ws: XLSX.WorkSheet, widths: number[]) => {
    ws['!cols'] = widths.map(wch => ({ wch }));
    if (!ws['!ref']) return;
    const range = XLSX.utils.decode_range(ws['!ref']);
    for (let r = range.s.r; r <= range.e.r; r++) {
      for (let c = range.s.c; c <= range.e.c; c++) {
        const cellAddress = XLSX.utils.encode_cell({ r, c });
        const cell = ws[cellAddress];
        if (!cell) continue;
        cell.s = cell.s || {};
        const isNumeric = cell.t === 'n';
        cell.s.alignment = {
          wrapText: true,
          vertical: 'top',
          horizontal: isNumeric ? 'center' : 'left'
        };
      }
    }
  };

  const handleExportAllRound1Scores = async () => {
    if (events.length === 0) {
      alert('No events available. Please create an event first.');
      return;
    }
    
    const mainEvent = events[0];
    const allDomains = ['fintech_ecommerce', 'health_biotech', 'agritech_rural', 'sustainable_smart_cities', 'skills_edtech'];
    const domainNames: Record<string, string> = {
      fintech_ecommerce: 'Fintech and E-commerce',
      health_biotech: 'Health and BioTech',
      agritech_rural: 'Agri-Tech & Rural Empowerment',
      sustainable_smart_cities: 'Sustainable solutions and smart cities',
      skills_edtech: 'Skills and Edtech'
    };

    // Create workbook and add a sheet for each domain with all results
    const workbook = XLSX.utils.book_new();
    let anyData = false;

    

    const teamTotals = new Map<string, { teamId: string; teamName: string; domain: string; totalSum: number; count: number }>();
    const domainScoresMap = new Map<string, any[]>();
    const aggregatedResults = await listRoundOneResults().catch(() => [] as any[]);
    const aggregatedMap = new Map<string, any>((aggregatedResults || []).map((r: any) => [r.teamId, r]));

    for (const domainKey of allDomains) {
      const results = await listRoundOneResults(domainKey).catch(() => []);
      domainScoresMap.set(domainKey, results || []);
      const domainTeams = teams.filter(t => (t as any).domainKey === domainKey || t.domain === domainKey || (t as any).domainKey === domainNames[domainKey] || t.domain === domainNames[domainKey]);
      if ((!results || results.length === 0) && domainTeams.length === 0) continue;
      anyData = true;

      // Group rows by judge, showing judge name once with their teams beneath
      const rows: any[] = [];
      const groupedByJudge = new Map<string, any[]>();
      (results || []).forEach((r: any) => {
        const judgeKey = r.judgeName || r.judgeId || 'Unknown Judge';
        if (!groupedByJudge.has(judgeKey)) groupedByJudge.set(judgeKey, []);
        groupedByJudge.get(judgeKey)!.push(r);

        const teamKey = r.teamId || r.teamName;
        if (teamKey) {
          const existing = teamTotals.get(teamKey) || {
            teamId: r.teamId || '',
            teamName: r.teamName || '',
            domain: domainNames[domainKey] || domainKey,
            totalSum: 0,
            count: 0
          };
          existing.totalSum += Number(r.total ?? 0);
          existing.count += 1;
          teamTotals.set(teamKey, existing);
        }
      });

      const judgeEntries = Array.from(groupedByJudge.entries()).sort((a, b) => a[0].localeCompare(b[0]));
      judgeEntries.forEach(([judgeName, judgeScores]) => {
        rows.push({
          'Judge Name': judgeName
        });

        judgeScores.forEach((item: any, index: number) => {
          const teamInfo = domainTeams.find(t => t.id === item.teamId || t.teamName === item.teamName);
          rows.push({
            'S.No': index + 1,
            'Team ID': item.teamId || teamInfo?.id || '',
            'Team Name': item.teamName || teamInfo?.teamName || '',
            'Problem Statement': item.teamProblemStatement || teamInfo?.problemStatement || '',
            'Problem Identification': Number(item.problemIdentification ?? 0),
            'Innovation & Creativity': Number(item.innovationCreativity ?? 0),
            'Feasibility & Practicality': Number(item.feasibilityPracticality ?? 0),
            'Market/Impact Potential': Number(item.marketImpactPotential ?? 0),
            'Technology/Domain Relevance': Number(item.technologyDomainRelevance ?? 0),
            'Pitch Delivery & Q&A': Number(item.pitchDeliveryQA ?? 0),
            'Bonus': Number(item.bonus ?? 0),
            'Total Score': Number(item.total ?? 0)
          });
        });

        rows.push({});
      });

      // Add teams without any scores at the end
      const scoredTeamIds = new Set((results || []).map((r: any) => r.teamId));
      const unscoredTeams = domainTeams.filter(t => !scoredTeamIds.has(t.id));
      if (unscoredTeams.length > 0) {
        rows.push({ 'Judge Name': 'Unscored Teams' });
        unscoredTeams.forEach((team: any, index: number) => {
          rows.push({
            'S.No': index + 1,
            'Team ID': team.id || '',
            'Team Name': team.teamName || team.name || '',
            'Problem Statement': team.problemStatement || '',
            'Problem Identification': '',
            'Innovation & Creativity': '',
            'Feasibility & Practicality': '',
            'Market/Impact Potential': '',
            'Technology/Domain Relevance': '',
            'Pitch Delivery & Q&A': '',
            'Bonus': '',
            'Total Score': ''
          });
        });
      }

      const sheetName = domainNames[domainKey] || domainKey;
      const ws = XLSX.utils.json_to_sheet(rows);
      applyWrapAndWidths(ws, [22, 6, 14, 24, 40, 26, 10, 12, 14, 16, 18, 16, 10, 12]);
      XLSX.utils.book_append_sheet(workbook, ws, sheetName.substring(0, 31));
    }

    if (!anyData) {
      alert('No Round 1 results found. Please calculate Round 1 results first.');
      return;
    }

    // Build Top 3 per domain sheet
    const top3Rows: any[] = [];
    for (const domainKey of allDomains) {
      const scores = domainScoresMap.get(domainKey) || [];
      if (!scores || scores.length === 0) continue;

      const domainAggregates = (aggregatedResults || [])
        .filter((r: any) => r.domainKey === domainKey)
        .sort((a: any, b: any) => (a.rank ?? 0) - (b.rank ?? 0))
        .slice(0, 3);

      domainAggregates.forEach((teamAgg: any) => {
        const teamScores = scores.filter((score: any) => score.teamId === teamAgg.teamId);
        const rank = teamAgg.rank ?? '';
        teamScores.forEach((score: any) => {
          top3Rows.push({
            Domain: domainNames[domainKey] || domainKey,
            Rank: rank,
            'Team Name': score.teamName,
            'Judge Name': score.judgeName || 'N/A',
            'Problem Statement': score.teamProblemStatement || '',
            'Problem Identification': Number(score.problemIdentification ?? 0),
            'Innovation & Creativity': Number(score.innovationCreativity ?? 0),
            'Feasibility & Practicality': Number(score.feasibilityPracticality ?? 0),
            'Market/Impact Potential': Number(score.marketImpactPotential ?? 0),
            'Technology/Domain Relevance': Number(score.technologyDomainRelevance ?? 0),
            'Pitch Delivery & Q&A': Number(score.pitchDeliveryQA ?? 0),
            'Bonus': Number(score.bonus ?? 0),
            'Total Score': Number(score.total ?? 0)
          });
        });
      });
    }

    if (top3Rows.length > 0) {
      const wsTop3 = XLSX.utils.json_to_sheet(top3Rows);
      applyWrapAndWidths(wsTop3, [22, 6, 24, 26, 40, 10, 12, 14, 16, 18, 16, 10, 12]);
      XLSX.utils.book_append_sheet(workbook, wsTop3, 'Top3_Per_Domain');
    }

    // Add total scores per team (all teams in event)
    const totalRows = teams.map((team: any, index: number) => {
      const teamKey = team.id || team.teamName;
      const aggregate = aggregatedMap.get(teamKey);
      const totals = teamTotals.get(teamKey) || {
        teamId: team.id || '',
        teamName: team.teamName || team.name || '',
        domain: team.domainKey || team.domain || '',
        totalSum: 0,
        count: 0
      };
      return {
        'S.No': index + 1,
        'Team ID': totals.teamId,
        'Team Name': totals.teamName,
        Domain: totals.domain,
        'Total Score': aggregate?.totalScore ?? totals.totalSum
      };
    });

    if (totalRows.length > 0) {
      const wsTotals = XLSX.utils.json_to_sheet(totalRows);
      applyWrapAndWidths(wsTotals, [6, 14, 24, 22, 16]);
      XLSX.utils.book_append_sheet(workbook, wsTotals, 'All_Teams_Total');
    }

    const fileName = `${mainEvent.name.replace(/\s+/g, '_')}_Round1_All_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  const handleExportRound2Results = async () => {
    if (events.length === 0) {
      alert('No events available. Please create an event first.');
      return;
    }
    
    const mainEvent = events[0];
    
    // Fetch Round 2 scores from backend using api client (includes auth token)
    const round2Data: any = await listRoundTwoTeamsScores().catch(() => null);
    
    if (!round2Data || !round2Data.teams || round2Data.teams.length === 0) {
      alert('No Round 2 scores found. Please ensure Round 2 scoring is complete.');
      return;
    }
    
    const domainNames: Record<string, string> = {
      fintech_ecommerce: 'Fintech and E-commerce',
      health_biotech: 'Health and BioTech',
      agritech_rural: 'Agri-Tech & Rural Empowerment',
      sustainable_smart_cities: 'Sustainable solutions and smart cities',
      skills_edtech: 'Skills and Edtech'
    };

    // Build workbook with two sheets: Round2_All_Teams and Round2_Top3
    const workbook = XLSX.utils.book_new();

    const teamsList = Array.isArray(round2Data.teams) ? round2Data.teams : Array.isArray(round2Data) ? round2Data : [];

    const teamRows = teamsList
      .map((team: any) => {
        const teamScores = Array.isArray(team.scores) ? team.scores : [];
        const totalScore = teamScores.length
          ? teamScores.reduce((sum: number, score: any) => sum + Number(score.total ?? 0), 0) / teamScores.length
          : 0;
        const teamInfo = teams.find(t => t.id === team.teamId || t.teamName === team.teamName || (t as any).teamId === team.teamId);
        // Get team members from backend response first, fallback to frontend teams state
        const memberNames = (team.teamMembers && Array.isArray(team.teamMembers))
          ? team.teamMembers.join(', ')
          : (teamInfo?.members?.map((m: any) => m.name).join(', ') || '');
        return {
          Domain: domainNames[team.domainKey] || team.domainKey || 'N/A',
          'Team ID': team.teamId || team.teamName || '',
          'Team Name': team.teamName || team.teamId || (teamInfo?.teamName || ''),
          'Team Members': memberNames,
          'Problem Statement': team.problemStatement || team.teamIdeaDescription || team.problemIdea || '',
          'Problem Description': team.problemDescription || team.teamIdeaDescription || team.problemIdeaDescription || '',
          'Total Score': Number(totalScore ?? 0)
        };
      })
      .sort((a: any, b: any) => b['Total Score'] - a['Total Score'])
      .map((row: any, idx: number) => ({ Rank: idx + 1, ...row }));

    // All teams sheet
    const wsAll = XLSX.utils.json_to_sheet(teamRows);
    applyWrapAndWidths(wsAll, [18, 12, 28, 22, 36, 36, 14]);
    XLSX.utils.book_append_sheet(workbook, wsAll, 'Round2_All_Teams');

    // Top 3 sheet (overall)
    const top3 = teamRows.slice(0, 3).map((r: any) => ({ Rank: r.Rank, 'Team ID': r['Team ID'], 'Team Name': r['Team Name'], Domain: r.Domain, 'Team Members': r['Team Members'], 'Problem Statement': r['Problem Statement'], 'Problem Description': r['Problem Description'], 'Total Score': r['Total Score'] }));
    const wsTop3 = XLSX.utils.json_to_sheet(top3);
    applyWrapAndWidths(wsTop3, [8, 12, 28, 22, 24, 36, 14]);
    XLSX.utils.book_append_sheet(workbook, wsTop3, 'Round2_Top3');

    const fileName = `${mainEvent.name.replace(/\s+/g, '_')}_Round2_All_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  const handleExportRound2Top3 = async () => {
    if (events.length === 0) {
      alert('No events available. Please create an event first.');
      return;
    }

    const mainEvent = events[0];
    const round2Data: any = await listRoundTwoTeamsScores().catch(() => null);
    if (!round2Data || !round2Data.teams || round2Data.teams.length === 0) {
      alert('No Round 2 scores found. Please ensure Round 2 scoring is complete.');
      return;
    }

    const domainNames: Record<string, string> = {
      fintech_ecommerce: 'Fintech and E-commerce',
      health_biotech: 'Health and BioTech',
      agritech_rural: 'Agri-Tech & Rural Empowerment',
      sustainable_smart_cities: 'Sustainable solutions and smart cities',
      skills_edtech: 'Skills and Edtech'
    };

    const teamRows = round2Data.teams
      .map((team: any) => {
        const teamScores = Array.isArray(team.scores) ? team.scores : [];
        const totalScore = teamScores.length
          ? teamScores.reduce((sum: number, score: any) => sum + Number(score.total ?? 0), 0) / teamScores.length
          : 0;
        const teamInfo = teams.find(t => t.id === team.teamId || t.teamName === team.teamName || (t as any).teamId === team.teamId);
        const memberNames = teamInfo?.members?.map(m => m.name).join(', ') || '';
        return {
          domainKey: team.domainKey,
          teamName: team.teamName,
          members: memberNames,
          problemStatement: team.problemStatement || '',
          problemDescription: team.teamIdeaDescription || '',
          totalScore
        };
      })
      .sort((a: any, b: any) => b.totalScore - a.totalScore)
      .slice(0, 3);

    const rows = teamRows.map((team: any, index: number) => ({
      Domain: domainNames[team.domainKey] || team.domainKey || 'N/A',
      Rank: index + 1,
      'Team Name': team.teamName,
      'Team Members': team.members,
      'Problem Statement': team.problemStatement,
      'Problem Description': team.problemDescription,
      'Total Score': Number(team.totalScore ?? 0)
    }));

    if (rows.length === 0) {
      alert('No Round 2 scores available to export.');
      return;
    }

    exportJsonToExcel(rows, `${mainEvent.name}_Round2_Top3`);
  };

  const domainNameToKey = useMemo(() => {
    const map = new Map([
      ['Fintech and E-commerce', 'fintech_ecommerce'],
      ['Health and BioTech', 'health_biotech'],
      ['Agri-Tech & Rural Empowerment', 'agritech_rural'],
      ['Sustainable solutions and smart cities', 'sustainable_smart_cities'],
      ['Skills and Edtech', 'skills_edtech']
    ]);
    return map;
  }, []);

  useEffect(() => {
    if (round1ScoredTeams > 0 || teams.length === 0) {
      setDisplayRound1ScoredTeams(round1ScoredTeams);
    }
  }, [round1ScoredTeams, teams.length]);

  useEffect(() => {
    let mounted = true;
    setLoadingRound1Status(true);
    getRoundOneStatus()
      .then((status) => {
        if (!mounted) return;
        if (status?.calculated) {
          setRound1HasResults(true);
        }
      })
      .catch(() => {
        if (!mounted) return;
      })
      .finally(() => {
        if (!mounted) return;
        setLoadingRound1Status(false);
      });
    return () => { mounted = false; };
  }, []);

  const handleExportRound1DomainResults = async (domainName: string) => {
    if (events.length === 0) {
      alert('No events available. Please create an event first.');
      return;
    }

    const mainEvent = events[0];
    const domainKey = domainNameToKey.get(domainName) || domainName;
    const results = await listRoundOneResults(domainKey).catch(() => []);
    if (!results.length) {
      alert('No Round 1 results found. Please calculate Round 1 results first.');
      return;
    }

    const rows = results.map((item: any, index: number) => ({
      'S.No': index + 1,
      'Team Name': item.teamName,
      'Judge Name': item.judgeName || 'N/A',
      'Problem Statement': item.teamProblemStatement || '',
      'Problem Identification': Number(item.problemIdentification ?? 0),
      'Innovation & Creativity': Number(item.innovationCreativity ?? 0),
      'Feasibility & Practicality': Number(item.feasibilityPracticality ?? 0),
      'Market/Impact Potential': Number(item.marketImpactPotential ?? 0),
      'Technology/Domain Relevance': Number(item.technologyDomainRelevance ?? 0),
      'Pitch Delivery & Q&A': Number(item.pitchDeliveryQA ?? 0),
      'Bonus': Number(item.bonus ?? 0),
      'Total Score': Number(item.total ?? 0)
    }));

    exportJsonToExcel(rows, `${mainEvent.name}_Round1_${domainKey}`);
  };

  const handleExportAllRoundsSeparate = async () => {
    // Trigger Round 1 and Round 2 exports as separate files
    await handleExportAllRound1Scores();
    await handleExportRound2Results();
  };

  const handleExportAllRoundsCombined = async () => {
    if (events.length === 0) {
      alert('No events available. Please create an event first.');
      return;
    }

    const mainEvent = events[0];

    // Build Round 1 rows (aggregate across all domains)
    const allDomains = ['fintech_ecommerce', 'health_biotech', 'agritech_rural', 'sustainable_smart_cities', 'skills_edtech'];
    const allResults: any[] = [];
    for (const domainKey of allDomains) {
      const results = await listRoundOneResults(domainKey).catch(() => []);
      allResults.push(...results);
    }

    if (!allResults.length) {
      alert('No Round 1 results found. Please calculate Round 1 results first.');
      return;
    }

    const round1Rows = allResults.map((item: any, index: number) => ({
      'S.No': index + 1,
      'Team Name': item.teamName,
      'Judge Name': item.judgeName || 'N/A',
      'Problem Statement': item.teamProblemStatement || '',
      'Problem Identification': Number(item.problemIdentification ?? 0),
      'Innovation & Creativity': Number(item.innovationCreativity ?? 0),
      'Feasibility & Practicality': Number(item.feasibilityPracticality ?? 0),
      'Market/Impact Potential': Number(item.marketImpactPotential ?? 0),
      'Technology/Domain Relevance': Number(item.technologyDomainRelevance ?? 0),
      'Pitch Delivery & Q&A': Number(item.pitchDeliveryQA ?? 0),
      'Bonus': Number(item.bonus ?? 0),
      'Total Score': Number(item.total ?? 0)
    }));

    // Build Round 2 rows
    const round2Data: any = await listRoundTwoTeamsScores().catch(() => null);
    if (!round2Data || !round2Data.teams || round2Data.teams.length === 0) {
      alert('No Round 2 scores found. Please ensure Round 2 scoring is complete.');
      return;
    }

    const domainNames: Record<string, string> = {
      fintech_ecommerce: 'Fintech and E-commerce',
      health_biotech: 'Health and BioTech',
      agritech_rural: 'Agri-Tech & Rural Empowerment',
      sustainable_smart_cities: 'Sustainable solutions and smart cities',
      skills_edtech: 'Skills and Edtech'
    };

    const round2Rows = round2Data.teams
      .map((team: any, index: number) => {
        const teamScores = Array.isArray(team.scores) ? team.scores : [];
        const totalScore = teamScores.length
          ? teamScores.reduce((sum: number, score: any) => sum + Number(score.total ?? 0), 0) / teamScores.length
          : 0;
        const teamInfo = teams.find(t => t.id === team.teamId || t.teamName === team.teamName || (t as any).teamId === team.teamId);
        const memberNames = teamInfo?.members?.map(m => m.name).join(', ') || '';
        return {
          Domain: domainNames[team.domainKey] || team.domainKey || 'N/A',
          Rank: index + 1,
          'Team Name': team.teamName,
          'Team Members': memberNames,
          'Problem Statement': team.problemStatement || '',
          'Problem Description': team.problemIdeaDescription || team.problemIdeaDescription || team.problemIdea || team.problemIdeaDescription || team.problemIdea || team.teamIdeaDescription || '',
          'Total Score': Number(totalScore ?? 0)
        };
      })
      .sort((a: any, b: any) => b['Total Score'] - a['Total Score']);

    // Create workbook with two sheets
    const ws1 = XLSX.utils.json_to_sheet(round1Rows);
    const ws2 = XLSX.utils.json_to_sheet(round2Rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, ws1, 'Round1_All');
    XLSX.utils.book_append_sheet(workbook, ws2, 'Round2_All');

    const fileName = `${mainEvent.name.replace(/\s+/g, '_')}_Round1_and_Round2_All.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="text-slate-600 mt-1">Overview of all events and activities</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="flex flex-row gap-4 overflow-x-auto pb-2">
        <div className="bg-white border border-slate-200 rounded-lg p-2 shadow-sm w-56 h-28 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
              <Calendar className="size-4 text-blue-600" />
            </div>
            <TrendingUp className="size-4 text-green-600" />
          </div>
          <p className="text-lg font-bold text-slate-900">{stats.totalEvents}</p>
          <p className="text-[11px] text-slate-600 mt-0.5">Total Events</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-2 shadow-sm w-56 h-28 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 bg-indigo-100 rounded-md flex items-center justify-center">
              <Users className="size-4 text-indigo-600" />
            </div>
          </div>
          <p className="text-lg font-bold text-slate-900">{stats.totalTeams}</p>
          <p className="text-[11px] text-slate-600 mt-0.5">Registered Teams</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-2 shadow-sm w-56 h-28 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 bg-cyan-100 rounded-md flex items-center justify-center">
              <Gavel className="size-4 text-cyan-600" />
            </div>
          </div>
          <p className="text-lg font-bold text-slate-900">{stats.totalJudges}</p>
          <p className="text-[11px] text-slate-600 mt-0.5">Active Judges</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-2 shadow-sm w-56 h-28 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 bg-emerald-100 rounded-md flex items-center justify-center">
              <CheckCircle className="size-4 text-emerald-600" />
            </div>
          </div>
          <p className="text-lg font-bold text-slate-900">{stats.round1ScoresSubmitted}</p>
          <p className="text-[11px] text-slate-600 mt-0.5">Round 1 Scores Submitted</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-2 shadow-sm w-56 h-28 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 bg-amber-100 rounded-md flex items-center justify-center">
              <Trophy className="size-4 text-amber-600" />
            </div>
          </div>
          <p className="text-lg font-bold text-slate-900">{stats.round2ScoresSubmitted}</p>
          <p className="text-[11px] text-slate-600 mt-0.5">Round 2 Scores Submitted</p>
        </div>
      </div>

      {/* Add / Update Judges */}
      <Collapsible open={isJudgeFormOpen} onOpenChange={setIsJudgeFormOpen}>
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <CollapsibleTrigger asChild>
            <button
              type="button"
              className="w-full flex items-center justify-between gap-3 text-left"
            >
              <h2 className="text-lg font-semibold text-slate-900">Add / Update Judges</h2>
              <ChevronDown
                className={`size-5 text-slate-500 transition-transform ${isJudgeFormOpen ? 'rotate-180' : ''}`}
              />
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-4">
            <form onSubmit={handleSaveJudge} className="grid md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">Judge Name</label>
                <input
                  value={judgeName}
                  onChange={(e) => setJudgeName(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  placeholder="Judge Name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Judge ID</label>
                <input
                  value={judgeId}
                  onChange={(e) => setJudgeId(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  placeholder="JDG-001"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Judge Type</label>
                <select
                  value={judgeType}
                  onChange={(e) => setJudgeType(e.target.value as JudgeType)}
                  className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                >
                  <option value="Internal">Internal</option>
                  <option value="External">External</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">Edit Existing (optional)</label>
                <select
                  value={editingJudgeId}
                  onChange={(e) => handleSelectJudge(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                >
                  <option value="">Create new judge</option>
                  {judges.map(j => (
                    <option key={j.backendId || j.id} value={j.backendId || ''}>
                      {j.name} ({j.id})
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2 flex items-end gap-3">
                <button
                  type="submit"
                  disabled={savingJudge}
                  className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-60"
                >
                  {savingJudge ? 'Saving...' : editingJudgeId ? 'Update Judge' : 'Add Judge'}
                </button>
                {editingJudgeId && (
                  <button
                    type="button"
                    onClick={resetJudgeForm}
                    className="px-4 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </CollapsibleContent>
        </div>
      </Collapsible>

      {/* Calculate Results */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Calculate Results</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          <button
            onClick={async () => {
              if (round1Calculated) return;
              if (!canCalculateRound1) return alert('Not all teams have scores yet.');
              if (!confirm('Calculate Round 1 results now? This will compute and store Round 1 rankings.')) return;
              setLoadingRound1(true);
              const toastId = toast.loading('Calculating Round 1 results...');
              try {
                await calculateRoundOneResults();
                setRound1HasResults(true);
                toast.success('Round 1 calculation completed.');
                setRound1Calculated(true);
              } catch (err) {
                console.error(err);
                toast.error('Failed to calculate Round 1 results.');
              } finally {
                toast.dismiss(toastId);
                setLoadingRound1(false);
              }
            }}
            disabled={!canCalculateRound1 || loadingRound1 || round1Calculated || round1HasResults}
            className={`w-full flex items-center gap-3 p-4 border rounded-xl shadow-sm transition-all ${round1Calculated || round1HasResults ? 'bg-emerald-100 border-emerald-400 cursor-not-allowed' : canCalculateRound1 ? 'bg-white hover:bg-slate-50 border-slate-300' : 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed'}`}
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${round1Calculated || round1HasResults ? 'bg-emerald-100' : 'bg-slate-100'}`}>
              {loadingRound1 ? <Loader2 className="size-5 text-emerald-600 animate-spin" /> : <Clock className={`size-5 ${round1Calculated || round1HasResults ? 'text-emerald-600' : 'text-slate-600'}`} />}
            </div>
            <div>
              <p className="font-medium text-slate-900">Calculate Round 1 Results</p>
              <p className="text-xs text-slate-600">Teams scored: {displayRound1ScoredTeams}/{teams.length}</p>
            </div>
          </button>

          <button
            onClick={async () => {
              if (!round1HasResults) return alert('Calculate Round 1 results before setting up Round 2.');
              if (externalJudges.length === 0) return alert('At least one external judge is required to setup Round 2.');
              if (!confirm('Setup Round 2 now? This will allocate top 3 teams per domain to all external judges.')) return;
              setLoadingSetupRound2(true);
              const toastId = toast.loading('Setting up Round 2 allocations...');
              try {
                await setupRoundTwo({ judgeIds: externalJudges.map(j => j.id) });
                await onRefreshRound2Allocations?.();
                await refreshRound2Allocations();
                setRound2SetupCompleted(true);
                toast.success('Round 2 setup completed.');
              } catch (err) {
                console.error(err);
                toast.error('Failed to setup Round 2. Ensure Round 1 results are calculated.');
              } finally {
                toast.dismiss(toastId);
                setLoadingSetupRound2(false);
              }
            }}
            disabled={!canSetupRound2 || loadingSetupRound2 || hasRound2Setup}
            className={`w-full flex items-center gap-3 p-4 border rounded-xl shadow-sm transition-all ${hasRound2Setup ? 'bg-emerald-100 border-emerald-400 cursor-not-allowed' : round1HasResults ? 'bg-white hover:bg-slate-50 border-slate-300' : 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed'}`}
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${hasRound2Setup ? 'bg-emerald-100' : round1HasResults ? 'bg-slate-100' : 'bg-slate-100'}`}>
              {loadingSetupRound2 ? <Loader2 className="size-5 text-blue-600 animate-spin" /> : <Users className={`size-5 ${hasRound2Setup ? 'text-emerald-600' : 'text-slate-600'}`} />}
            </div>
            <div>
              <p className="font-medium text-slate-900">Setup Round 2</p>
              <p className="text-xs text-slate-600">
                {hasRound2Setup
                  ? `Round 2 allocated: ${round2AllocatedCount}`
                  : loadingRound1Status
                    ? 'Checking Round 1 status...'
                    : round1HasResults
                      ? `External judges: ${externalJudges.length}`
                      : 'Waiting for Round 1 results'}
              </p>
            </div>
          </button>

          <button
            onClick={async () => {
              if (!canCalculateRound2) return alert('Round 2 allocations or scores incomplete.');
              if (!confirm('Calculate Round 2 results now? This will compute and store Round 2 rankings.')) return;
              setLoadingRound2(true);
              const toastId = toast.loading('Calculating Round 2 results...');
              try {
                await calculateRoundTwoResults();
                setRound2Calculated(true);
                toast.success('Round 2 calculation completed.');
              } catch (err) {
                console.error(err);
                toast.error('Failed to calculate Round 2 results.');
              } finally {
                toast.dismiss(toastId);
                setLoadingRound2(false);
              }
            }}
              disabled={!canCalculateRound2 || loadingRound2 || round2Calculated}
              className={`w-full flex items-center gap-3 p-4 border rounded-xl shadow-sm transition-all ${round2Calculated ? 'bg-emerald-100 border-emerald-400 cursor-not-allowed' : !hasRound2Setup ? 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed' : 'bg-white hover:bg-slate-50 border-slate-300'}`}
          >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${round2Calculated ? 'bg-emerald-100' : !hasRound2Setup ? 'bg-slate-100' : 'bg-slate-100'}`}>
                {loadingRound2 ? <Loader2 className="size-5 text-amber-600 animate-spin" /> : <Award className={`size-5 ${round2Calculated ? 'text-emerald-600' : 'text-slate-600'}`} />}
            </div>
            <div>
              <p className="font-medium text-slate-900">Calculate Round 2 Results</p>
              <p className="text-xs text-slate-600">Round2 scored: {round2ScoredTeams}/{round2AllocatedCount ?? '...'}</p>
            </div>
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <Link
            to="/admin/team-allocation"
            className="flex items-center gap-3 p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors group"
          >
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
              <CheckCircle className="size-5 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-slate-900">Team Allocation</p>
              <p className="text-xs text-slate-600">Assign by round</p>
            </div>
          </Link>
          
          <Link
            to="/admin/allocation-view"
            className="flex items-center gap-3 p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors group"
          >
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
              <Users className="size-5 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-slate-900">View Allocations</p>
              <p className="text-xs text-slate-600">See judge teams</p>
            </div>
          </Link>

          {/* Export All Round 1 and Export All Round 2 buttons removed per request */}
        </div>
      </div>

      {/* Final Results removed per request */}

      {/* Domain-wise Results removed per request */}
      {/* Exports */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">All Rounds Export</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          <button
            onClick={handleExportAllRound1Scores}
            className="flex items-center gap-3 p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors group"
          >
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
              <Download className="size-5 text-emerald-600" />
            </div>
            <div>
              <p className="font-medium text-slate-900">Export Round 1 (All Domains)</p>
              <p className="text-xs text-slate-600">Download complete Round 1 scores</p>
            </div>
          </button>

          <button
            onClick={handleExportRound2Results}
            className="flex items-center gap-3 p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors group"
          >
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center group-hover:bg-amber-200 transition-colors">
              <Download className="size-5 text-amber-600" />
            </div>
            <div>
              <p className="font-medium text-slate-900">Export Round 2 (All Teams)</p>
              <p className="text-xs text-slate-600">Download complete Round 2 scores</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}