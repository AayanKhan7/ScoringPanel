import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router'
import { ArrowLeft, Send, Users, CheckCircle } from 'lucide-react'
import { Event, Team, Score, User } from '../../types'
import { getRound2Teams } from '../../utils/round2Utils'

interface ScoringInterfaceProps {
  currentUser: User
  events: Event[]
  teams: Team[]
  scores: Score[]
  onSubmitScore: (score: Omit<Score, 'id' | 'submittedAt'>) => void
}

/* =========================================================
   SCORING CONFIG (LOW STARTS FROM 2)
========================================================= */
const SCORING_LEVELS: Record<
  number,
  {
    label: 'Low' | 'Average' | 'Excellent'
    min: number
    max: number
    color: string
    emoji: string
  }[]
> = {
  15: [
    { label: 'Low', min: 2, max: 5, color: 'red', emoji: '🟥' },
    { label: 'Average', min: 6, max: 10, color: 'amber', emoji: '🟨' },
    { label: 'Excellent', min: 11, max: 15, color: 'green', emoji: '🟩' },
  ],
  20: [
    { label: 'Low', min: 2, max: 7, color: 'red', emoji: '🟥' },
    { label: 'Average', min: 8, max: 14, color: 'amber', emoji: '🟨' },
    { label: 'Excellent', min: 15, max: 20, color: 'green', emoji: '🟩' },
  ],
}

const getSmartScore = (min: number, max: number, label: string) => {
  if (label === 'Excellent') return max
  return Number(((min + max) / 2).toFixed(1))
}

