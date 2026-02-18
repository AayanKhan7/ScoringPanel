import { useState } from 'react';
import { Users, Trophy, ChevronDown, ChevronUp, Search } from 'lucide-react';
import { Event, Team, Judge, RoundType, Score } from '../../types';

interface AllocationViewProps {
  events: Event[];
  teams: Team[];
  judges: Judge[];
  scores: Score[];
}

export function AllocationView({ events, teams, judges, scores }: AllocationViewProps) {
  const [selectedEventId, setSelectedEventId] = useState<string>(events[0]?.id || '');
  const [selectedRound, setSelectedRound] = useState<RoundType>('Round 1');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedJudgeIds, setExpandedJudgeIds] = useState<Set<string>>(new Set());

  const selectedEvent = events.find(e => e.id === selectedEventId);
  
  // Get teams available for the selected round
  const availableRoundTeams = selectedRound === 'Round 2'
    ? teams.filter(t => t.eventId === selectedEventId && (t.allocatedJudges?.round2?.length || 0) > 0)
    : teams.filter(t => t.eventId === selectedEventId);
  
  const isInternalJudge = (judge: Judge) => judge.type?.toLowerCase() === 'internal';
  const isExternalJudge = (judge: Judge) => judge.type?.toLowerCase() === 'external';

  // Filter judges by round type
  const roundJudges = judges.filter(j =>
    selectedRound === 'Round 1' ? isInternalJudge(j) : isExternalJudge(j)
  );

  // Filter by search query
  const filteredJudges = roundJudges.filter(judge =>
    judge.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    judge.expertise.some(exp => exp.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Get teams allocated to a specific judge
  const getJudgeTeams = (judgeId: string): Team[] => {
    const roundKey = selectedRound === 'Round 1' ? 'round1' : 'round2';
    return availableRoundTeams.filter(team => 
      team.eventId === selectedEventId &&
      team.allocatedJudges?.[roundKey]?.includes(judgeId)
    );
  };

  // Toggle judge expansion
  const toggleJudgeExpansion = (judgeId: string) => {
    setExpandedJudgeIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(judgeId)) {
        newSet.delete(judgeId);
      } else {
        newSet.add(judgeId);
      }
      return newSet;
    });
  };

  // Get domain-wise team count for a judge
  const getJudgeDomainStats = (judgeId: string) => {
    const judgeTeams = getJudgeTeams(judgeId);
    const domainCounts: Record<string, number> = {};
    
    judgeTeams.forEach(team => {
      domainCounts[team.domain] = (domainCounts[team.domain] || 0) + 1;
    });
    
    return domainCounts;
  };

  // Calculate overall stats
  const totalAllocatedJudges = filteredJudges.filter(j => getJudgeTeams(j.id).length > 0).length;
  const totalAllocatedTeams = availableRoundTeams.filter(t => {
    const roundKey = selectedRound === 'Round 1' ? 'round1' : 'round2';
    return t.eventId === selectedEventId && 
           t.allocatedJudges?.[roundKey] && 
           t.allocatedJudges[roundKey].length > 0;
  }).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Judge Allocation View</h1>
        <p className="text-sm sm:text-base text-slate-600 mt-1">View teams allocated to each judge</p>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Event Selection */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Select Event</label>
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 shadow-sm"
          >
            {events.map(event => (
              <option key={event.id} value={event.id}>{event.name}</option>
            ))}
          </select>
        </div>

        {/* Round Selection */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Select Round</label>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedRound('Round 1')}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all shadow-sm ${
                selectedRound === 'Round 1'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'
                  : 'bg-white border border-slate-300 text-slate-600 hover:bg-slate-50'
              }`}
            >
              Round 1
            </button>
            <button
              onClick={() => setSelectedRound('Round 2')}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all shadow-sm ${
                selectedRound === 'Round 2'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'
                  : 'bg-white border border-slate-300 text-slate-600 hover:bg-slate-50'
              }`}
            >
              Round 2
            </button>
          </div>
        </div>

        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Search Judges</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or expertise..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="size-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Total Judges</p>
              <p className="text-xl font-bold text-slate-900">{filteredJudges.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Users className="size-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Allocated Judges</p>
              <p className="text-xl font-bold text-slate-900">{totalAllocatedJudges}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Trophy className="size-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Allocated Teams</p>
              <p className="text-xl font-bold text-slate-900">{totalAllocatedTeams}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Judges List */}
      <div className="space-y-4">
        {filteredJudges.map(judge => {
          const judgeTeams = getJudgeTeams(judge.id);
          const isExpanded = expandedJudgeIds.has(judge.id);
          const domainStats = getJudgeDomainStats(judge.id);
          
          return (
            <div
              key={judge.id}
              className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm"
            >
              {/* Judge Header */}
              <button
                onClick={() => toggleJudgeExpansion(judge.id)}
                className="w-full p-6 flex items-center justify-between hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  {/* Judge Avatar */}
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                    <span className="text-white text-lg font-bold">
                      {judge.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  
                  {/* Judge Info */}
                  <div className="text-left">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-bold text-slate-900">{judge.name}</h3>
                      <span className={`px-2 py-1 rounded-md text-xs font-medium border ${
                        judge.type === 'Internal'
                          ? 'bg-blue-100 text-blue-700 border-blue-200'
                          : 'bg-purple-100 text-purple-700 border-purple-200'
                      }`}>
                        {judge.type}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 mt-1">
                      {judge.expertise.join(', ')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {/* Team Count */}
                  <div className="text-right">
                    <p className="text-2xl font-bold text-slate-900">{judgeTeams.length}</p>
                    <p className="text-xs text-slate-600">
                      {judgeTeams.length === 1 ? 'Team' : 'Teams'} Assigned
                    </p>
                  </div>
                  
                  {/* Expand Icon */}
                  {judgeTeams.length > 0 && (
                    <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                      {isExpanded ? (
                        <ChevronUp className="size-5 text-slate-600" />
                      ) : (
                        <ChevronDown className="size-5 text-slate-600" />
                      )}
                    </div>
                  )}
                </div>
              </button>

              {/* Expanded Content - Teams List */}
              {isExpanded && judgeTeams.length > 0 && (
                <div className="border-t border-slate-200">
                  {/* Domain Summary */}
                  <div className="p-4 bg-slate-50">
                    <p className="text-sm font-medium text-slate-700 mb-2">Domain Distribution:</p>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(domainStats).map(([domain, count]) => (
                        <span
                          key={domain}
                          className="px-3 py-1 bg-blue-100 border border-blue-200 rounded-lg text-xs text-blue-700"
                        >
                          {domain}: {count} {count === 1 ? 'team' : 'teams'}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Teams Grid */}
                  <div className="p-6 grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {judgeTeams.map(team => (
                      <div
                        key={team.id}
                        className="bg-slate-50 border border-slate-200 rounded-lg p-4 hover:border-blue-400 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-slate-900">{team.teamName}</h4>
                          <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs rounded-md flex-shrink-0 border border-indigo-200">
                            {team.domain}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mb-2">
                          {team.members.length} member{team.members.length !== 1 ? 's' : ''}
                        </p>
                        {team.problemStatement && (
                          <div className="mt-2 pt-2 border-t border-slate-200">
                            <p className="text-xs text-slate-500 mb-1 font-medium">Problem:</p>
                            <p className="text-xs text-slate-700 line-clamp-2">
                              {team.problemStatement}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty State */}
              {isExpanded && judgeTeams.length === 0 && (
                <div className="p-8 text-center border-t border-slate-200">
                  <Users className="size-12 mx-auto text-slate-300 mb-2" />
                  <p className="text-slate-600">No teams allocated yet</p>
                </div>
              )}
            </div>
          );
        })}

        {/* No Results */}
        {filteredJudges.length === 0 && (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-sm">
            <Users className="size-16 mx-auto text-slate-300 mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">No judges found</h3>
            <p className="text-slate-600">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
}