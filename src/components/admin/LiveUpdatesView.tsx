import { useMemo, useState } from 'react'
import { Trophy } from 'lucide-react'
import { Score, Team, Judge } from '../../types'

interface LiveUpdatesViewProps {
  scores: Score[]
  teams: Team[]
  judges: Judge[]
}

export function LiveUpdatesView({
  scores,
  teams,
  judges,
}: LiveUpdatesViewProps) {
  const [selectedRound, setSelectedRound] = useState<
    'All' | 'Round 1' | 'Round 2'
  >('All')

  const domainKeyToName = useMemo(() => {
    return new Map([
      ['fintech_ecommerce', 'Fintech & E-commerce'],
      ['health_biotech', 'Health & BioTech'],
      ['agritech_rural', 'Agri-Tech & Rural'],
      ['sustainable_smart_cities', 'Smart Cities'],
      ['skills_edtech', 'Skills & Edtech'],
    ])
  }, [])

  const filteredScores = useMemo(() => {
    let sorted = [...scores].sort(
      (a, b) =>
        new Date(b.submittedAt || 0).getTime() -
        new Date(a.submittedAt || 0).getTime()
    )

    if (selectedRound !== 'All') {
      sorted = sorted.filter((s) => s.round === selectedRound)
    }

    return sorted.slice(0, 50)
  }, [scores, selectedRound])

  const round1Count = scores.filter((s) => s.round === 'Round 1').length
  const round2Count = scores.filter((s) => s.round === 'Round 2').length

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Live Updates
          </h1>
          <p className="text-sm text-slate-500">
            Latest evaluated teams
          </p>
        </div>

        {/* Blue Filter Buttons */}
        <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
          {(['All', 'Round 1', 'Round 2'] as const).map((round) => {
            const count =
              round === 'All'
                ? scores.length
                : round === 'Round 1'
                ? round1Count
                : round2Count

            const isActive = selectedRound === round

            return (
              <button
                key={round}
                onClick={() => setSelectedRound(round)}
                className={`
                  px-3 sm:px-6 py-2 sm:py-2.5
                  rounded-md
                  text-xs sm:text-sm font-semibold
                  ${isActive 
                    ? 'bg-blue-600 text-white border-blue-700 shadow-sm' 
                    : 'bg-white text-slate-700 border-slate-300'
                  }
                  border
                  transition-all duration-200 ease-in-out
                  hover:bg-blue-700 hover:text-white hover:shadow
                  active:scale-95 active:bg-blue-800
                  focus:outline-none focus:ring-2 focus:ring-blue-300
                `}
              >
                {round} <span className={`ml-1 ${isActive ? 'text-blue-100' : 'text-slate-400'}`}>({count})</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-300 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">

        {filteredScores.length === 0 ? (
          <div className="py-20 text-center">
            <Trophy className="mx-auto size-10 text-slate-300 mb-3" />
            <p className="text-slate-500 font-medium">
              No evaluations yet
            </p>
          </div>
        ) : (
          <div 
            className="max-h-[600px] overflow-y-auto" 
            style={{ 
              scrollbarWidth: 'none', 
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            <style dangerouslySetInnerHTML={{
              __html: `
                .overflow-x-auto::-webkit-scrollbar,
                .overflow-y-auto::-webkit-scrollbar {
                  display: none;
                }
              `
            }} />
            <table className="w-full min-w-[640px] text-sm border-collapse table-fixed">

              {/* Sticky Header */}
              <thead className="bg-slate-100 sticky top-0 z-10 border-b border-slate-300">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold text-slate-700 border-r border-slate-200 w-[30%]">
                    Team Name
                  </th>
                  <th className="px-6 py-4 text-left font-semibold text-slate-700 border-r border-slate-200 w-[30%]">
                    Domain
                  </th>
                  <th className="px-6 py-4 text-left font-semibold text-slate-700 border-r border-slate-200 w-[25%]">
                    Evaluated By
                  </th>
                  <th className="px-6 py-4 text-right font-semibold text-slate-700 w-[15%]">
                    Total Score
                  </th>
                </tr>
              </thead>

              {/* Body */}
              <tbody>
                {filteredScores.map((score, index) => {
                  const team = teams.find(
                    (t) => t.id === score.teamId
                  )
                  const judge = judges.find(
                    (j) => j.id === score.judgeId
                  )

                  const domainName = team
                    ? domainKeyToName.get(team.domain) ||
                      team.domain
                    : 'General'

                  return (
                    <tr
                      key={score.id}
                      className={`
                        border-b border-slate-200
                        ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}
                        hover:bg-blue-50
                        transition
                      `}
                    >
                      <td className="px-6 py-4 border-r border-slate-100 font-medium text-slate-900">
                        {team?.teamName ||
                          'Independent Participant'}
                      </td>

                      <td className="px-6 py-4 border-r border-slate-100">
                        <span className="px-3 py-1 text-xs font-medium bg-slate-200 text-slate-700 rounded-full">
                          {domainName}
                        </span>
                      </td>

                      <td className="px-6 py-4 border-r border-slate-100 text-slate-700">
                        {judge?.name ||
                          score.judgeName ||
                          'Judge'}
                      </td>

                      <td className="px-6 py-4 text-right font-bold text-blue-600 text-base">
                        {Number(score.totalScore).toFixed(1)}
                        <span className="text-sm text-slate-400">
                          /100
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>

            </table>
          </div>
        )}
        </div>
      </div>
    </div>
  )
}
