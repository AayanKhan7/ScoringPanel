import { useMemo } from 'react';
import { Link } from 'react-router';
import { 
  Calendar, Users, Gavel, Trophy, 
  TrendingUp, FileText, Download, CheckCircle,
  Clock, XCircle, Award
} from 'lucide-react';
import { Event, Team, Score, Judge } from '../../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { exportRound1Top3ToExcel, exportAllRound1ScoresToExcel, exportRound2ResultsToExcel } from '../../utils/excelExport';

interface AdminDashboardProps {
  events: Event[];
  teams: Team[];
  scores: Score[];
  judges: Judge[];
}

export function AdminDashboard({ events, teams, scores, judges }: AdminDashboardProps) {
  // Calculate statistics
  const stats = useMemo(() => {
    const totalEvents = events.length;
    const totalTeams = teams.length;
    const totalJudges = judges.length;
    const totalScores = scores.length;
    
    const qualified = teams.filter(t => t.qualificationStatus === 'Qualified').length;
    const winners = teams.filter(t => t.qualificationStatus === 'Winner').length;

    return {
      totalEvents,
      totalTeams,
      totalJudges,
      totalScores,
      qualified,
      winners
    };
  }, [events, teams, scores, judges]);

  // Handler for Round 1 export
  const handleExportRound1Top3 = () => {
    if (events.length === 0) {
      alert('No events available. Please create an event first.');
      return;
    }
    
    // Use the first event by default (or we can add event selection later)
    const mainEvent = events[0];
    exportRound1Top3ToExcel(teams, scores, mainEvent);
  };

  const handleExportAllRound1Scores = () => {
    if (events.length === 0) {
      alert('No events available. Please create an event first.');
      return;
    }
    
    // Use the first event by default (or we can add event selection later)
    const mainEvent = events[0];
    exportAllRound1ScoresToExcel(teams, scores, mainEvent, judges);
  };

  const handleExportRound2Results = () => {
    if (events.length === 0) {
      alert('No events available. Please create an event first.');
      return;
    }
    
    // Use the first event by default
    const mainEvent = events[0];
    exportRound2ResultsToExcel(teams, scores, mainEvent, judges);
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Calendar className="size-6 text-blue-600" />
            </div>
            <TrendingUp className="size-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-slate-900">{stats.totalEvents}</p>
          <p className="text-sm text-slate-600 mt-1">Total Events</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
              <Users className="size-6 text-indigo-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900">{stats.totalTeams}</p>
          <p className="text-sm text-slate-600 mt-1">Registered Teams</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center">
              <Gavel className="size-6 text-cyan-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900">{stats.totalJudges}</p>
          <p className="text-sm text-slate-600 mt-1">Active Judges</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
              <Trophy className="size-6 text-amber-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900">{stats.totalScores}</p>
          <p className="text-sm text-slate-600 mt-1">Scores Submitted</p>
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

          <button
            onClick={handleExportRound1Top3}
            className="flex items-center gap-3 p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors group"
          >
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
              <Download className="size-5 text-emerald-600" />
            </div>
            <div>
              <p className="font-medium text-slate-900">Export Round 1 Top 3</p>
              <p className="text-xs text-slate-600">Top 3 per domain</p>
            </div>
          </button>

          <button
            onClick={handleExportAllRound1Scores}
            className="flex items-center gap-3 p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors group"
          >
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
              <Download className="size-5 text-emerald-600" />
            </div>
            <div>
              <p className="font-medium text-slate-900">Export All Round 1</p>
              <p className="text-xs text-slate-600">Complete scores</p>
            </div>
          </button>

          <button
            onClick={handleExportRound2Results}
            className="flex items-center gap-3 p-4 bg-gradient-to-br from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 border border-amber-300 rounded-xl transition-colors group"
          >
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center group-hover:bg-amber-200 transition-colors">
              <Trophy className="size-5 text-amber-600" />
            </div>
            <div>
              <p className="font-medium text-slate-900">Export Round 2 Results</p>
              <p className="text-xs text-slate-600">Top 15 with judges</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}