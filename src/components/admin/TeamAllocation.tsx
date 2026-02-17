import { useState, useEffect, useMemo, useCallback } from 'react';
import { Users, CheckCircle, XCircle, ArrowRight, UserPlus, Trophy } from 'lucide-react';
import { Event, Team, Judge, RoundType, Score } from '../../types';
import { getRound2Teams } from '../../utils/round2Utils';
import { listDomainJudges } from '../../api/scoringApi';

interface TeamAllocationProps {
  event: Event;
  teams: Team[];
  judges: Judge[];
  scores: Score[];
  onUpdateTeamAllocation: (teamId: string, judgeIds: string[], round: RoundType) => void;
  onPersistDomainAllocation?: (domainName: string, judgeIds: string[]) => Promise<void>;
}

export function TeamAllocation({ event, teams, judges, scores, onUpdateTeamAllocation, onPersistDomainAllocation }: TeamAllocationProps) {
  const [selectedRound, setSelectedRound] = useState<RoundType>('Round 1');
  const [selectedDomain, setSelectedDomain] = useState<string>(event.domains[0]);
  const [selectedJudgeIds, setSelectedJudgeIds] = useState<string[]>([]);
  const [assignedJudgeIds, setAssignedJudgeIds] = useState<string[]>([]);
  const [domainJudgeMap, setDomainJudgeMap] = useState<Record<string, string[]>>({});
  const [editMode, setEditMode] = useState(false);

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

  const domainKeyToName = useMemo(() => {
    const map = new Map([
      ['fintech_ecommerce', 'Fintech and E-commerce'],
      ['health_biotech', 'Health and BioTech'],
      ['agritech_rural', 'Agri-Tech & Rural Empowerment'],
      ['sustainable_smart_cities', 'Sustainable solutions and smart cities'],
      ['skills_edtech', 'Skills and Edtech']
    ]);
    return map;
  }, []);

  const getDomainKey = useCallback(
    (domainName: string) => domainNameToKey.get(domainName) || domainName,
    [domainNameToKey]
  );

  const isInternalJudge = (judge: Judge) => judge.type?.toLowerCase() === 'internal';
  const isExternalJudge = (judge: Judge) => judge.type?.toLowerCase() === 'external';

  // Filter judges by round
  const internalJudges = judges.filter(isInternalJudge);
  const externalJudges = judges.filter(isExternalJudge);
  
  // For Round 1, show all internal judges
  // For Round 2, show all external judges
  const allAvailableJudges = selectedRound === 'Round 1' ? internalJudges : externalJudges;

  // Filter teams based on round
  // Round 1: Filter by domain
  // Round 2: Get top 15 teams (top 3 from each domain based on Round 1 scores)
  const domainTeams = selectedRound === 'Round 1'
    ? teams.filter(t => t.eventId === event.id && t.domain === selectedDomain)
    : getRound2Teams(teams, scores, event.id);

  const assignedDomainByJudge = useMemo(() => {
    const map = new Map<string, string>();
    Object.entries(domainJudgeMap).forEach(([domainKey, judgeIds]) => {
      judgeIds.forEach(judgeId => {
        if (!map.has(judgeId)) {
          map.set(judgeId, domainKey);
        }
      });
    });
    return map;
  }, [domainJudgeMap]);

  // Show only unassigned judges in selection list
  const availableJudges = allAvailableJudges.filter(j => !assignedDomainByJudge.has(j.id));

  useEffect(() => {
    const loadDomainJudges = async () => {
      if (selectedRound !== 'Round 1') {
        setAssignedJudgeIds([]);
        return;
      }

      try {
        const results = await Promise.all(
          event.domains.map(async (domainName) => {
            const domainKey = getDomainKey(domainName);
            const domainJudges = await listDomainJudges(domainKey);
            const ids = domainJudges.map((assignment: any) => assignment.judge?.judgeId).filter(Boolean);
            return { domainKey, ids };
          })
        );

        const map: Record<string, string[]> = {};
        results.forEach(({ domainKey, ids }) => {
          map[domainKey] = ids;
        });
        setDomainJudgeMap(map);

        const selectedKey = getDomainKey(selectedDomain);
        const selectedIds = map[selectedKey] || [];
        setAssignedJudgeIds(selectedIds);
        setSelectedJudgeIds(selectedIds);
        setEditMode(selectedIds.length === 0);
      } catch {
        setAssignedJudgeIds([]);
      }
    };

    loadDomainJudges();
  }, [selectedDomain, selectedRound, event.domains, getDomainKey]);

  // Reset judge selection when domain or round changes
  useEffect(() => {
    setSelectedJudgeIds([]);
    setEditMode(true);
  }, [selectedDomain, selectedRound]);

  // Handle judge selection/deselection
  const handleToggleJudgeSelection = (judgeId: string) => {
    setSelectedJudgeIds(prev => {
      const newSelection = prev.includes(judgeId)
        ? prev.filter(id => id !== judgeId)
        : [...prev, judgeId];
      
      return newSelection;
    });
  };

  // Handle allocate button click
  const handleAllocateTeams = async () => {
    if (selectedJudgeIds.length === 0) return;

    if (selectedRound === 'Round 1' && onPersistDomainAllocation) {
      try {
        await onPersistDomainAllocation(selectedDomain, selectedJudgeIds);
      } catch (error: any) {
        alert(error?.message || 'Failed to persist allocations');
      }
    }

    // Distribute teams equally using round-robin
    domainTeams.forEach((team, index) => {
      // Round-robin distribution
      const judgeIdx = index % selectedJudgeIds.length;
      const assignedJudges = [selectedJudgeIds[judgeIdx]];

      onUpdateTeamAllocation(team.id, assignedJudges, selectedRound);
    });

    // Clear selection after allocation
    setSelectedJudgeIds([]);
    setEditMode(false);
  };

  // Check if judge is assigned to team
  const isJudgeAssigned = (teamId: string, judgeId: string): boolean => {
    const team = teams.find(t => t.id === teamId);
    if (!team) return false;

    const roundKey = selectedRound === 'Round 1' ? 'round1' : 'round2';
    return team.allocatedJudges?.[roundKey]?.includes(judgeId) || false;
  };

  // Get assigned judges count
  const getAssignedCount = (teamId: string): number => {
    const team = teams.find(t => t.id === teamId);
    if (!team) return 0;

    const roundKey = selectedRound === 'Round 1' ? 'round1' : 'round2';
    return team.allocatedJudges?.[roundKey]?.length || 0;
  };

  // Get teams allocated to a specific judge
  const getJudgeTeamCount = (judgeId: string): number => {
    return domainTeams.filter(team => isJudgeAssigned(team.id, judgeId)).length;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Team & Judge Allocation</h2>
          <p className="text-slate-600 mt-1">Assign judges to teams for each round</p>
        </div>
      </div>

      {/* Round and Domain Selection */}
      <div className="grid md:grid-cols-2 gap-4">
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
              Round 1 <span className="text-xs ml-1">(Internal)</span>
            </button>
          </div>
        </div>

        {/* Domain Selection - Only show for Round 1 */}
        {selectedRound === 'Round 1' && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Select Domain</label>
            <select
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 shadow-sm"
            >
              {event.domains.map(domain => (
                <option key={domain} value={domain}>{domain}</option>
              ))}
            </select>
          </div>
        )}

        {/* Round 2 Info */}
        {selectedRound === 'Round 2' && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Trophy className="size-5 text-amber-600 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-slate-900">Round 2: All Judges Evaluate All Teams</p>
                <p className="text-xs text-slate-600 mt-1">
                  All external judges will evaluate all top 15 teams (top 3 from each of 5 domains). No allocation needed for Round 2.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Info Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="size-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Total Teams</p>
              <p className="text-xl font-bold text-slate-900">{domainTeams.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <UserPlus className="size-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Available Judges</p>
              <p className="text-xl font-bold text-slate-900">
                {availableJudges.length} {selectedRound === 'Round 1' ? 'Internal' : 'External'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Trophy className="size-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">{selectedRound === 'Round 1' ? 'Domain' : 'Qualified Teams'}</p>
              <p className="text-sm font-bold text-slate-900 truncate">
                {selectedRound === 'Round 1' ? selectedDomain : 'All Domains'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Assigned Judges (from backend) */}
      {selectedRound === 'Round 1' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-3">Allocated Judges</h3>
          {assignedJudgeIds.length === 0 ? (
            <p className="text-sm text-slate-500">No judges assigned to this domain yet.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {assignedJudgeIds.map(judgeId => {
                const judge = judges.find(j => j.id === judgeId);
                return (
                  <span
                    key={judgeId}
                    className="px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-sm font-medium"
                  >
                    {judge?.name || judgeId}
                  </span>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Available Judges List / Edit Allocation */}
      {selectedRound === 'Round 1' && (
        <>
          {assignedJudgeIds.length > 0 && !editMode ? (
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-2">Edit judges allocation</h3>
              <p className="text-sm text-slate-600 mb-4">
                Judges are already allocated for this domain. Click edit to modify the allocation.
              </p>
              <div className="flex items-center gap-3 flex-wrap mb-4">
                {assignedJudgeIds.map(jid => {
                  const j = judges.find(x => x.id === jid);
                  return (
                    <span key={jid} className="px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-sm font-medium">
                      {j?.name || jid}
                    </span>
                  );
                })}
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-600">{domainTeams.length} teams will be distributed equally</p>
                <button
                  onClick={() => setEditMode(true)}
                  className="px-4 py-2 bg-white border border-slate-300 rounded-md hover:bg-slate-50 text-sm"
                >
                  Edit Allocation
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-4">
                Select Judges for Automatic Team Distribution
              </h3>
              <p className="text-sm text-slate-600 mb-4">
                Select judges below and teams will be automatically distributed equally among them
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                {availableJudges.map(judge => {
                  const isSelected = selectedJudgeIds.includes(judge.id);
                  const teamCount = getJudgeTeamCount(judge.id);
                  const assignedDomainKey = assignedDomainByJudge.get(judge.id);
                  const selectedDomainKey = getDomainKey(selectedDomain);
                  const isLockedToOtherDomain = selectedRound === 'Round 1' &&
                    assignedDomainKey &&
                    assignedDomainKey !== selectedDomainKey;
                  const assignedDomainName = assignedDomainKey
                    ? (domainKeyToName.get(assignedDomainKey) || assignedDomainKey)
                    : null;

                  return (
                    <button
                      key={judge.id}
                      onClick={() => {
                        if (!isLockedToOtherDomain) handleToggleJudgeSelection(judge.id);
                      }}
                      className={`p-4 rounded-lg border-2 transition-all text-left shadow-sm ${
                        isLockedToOtherDomain
                          ? 'bg-slate-100 border-slate-200 cursor-not-allowed opacity-70'
                          : isSelected
                          ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-400'
                          : 'bg-slate-50 border-slate-300 hover:border-slate-400'
                      }`}
                      disabled={isLockedToOtherDomain}
                    >
                      <div className="flex items-start gap-3">
                        {/* Checkbox */}
                        <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          isSelected
                            ? 'bg-blue-600 border-blue-500'
                            : 'border-slate-400'
                        }`}>
                          {isSelected && (
                            <CheckCircle className="size-4 text-white" />
                          )}
                        </div>
                        
                        {/* Judge Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                              <span className="text-white text-xs font-bold">
                                {judge.name.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-slate-900 truncate">{judge.name}</p>
                            </div>
                          </div>
                          <p className="text-xs text-slate-600 mb-2 truncate">{judge.expertise.join(', ')}</p>
                          {assignedDomainName && (
                            <p className={`text-xs ${isLockedToOtherDomain ? 'text-amber-700' : 'text-slate-500'} truncate`}>
                              Assigned: {assignedDomainName}
                            </p>
                          )}
                          
                          {/* Team Count */}
                          {isSelected && (
                            <div className="flex items-center gap-1.5 text-xs">
                              <Users className="size-3 text-blue-600" />
                              <span className="text-blue-600 font-medium">
                                {teamCount} {teamCount === 1 ? 'team' : 'teams'} assigned
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Allocate Button */}
              {selectedJudgeIds.length > 0 && (
                <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-slate-900 font-medium">
                        {selectedJudgeIds.length} {selectedJudgeIds.length === 1 ? 'Judge' : 'Judges'} Selected
                      </p>
                      <p className="text-sm text-slate-600 mt-1">
                        {domainTeams.length} teams will be distributed equally ({Math.floor(domainTeams.length / selectedJudgeIds.length)}-{Math.ceil(domainTeams.length / selectedJudgeIds.length)} teams per judge)
                      </p>
                    </div>
                    <button
                      onClick={handleAllocateTeams}
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium transition-all flex items-center gap-2 shadow-md"
                    >
                      <UserPlus className="size-4" />
                      Allocate Teams
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Teams List with Judge Assignment */}
      {selectedRound === 'Round 1' ? (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-4">
            {`Teams in ${selectedDomain} (${domainTeams.length})`}
          </h3>
          <p className="text-sm text-slate-600 mb-4">
            Teams are automatically distributed equally among selected judges
          </p>

          <div className="space-y-3">
            {domainTeams.map(team => {
              const assignedCount = getAssignedCount(team.id);
              const assignedJudges = availableJudges.filter(j => isJudgeAssigned(team.id, j.id));
              
              return (
                <div
                  key={team.id}
                  className="bg-slate-50 border border-slate-200 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="text-slate-900 font-medium">{team.teamName}</h4>
                      <p className="text-xs text-slate-600 mt-1">
                        {team.members.length} member{team.members.length !== 1 ? 's' : ''} • {team.domain}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {assignedJudges.length > 0 && (
                        <div className="flex items-center gap-2">
                          {assignedJudges.map(judge => (
                            <div
                              key={judge.id}
                              className="px-3 py-1.5 bg-blue-100 border border-blue-300 rounded-lg"
                            >
                              <p className="text-xs font-medium text-blue-700">
                                {judge.name.split(' ')[0]}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <span className={`px-3 py-1 rounded-md text-xs font-medium flex-shrink-0 ${
                        assignedCount > 0
                          ? 'bg-green-100 text-green-700 border border-green-200'
                          : 'bg-red-100 text-red-700 border border-red-200'
                      }`}>
                        {assignedCount > 0 ? (
                          <span className="flex items-center gap-1">
                            <CheckCircle className="size-3" />
                            Assigned
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <XCircle className="size-3" />
                            Unassigned
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}

            {domainTeams.length === 0 && (
              <div className="text-center py-8 text-slate-400">
                <Users className="size-12 mx-auto mb-3 opacity-50" />
                <p>No teams found in this domain</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-start gap-3">
            <Trophy className="size-5 text-amber-600 mt-0.5" />
            <div>
              <h3 className="text-lg font-bold text-slate-900">Round 2 allocations are automatic</h3>
              <p className="text-sm text-slate-600 mt-1">
                When Round 2 is set up, all 15 qualified teams are automatically assigned to all external judges.
                View the assignments in the Judge Allocation View.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}