export function ScoringInterface({
  currentUser,
  events,
  teams,
  scores,
  onSubmitScore,
}: ScoringInterfaceProps) {
  const { eventId } = useParams<{ eventId: string }>()
  const event = events.find(e => e.id === eventId)

  const judgeType = currentUser.judgeProfile?.type
  const roundKey = judgeType === 'Internal' ? 'round1' : 'round2'

  // Get teams for this round
  // Round 1 (Internal): Only allocated teams
  // Round 2 (External): ALL top 15 teams (no allocation needed)
  const availableTeams = judgeType === 'External' && eventId
    ? getRound2Teams(teams, scores, eventId)
    : teams.filter(t => t.eventId === eventId);

  const eventTeams = judgeType === 'External'
    ? availableTeams  // External judges see ALL Round 2 teams
    : availableTeams.filter(t => t.allocatedJudges?.[roundKey]?.includes(currentUser.id))

  const selectedTeam = eventTeams[0]

  const [criterionScores, setCriterionScores] = useState<Record<string, number>>({})
  const [activeRanges, setActiveRanges] = useState<
    Record<string, { min: number; max: number }>
  >({})
  const [bonusScore, setBonusScore] = useState(0)
  const [remarks, setRemarks] = useState('')
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    const existingScore = scores.find(
      s =>
        s.eventId === eventId &&
        s.teamId === selectedTeam?.id &&
        s.judgeId === currentUser.id
    )

    if (existingScore) {
      setCriterionScores(existingScore.scores)
      setBonusScore(existingScore.bonusScore || 0)
      setRemarks(existingScore.remarks || '')
      if (existingScore.isFinalized) setSubmitted(true)
    }
  }, [eventId, selectedTeam?.id, scores, currentUser.id])

  if (!event || !selectedTeam) {
    return (
      <div className="text-center py-12">
        <Users className="mx-auto mb-4 size-16 text-slate-300" />
        <p>No teams assigned</p>
      </div>
    )
  }

  const baseScore = Object.values(criterionScores).reduce((a, b) => a + b, 0)
  const totalScore = Number((baseScore + bonusScore).toFixed(1))

  const submit = () => {
    const allScored = event.scoringCriteria.every(
      c => criterionScores[c.id] !== undefined
    )

    if (!allScored) {
      alert('Please score all main criteria')
      return
    }

    onSubmitScore({
      eventId: event.id,
      teamId: selectedTeam.id,
      judgeId: currentUser.id,
      judgeName: currentUser.name,
      scores: criterionScores,
      bonusScore,
      totalScore,
      remarks,
      isFinalized: true,
    })

    setSubmitted(true)
  }

  /* =========================================================
     SUBMITTED VIEW
  ========================================================= */
  if (submitted) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 text-center">
        <CheckCircle className="mx-auto text-green-600" size={64} />
        <h1 className="text-3xl font-bold text-green-700">
          Score Submitted Successfully
        </h1>

        <div className="bg-white border rounded-xl p-6 text-left space-y-4">
          <div>
            <p className="text-sm text-slate-500">Team</p>
            <p className="text-xl font-bold">{selectedTeam.teamName}</p>
          </div>

          <div className="border-t pt-4 space-y-2">
            {event.scoringCriteria.map(c => (
              <div key={c.id} className="flex justify-between">
                <span>{c.name}</span>
                <span className="font-semibold">
                  {criterionScores[c.id]?.toFixed(1)}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t pt-4 flex justify-between">
            <span>Bonus</span>
            <span className="font-semibold">{bonusScore.toFixed(1)}</span>
          </div>

          <div className="border-t pt-4 flex justify-between text-lg font-bold">
            <span>Total Score</span>
            <span className="text-green-700">{totalScore}</span>
          </div>
        </div>

        <Link
          to="/judge"
          className="inline-block mt-4 text-blue-600 hover:underline"
        >
          ← Back to Dashboard
        </Link>
      </div>
    )
  }

  /* =========================================================
     SCORING VIEW
  ========================================================= */
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <Link to="/judge" className="flex items-center gap-2 text-slate-600">
        <ArrowLeft size={16} /> Back
      </Link>

      <h1 className="text-3xl font-bold">{event.name}</h1>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-sm text-blue-700 font-medium">Team</p>
        <p className="text-xl font-bold text-blue-900">
          {selectedTeam.teamName}
        </p>
        <p className="text-sm text-blue-700">{selectedTeam.domain}</p>
      </div>

      <div className="bg-white p-6 rounded-xl border space-y-10">
        {event.scoringCriteria.map(c => {
          const score = criterionScores[c.id]
          const range = activeRanges[c.id]
          const levels = SCORING_LEVELS[c.maxScore]

          const selectedLevel = range
            ? levels.find(l => l.min === range.min && l.max === range.max)
            : null

          return (
            <div key={c.id} className="space-y-4">
              <p className="font-semibold">{c.name}</p>

              <div className="grid grid-cols-3 gap-3">
                {levels.map(l => (
                  <button
                    key={l.label}
                    onClick={() => {
                      setCriterionScores(prev => ({
                        ...prev,
                        [c.id]: getSmartScore(l.min, l.max, l.label),
                      }))
                      setActiveRanges(prev => ({
                        ...prev,
                        [c.id]: { min: l.min, max: l.max },
                      }))
                    }}
                    className="p-3 rounded-xl border hover:bg-slate-100"
                  >
                    <p className="font-semibold">
                      {l.emoji} {l.label}
                    </p>
                    <p className="text-xs text-slate-600">
                      {l.min} – {l.max}
                    </p>
                  </button>
                ))}
              </div>

              {selectedLevel && score !== undefined && (
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min={range!.min}
                    max={range!.max}
                    step={0.1}
                    value={score}
                    onChange={e =>
                      setCriterionScores(prev => ({
                        ...prev,
                        [c.id]: Number(e.target.value),
                      }))
                    }
                    className="flex-1 accent-blue-600"
                  />
                  <div className="font-semibold">
                    {score.toFixed(1)} / {selectedLevel.max}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="bg-green-50 border border-green-300 rounded-xl p-6">
        <p className="font-semibold text-green-800 mb-2">
          Bonus Marks (Optional)
        </p>
        <input
          type="number"
          step={0.1}
          min={0}
          max={5}
          value={bonusScore}
          onChange={e => setBonusScore(Number(e.target.value))}
          className="w-24 text-center border rounded-lg"
        />
      </div>

      <div className="bg-white p-6 rounded-xl border">
        <textarea
          value={remarks}
          onChange={e => setRemarks(e.target.value)}
          rows={4}
          placeholder="Remarks (optional)"
          className="w-full border rounded-lg p-3"
        />
      </div>

      <button
        onClick={submit}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-xl font-semibold flex items-center justify-center gap-2"
      >
        <Send size={18} /> Submit Score
      </button>
    </div>
  )
}
