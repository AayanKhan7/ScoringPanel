import { Judge, Event } from '../../types';
import { Gavel, Mail, Award } from 'lucide-react';

interface JudgesManagementProps {
  judges: Judge[];
  events: Event[];
}

export function JudgesManagement({ judges, events }: JudgesManagementProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Judges Management</h1>
          <p className="text-slate-400 mt-1">Manage judges and their event assignments</p>
        </div>
      </div>

      {/* Judges Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {judges.map(judge => {
          const assignedEvents = events.filter(e => e.assignedJudges.includes(judge.id));

          return (
            <div
              key={judge.id}
              className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-xl p-6 hover:border-violet-500/50 transition-colors"
            >
              {/* Judge Header */}
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Gavel className="size-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white">{judge.name}</h3>
                  <div className="flex items-center gap-1 text-sm text-slate-400 mt-1">
                    <Mail className="size-3" />
                    {judge.email}
                  </div>
                </div>
              </div>

              {/* Expertise */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="size-4 text-violet-400" />
                  <p className="text-sm font-medium text-slate-300">Expertise</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {judge.expertise.map(exp => (
                    <span
                      key={exp}
                      className="text-xs px-2 py-1 bg-violet-600/20 text-violet-400 rounded-md"
                    >
                      {exp}
                    </span>
                  ))}
                </div>
              </div>

              {/* Assigned Events */}
              <div className="pt-4 border-t border-slate-700">
                <p className="text-xs font-medium text-slate-400 mb-2">
                  Assigned Events ({assignedEvents.length})
                </p>
                {assignedEvents.length > 0 ? (
                  <div className="space-y-1">
                    {assignedEvents.map(event => (
                      <div
                        key={event.id}
                        className="text-sm text-slate-300 bg-slate-800/30 rounded px-2 py-1"
                      >
                        {event.name}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">No events assigned</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
