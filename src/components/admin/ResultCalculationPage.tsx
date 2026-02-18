import { useState, useEffect, useMemo } from 'react'
import { Clock, Users, Award, Loader2 } from 'lucide-react'
import { Team, Score, Judge } from '../../types'
import { 
  calculateRoundOneResults, 
  calculateRoundTwoResults, 
  setupRoundTwo,
  listRoundTwoAllocations,
  getRoundOneStatus
} from '../../api/scoringApi'

interface ResultCalculationPageProps {
  teams: Team[]
  scores: Score[]
  judges: Judge[]
  onRefreshRound2Allocations?: () => void
}

export function ResultCalculationPage({ 
  teams, 
  scores, 
  judges,
  onRefreshRound2Allocations 
}: ResultCalculationPageProps) {

  const [loadingRound1, setLoadingRound1] = useState(false)
  const [loadingRound2, setLoadingRound2] = useState(false)
  const [loadingSetupRound2, setLoadingSetupRound2] = useState(false)

  const [round1Calculated, setRound1Calculated] = useState(false)
  const [round2Calculated, setRound2Calculated] = useState(false)
  const [round1HasResults, setRound1HasResults] = useState(false)
  const [hasRound2Setup, setRound2SetupCompleted] = useState(false)

  const [displayRound1ScoredTeams, setDisplayRound1ScoredTeams] = useState(0)
  const [round2AllocatedCount, setRound2AllocatedCount] = useState<number | null>(null)
  const [round2ScoredTeams, setRound2ScoredTeams] = useState(0)

  const externalJudges = useMemo(
    () => judges.filter(j => j.type === 'External'),
    [judges]
  )

  const round1ScoredTeamsSet = useMemo(() => {
    const uniqueTeams = new Set(
      scores.filter(s => s.round === 'Round 1').map(s => s.teamId)
    )
    return uniqueTeams
  }, [scores])

  const canCalculateRound1 = round1ScoredTeamsSet.size === teams.length

  useEffect(() => {
    setDisplayRound1ScoredTeams(round1ScoredTeamsSet.size)
  }, [round1ScoredTeamsSet])

  useEffect(() => {
    let mounted = true
    getRoundOneStatus()
      .then((res) => {
        if (!mounted) return
        if (res.calculated && res.count > 0) {
          setRound1HasResults(true)
          setRound1Calculated(true)
        }
      })
      .catch(() => {})
    return () => { mounted = false }
  }, [])

  const refreshRound2Allocations = async () => {
    const rows: any[] = await listRoundTwoAllocations().catch(() => [])
    const unique = new Set(rows.map(r => r.teamId))
    setRound2AllocatedCount(unique.size)
    if (unique.size > 0) {
      setRound2SetupCompleted(true)
    }
  }

  useEffect(() => {
    refreshRound2Allocations().catch(() => {
      setRound2AllocatedCount(0)
    })
  }, [])

  useEffect(() => {
    const round2Scores = scores.filter(s => s.round === 'Round 2')
    const uniqueTeams = new Set(round2Scores.map(s => s.teamId))
    setRound2ScoredTeams(uniqueTeams.size)
  }, [scores])

  const canSetupRound2 = round1HasResults && externalJudges.length > 0

  const canCalculateRound2 = 
    round2AllocatedCount !== null && 
    round2AllocatedCount > 0 && 
    round2ScoredTeams === round2AllocatedCount

  return (
    <div className="w-full px-6 lg:px-10 py-8">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        
        <h2 className="text-base font-semibold text-slate-900 mb-6">
          Calculate Results
        </h2>

        {/* FIXED GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">

          {/* ROUND 1 */}
          <button
            disabled={!canCalculateRound1 || loadingRound1 || round1Calculated}
            onClick={async () => {
              if (!canCalculateRound1) return
              if (!confirm('Calculate Round 1 results now?')) return

              setLoadingRound1(true)
              try {
                await calculateRoundOneResults()
                setRound1Calculated(true)
                setRound1HasResults(true)
              } catch {
                alert('Failed to calculate Round 1 results')
              } finally {
                setLoadingRound1(false)
              }
            }}
            className="h-full flex items-center gap-4 p-5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:shadow-md transition-all disabled:opacity-60 disabled:cursor-not-allowed text-left min-h-[110px]"
          >
            <div className="w-10 h-10 bg-slate-200 rounded-lg flex items-center justify-center flex-shrink-0">
              {loadingRound1 ? (
                <Loader2 className="size-4 animate-spin text-slate-600" />
              ) : (
                <Clock className="size-4 text-slate-600" />
              )}
            </div>

            <div className="flex flex-col justify-center">
              <h3 className="font-semibold text-sm text-slate-900">
                Calculate Round 1 Results
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Teams scored: {displayRound1ScoredTeams}/{teams.length}
              </p>
            </div>
          </button>

          {/* SETUP ROUND 2 */}
          <button
            disabled={!canSetupRound2 || loadingSetupRound2 || hasRound2Setup}
            onClick={async () => {
              if (!canSetupRound2) return
              if (!confirm('Setup Round 2 with external judges?')) return

              setLoadingSetupRound2(true)
              try {
                await setupRoundTwo({ judgeIds: externalJudges.map(j => j.id) })
                setRound2SetupCompleted(true)
                await refreshRound2Allocations()
                onRefreshRound2Allocations?.()
              } catch {
                alert('Failed to setup Round 2')
              } finally {
                setLoadingSetupRound2(false)
              }
            }}
            className="h-full flex items-center gap-4 p-5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:shadow-md transition-all disabled:opacity-60 disabled:cursor-not-allowed text-left min-h-[110px]"
          >
            <div className="w-10 h-10 bg-slate-200 rounded-lg flex items-center justify-center flex-shrink-0">
              {loadingSetupRound2 ? (
                <Loader2 className="size-4 animate-spin text-slate-600" />
              ) : (
                <Users className="size-4 text-slate-600" />
              )}
            </div>

            <div className="flex flex-col justify-center">
              <h3 className="font-semibold text-sm text-slate-900">
                Setup Round 2
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {round1HasResults
                  ? `External judges: ${externalJudges.length}`
                  : 'Waiting for Round 1 results'}
              </p>
            </div>
          </button>

          {/* ROUND 2 */}
          <button
            disabled={!canCalculateRound2 || loadingRound2 || round2Calculated}
            onClick={async () => {
              if (!canCalculateRound2) return
              if (!confirm('Calculate Round 2 results now?')) return

              setLoadingRound2(true)
              try {
                await calculateRoundTwoResults()
                setRound2Calculated(true)
              } catch {
                alert('Failed to calculate Round 2 results')
              } finally {
                setLoadingRound2(false)
              }
            }}
            className="h-full flex items-center gap-4 p-5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:shadow-md transition-all disabled:opacity-60 disabled:cursor-not-allowed text-left min-h-[110px]"
          >
            <div className="w-10 h-10 bg-slate-200 rounded-lg flex items-center justify-center flex-shrink-0">
              {loadingRound2 ? (
                <Loader2 className="size-4 animate-spin text-slate-600" />
              ) : (
                <Award className="size-4 text-slate-600" />
              )}
            </div>

            <div className="flex flex-col justify-center">
              <h3 className="font-semibold text-sm text-slate-900">
                Calculate Round 2 Results
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Round 2 scored: {round2ScoredTeams}/{round2AllocatedCount ?? 0}
              </p>
            </div>
          </button>

        </div>
      </div>
    </div>
  )
}
