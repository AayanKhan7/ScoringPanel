import { useState } from 'react';
import { Download, Users, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Event, Team } from '../../types';
import { exportTeamsToExcel } from '../../utils/exportUtils';

interface TeamsManagementProps {
  events: Event[];
  teams: Team[];
}

export function TeamsManagement({ events, teams }: TeamsManagementProps) {
  const [selectedEventId, setSelectedEventId] = useState<string>(events[0]?.id || '');

  const selectedEvent = events.find(e => e.id === selectedEventId);
  const eventTeams = teams.filter(t => t.eventId === selectedEventId);

  const handleExport = () => {
    if (selectedEvent && eventTeams.length > 0) {
      exportTeamsToExcel(selectedEvent.name, eventTeams);
    }
  };

  const getStatusIcon = (status: Team['qualificationStatus']) => {
    switch (status) {
      case 'Qualified':
        return <CheckCircle className="size-5 text-green-600" />;
      case 'Eliminated':
        return <XCircle className="size-5 text-red-600" />;
      case 'Winner':
        return <CheckCircle className="size-5 text-amber-600" />;
      default:
        return <Clock className="size-5 text-slate-400" />;
    }
  };

  const getStatusBadge = (status: Team['qualificationStatus']) => {
    switch (status) {
      case 'Qualified':
        return 'bg-green-100 text-green-700';
      case 'Eliminated':
        return 'bg-red-100 text-red-700';
      case 'Winner':
        return 'bg-amber-100 text-amber-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Teams Management</h1>
          <p className="text-sm sm:text-base text-slate-600 mt-1">View and manage team registrations</p>
        </div>
        {eventTeams.length > 0 && (
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg text-white font-medium hover:from-green-700 hover:to-emerald-700 transition-all shadow-sm hover:shadow"
          >
            <Download className="size-5" />
            <span className="hidden sm:inline">Export Teams</span>
            <span className="sm:hidden">Export</span>
          </button>
        )}
      </div>

      {/* Event Selector */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-6 shadow-sm">
        <label className="block text-sm font-medium text-slate-700 mb-3">Select Event</label>
        <select
          value={selectedEventId}
          onChange={(e) => setSelectedEventId(e.target.value)}
          className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
        >
          {events.map(event => (
            <option key={event.id} value={event.id}>
              {event.name} ({teams.filter(t => t.eventId === event.id).length} teams)
            </option>
          ))}
        </select>
      </div>

      {/* Teams List */}
      {eventTeams.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-sm">
          <Users className="size-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-900 mb-2">No Teams Yet</h3>
          <p className="text-slate-600">No teams have registered for this event</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 sm:p-6 border-b border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {eventTeams.length} Registered Team{eventTeams.length !== 1 ? 's' : ''}
                </h2>
              </div>
              <div className="flex gap-2">
                <div className="text-center px-3 sm:px-4 py-2 bg-green-100 rounded-lg">
                  <p className="text-xl sm:text-2xl font-bold text-green-700">
                    {eventTeams.filter(t => t.qualificationStatus === 'Qualified').length}
                  </p>
                  <p className="text-xs text-slate-600">Qualified</p>
                </div>
                <div className="text-center px-3 sm:px-4 py-2 bg-amber-100 rounded-lg">
                  <p className="text-xl sm:text-2xl font-bold text-amber-700">
                    {eventTeams.filter(t => t.qualificationStatus === 'Winner').length}
                  </p>
                  <p className="text-xs text-slate-600">Winners</p>
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                    Team
                  </th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                    Domain
                  </th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                    Members
                  </th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                    Registered
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {eventTeams.map(team => (
                  <tr key={team.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 sm:px-6 py-4">
                      <div>
                        <p className="font-medium text-slate-900">{team.teamName}</p>
                        <p className="text-sm text-slate-600">{team.id}</p>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-sm">
                        {team.domain}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <div className="space-y-1">
                        {team.members.slice(0, 2).map((member, idx) => (
                          <p key={idx} className="text-sm text-slate-900">
                            {member.name}
                          </p>
                        ))}
                        {team.members.length > 2 && (
                          <p className="text-xs text-slate-600">
                            +{team.members.length - 2} more
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(team.qualificationStatus)}
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(team.qualificationStatus)}`}>
                          {team.qualificationStatus}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <p className="text-sm text-slate-600">
                        {new Date(team.createdAt).toLocaleDateString()}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}