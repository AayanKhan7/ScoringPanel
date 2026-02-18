import { Link } from 'react-router';
import { Calendar, Users, Gavel, Plus, Edit, Trash2, Lock, Unlock, Download } from 'lucide-react';
import { Event, Team, Judge } from '../../types';

interface EventsListProps {
  events: Event[];
  teams: Team[];
  judges: Judge[];
  onDeleteEvent: (eventId: string) => void;
  onToggleLock: (eventId: string) => void;
}

export function EventsList({ events, teams, judges, onDeleteEvent, onToggleLock }: EventsListProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Events Management</h1>
          <p className="text-slate-400 mt-1">Create and manage all events</p>
        </div>
        <Link
          to="/admin/events/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-xl text-white font-medium hover:from-violet-700 hover:to-fuchsia-700 transition-all"
        >
          <Plus className="size-5" />
          Create Event
        </Link>
      </div>

      {/* Events Grid */}
      {events.length === 0 ? (
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-xl p-12 text-center">
          <Calendar className="size-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Events Yet</h3>
          <p className="text-slate-400 mb-6">Create your first event to get started</p>
          <Link
            to="/admin/events/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-xl text-white font-medium hover:from-violet-700 hover:to-fuchsia-700 transition-all"
          >
            <Plus className="size-5" />
            Create Event
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {events.map(event => {
            const eventTeams = teams.filter(t => t.eventId === event.id);
            const eventJudges = judges.filter(j => event.assignedJudges.includes(j.id));

            return (
              <div
                key={event.id}
                className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-xl p-6 hover:border-violet-500/50 transition-colors"
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  {/* Event Info */}
                  <div className="flex-1">
                    <div className="flex items-start gap-4 mb-3">
                      <div className="w-14 h-14 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Calendar className="size-7 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h2 className="text-xl font-bold text-white">{event.name}</h2>
                          {event.isLocked && (
                            <Lock className="size-4 text-red-400" />
                          )}
                        </div>
                        <p className="text-slate-400 text-sm mb-2">{event.description}</p>
                        <div className="flex flex-wrap gap-2">
                          <span className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-violet-600/20 text-violet-400 rounded-md">
                            {event.type}
                          </span>
                          <span className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-fuchsia-600/20 text-fuchsia-400 rounded-md">
                            <Calendar className="size-3" />
                            {new Date(event.date).toLocaleDateString()}
                          </span>
                          <span className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-blue-600/20 text-blue-400 rounded-md">
                            ₹{event.registrationFee}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-3 mt-4">
                      <div className="bg-slate-800/30 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Users className="size-4 text-fuchsia-400" />
                          <span className="text-xs text-slate-400">Teams</span>
                        </div>
                        <p className="text-lg font-bold text-white">{eventTeams.length}</p>
                      </div>

                      <div className="bg-slate-800/30 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Gavel className="size-4 text-blue-400" />
                          <span className="text-xs text-slate-400">Judges</span>
                        </div>
                        <p className="text-lg font-bold text-white">{eventJudges.length}</p>
                        <p className="text-xs text-slate-500">assigned</p>
                      </div>

                      <div className="bg-slate-800/30 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Calendar className="size-4 text-amber-400" />
                          <span className="text-xs text-slate-400">Criteria</span>
                        </div>
                        <p className="text-lg font-bold text-white">{event.scoringCriteria.length}</p>
                        <p className="text-xs text-slate-500">
                          {event.scoringCriteria.reduce((sum, c) => sum + c.maxScore, 0)} max points
                        </p>
                      </div>
                    </div>

                    {/* Domains */}
                    <div className="mt-4">
                      <p className="text-xs font-medium text-slate-400 mb-2">Domains:</p>
                      <div className="flex flex-wrap gap-2">
                        {event.domains.map(domain => (
                          <span
                            key={domain}
                            className="text-xs px-2 py-1 bg-slate-800/50 text-slate-300 rounded-md"
                          >
                            {domain}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex lg:flex-col gap-2">
                    <Link
                      to={`/admin/events/${event.id}`}
                      className="flex items-center gap-2 px-4 py-2 bg-violet-600/20 hover:bg-violet-600/30 text-violet-400 rounded-lg transition-colors text-sm font-medium"
                    >
                      <Edit className="size-4" />
                      Edit
                    </Link>

                    <Link
                      to={`/admin/results?event=${event.id}`}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg transition-colors text-sm font-medium"
                    >
                      <Download className="size-4" />
                      Results
                    </Link>

                    <button
                      onClick={() => onToggleLock(event.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
                        event.isLocked
                          ? 'bg-green-600/20 hover:bg-green-600/30 text-green-400'
                          : 'bg-amber-600/20 hover:bg-amber-600/30 text-amber-400'
                      }`}
                    >
                      {event.isLocked ? (
                        <>
                          <Unlock className="size-4" />
                          Unlock
                        </>
                      ) : (
                        <>
                          <Lock className="size-4" />
                          Lock
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete "${event.name}"? This action cannot be undone.`)) {
                          onDeleteEvent(event.id);
                        }
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors text-sm font-medium"
                    >
                      <Trash2 className="size-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}