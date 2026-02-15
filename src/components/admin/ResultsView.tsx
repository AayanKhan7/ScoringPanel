import { useState, useMemo } from 'react';
import { Download, Trophy, Medal, Award, TrendingUp } from 'lucide-react';
import { Event, Team, Score, TeamWithScores } from '../../types';
import { exportScoresToExcel } from '../../utils/exportUtils';

interface ResultsViewProps {
  events: Event[];
  teams: Team[];
  scores: Score[];
}

export function ResultsView({ events, teams, scores }: ResultsViewProps) {
  const [selectedEventId, setSelectedEventId] = useState<string>(events[0]?.id || '');

  const selectedEvent = events.find(e => e.id === selectedEventId);

  // Calculate teams with scores and rankings
  const teamsWithScores = useMemo((): TeamWithScores[] => {
    if (!selectedEvent) return [];

    const eventTeams = teams.filter(t => t.eventId === selectedEventId);
    const eventScores = scores.filter(s => s.eventId === selectedEventId);

    const teamsWithScoresData: TeamWithScores[] = eventTeams.map(team => {
      const teamScores = eventScores.filter(s => s.teamId === team.id);
      const averageScore = teamScores.length > 0
        ? teamScores.reduce((sum, s) => sum + s.totalScore, 0) / teamScores.length
        : 0;

      return {
        ...team,
        averageScore,
        totalJudges: selectedEvent.assignedJudges.length,
        scoresReceived: teamScores.length,
        individualScores: teamScores
      };
    });

    // Sort by average score and assign ranks
    const sorted = teamsWithScoresData.sort((a, b) => b.averageScore - a.averageScore);
    sorted.forEach((team, index) => {
      team.rank = index + 1;
    });

    return sorted;
  }, [selectedEventId, selectedEvent, teams, scores]);

  const handleExport = () => {
    if (selectedEvent && teamsWithScores.length > 0) {
      exportScoresToExcel(selectedEvent, teamsWithScores);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="size-6 text-amber-400" />;
      case 2:
        return <Medal className="size-6 text-slate-300" />;
      case 3:
        return <Award className="size-6 text-amber-600" />;
      default:
        return <span className="text-lg font-bold text-slate-400">#{rank}</span>;
    }
  };

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white';
      case 2:
        return 'bg-gradient-to-r from-slate-400 to-slate-500 text-white';
      case 3:
        return 'bg-gradient-to-r from-amber-700 to-amber-600 text-white';
      default:
        return 'bg-slate-800 text-slate-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Results & Leaderboard</h1>
          <p className="text-slate-400 mt-1">View rankings and export scoring reports</p>
        </div>
        {selectedEvent && teamsWithScores.length > 0 && (
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl text-white font-medium hover:from-green-700 hover:to-emerald-700 transition-all"
          >
            <Download className="size-5" />
            Export to Excel
          </button>
        )}
      </div>

      {/* Event Selector */}
      <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-xl p-6">
        <label className="block text-sm font-medium text-slate-300 mb-3">Select Event</label>
        <select
          value={selectedEventId}
          onChange={(e) => setSelectedEventId(e.target.value)}
          className="w-full px-4 py-3 bg-slate-950/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-violet-500 transition-colors"
        >
          {events.map(event => (
            <option key={event.id} value={event.id}>
              {event.name} - {new Date(event.date).toLocaleDateString()}
            </option>
          ))}
        </select>
      </div>

      {/* Leaderboard */}
      {selectedEvent && (
        <>
          {/* Top 3 Podium */}
          {teamsWithScores.length >= 3 && teamsWithScores[0].scoresReceived > 0 && (
            <div className="grid md:grid-cols-3 gap-4">
              {/* 2nd Place */}
              <div className="md:order-1 bg-slate-900/50 backdrop-blur-xl border border-slate-700 rounded-xl p-6 text-center">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-slate-400 to-slate-500 rounded-full flex items-center justify-center mb-3">
                  <Medal className="size-8 text-white" />
                </div>
                <div className="inline-block px-3 py-1 bg-slate-700 rounded-full text-xs font-medium text-white mb-2">
                  2nd Place
                </div>
                <h3 className="text-lg font-bold text-white mb-1">{teamsWithScores[1]?.teamName}</h3>
                <p className="text-sm text-slate-400 mb-3">{teamsWithScores[1]?.domain}</p>
                <div className="text-3xl font-bold text-white mb-1">
                  {teamsWithScores[1]?.averageScore.toFixed(2)}
                </div>
                <p className="text-xs text-slate-500">
                  {teamsWithScores[1]?.scoresReceived}/{teamsWithScores[1]?.totalJudges} judges
                </p>
              </div>

              {/* 1st Place */}
              <div className="md:order-2 bg-gradient-to-br from-amber-500/20 to-yellow-500/20 border border-amber-500/50 rounded-xl p-6 text-center md:-mt-4">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-amber-500 to-yellow-500 rounded-full flex items-center justify-center mb-3 shadow-lg shadow-amber-500/50">
                  <Trophy className="size-10 text-white" />
                </div>
                <div className="inline-block px-4 py-1 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full text-sm font-bold text-white mb-2">
                  🏆 WINNER
                </div>
                <h3 className="text-xl font-bold text-white mb-1">{teamsWithScores[0]?.teamName}</h3>
                <p className="text-sm text-slate-300 mb-3">{teamsWithScores[0]?.domain}</p>
                <div className="text-4xl font-bold bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent mb-1">
                  {teamsWithScores[0]?.averageScore.toFixed(2)}
                </div>
                <p className="text-xs text-slate-400">
                  {teamsWithScores[0]?.scoresReceived}/{teamsWithScores[0]?.totalJudges} judges
                </p>
              </div>

              {/* 3rd Place */}
              <div className="md:order-3 bg-slate-900/50 backdrop-blur-xl border border-slate-700 rounded-xl p-6 text-center">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-amber-700 to-amber-600 rounded-full flex items-center justify-center mb-3">
                  <Award className="size-8 text-white" />
                </div>
                <div className="inline-block px-3 py-1 bg-amber-700 rounded-full text-xs font-medium text-white mb-2">
                  3rd Place
                </div>
                <h3 className="text-lg font-bold text-white mb-1">{teamsWithScores[2]?.teamName}</h3>
                <p className="text-sm text-slate-400 mb-3">{teamsWithScores[2]?.domain}</p>
                <div className="text-3xl font-bold text-white mb-1">
                  {teamsWithScores[2]?.averageScore.toFixed(2)}
                </div>
                <p className="text-xs text-slate-500">
                  {teamsWithScores[2]?.scoresReceived}/{teamsWithScores[2]?.totalJudges} judges
                </p>
              </div>
            </div>
          )}

          {/* Full Leaderboard Table */}
          <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-xl overflow-hidden">
            <div className="p-6 border-b border-slate-800">
              <h2 className="text-xl font-bold text-white">Full Leaderboard</h2>
              <p className="text-sm text-slate-400 mt-1">
                {teamsWithScores.length} teams • Sorted by average score
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-800/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Rank
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Team
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Domain
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Average Score
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Judges
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {teamsWithScores.map((team) => (
                    <tr key={team.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg ${getRankBadge(team.rank!)}`}>
                          {getRankIcon(team.rank!)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-white">{team.teamName}</p>
                          <p className="text-sm text-slate-400">{team.id}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-block px-3 py-1 bg-violet-600/20 text-violet-400 rounded-md text-sm">
                          {team.domain}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-2xl font-bold text-white">
                            {team.averageScore > 0 ? team.averageScore.toFixed(2) : '-'}
                          </p>
                          {team.scoresReceived > 0 && (
                            <p className="text-xs text-slate-500">
                              out of {selectedEvent.scoringCriteria.reduce((sum, c) => sum + c.maxScore, 0)}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-slate-800 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-violet-600 to-fuchsia-600 h-2 rounded-full transition-all"
                              style={{
                                width: `${(team.scoresReceived / team.totalJudges) * 100}%`
                              }}
                            />
                          </div>
                          <span className="text-sm text-slate-400 whitespace-nowrap">
                            {team.scoresReceived}/{team.totalJudges}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                          team.qualificationStatus === 'Winner'
                            ? 'bg-amber-600/20 text-amber-400'
                            : team.qualificationStatus === 'Qualified'
                            ? 'bg-green-600/20 text-green-400'
                            : team.qualificationStatus === 'Eliminated'
                            ? 'bg-red-600/20 text-red-400'
                            : 'bg-slate-600/20 text-slate-400'
                        }`}>
                          {team.qualificationStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
