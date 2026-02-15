import { useState } from 'react';
import { useLocation, useNavigate, Outlet } from 'react-router';
import { AdminDashboard } from './admin/AdminDashboard';
import { EventsList } from './admin/EventsList';
import { ResultsView } from './admin/ResultsView';
import { TeamsManagement } from './admin/TeamsManagement';
import { JudgesManagement } from './admin/JudgesManagement';
import { TeamAllocation } from './admin/TeamAllocation';
import { AllocationView } from './admin/AllocationView';
import { JudgeDashboard } from './judge/JudgeDashboard';
import { ScoringInterface } from './judge/ScoringInterface';
import { LoginPage } from './auth/LoginPage';
import { Layout } from './shared/Layout';
import { User, Event, Team, Score, Judge, RoundType } from '../types';
import {
  mockEvents as initialEvents,
  mockTeams as initialTeams,
  mockScores as initialScores,
  mockJudges,
  mockAdminUser,
  mockJudgeUsers
} from '../utils/mockData';

export function Root() {
  const location = useLocation();
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [teams, setTeams] = useState<Team[]>(initialTeams);
  const [scores, setScores] = useState<Score[]>(initialScores);
  const [judges] = useState<Judge[]>(mockJudges);

  // Handle login
  const handleLogin = (user: User) => {
    setCurrentUser(user);
    if (user.role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/judge');
    }
  };

  // Handle logout
  const handleLogout = () => {
    setCurrentUser(null);
    navigate('/');
  };

  // Handle delete event
  const handleDeleteEvent = (eventId: string) => {
    setEvents(prev => prev.filter(e => e.id !== eventId));
    setTeams(prev => prev.filter(t => t.eventId !== eventId));
    setScores(prev => prev.filter(s => s.eventId !== eventId));
  };

  // Handle toggle event lock
  const handleToggleLock = (eventId: string) => {
    setEvents(prev =>
      prev.map(e => (e.id === eventId ? { ...e, isLocked: !e.isLocked } : e))
    );
  };

  // Handle submit score
  const handleSubmitScore = (scoreData: Omit<Score, 'id' | 'submittedAt'>) => {
    const newScore: Score = {
      ...scoreData,
      id: `score-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      submittedAt: new Date().toISOString()
    };

    // Check if score already exists
    const existingIndex = scores.findIndex(
      s =>
        s.eventId === newScore.eventId &&
        s.teamId === newScore.teamId &&
        s.judgeId === newScore.judgeId
    );

    if (existingIndex >= 0) {
      // Update existing score
      setScores(prev => {
        const updated = [...prev];
        updated[existingIndex] = newScore;
        return updated;
      });
    } else {
      // Add new score
      setScores(prev => [...prev, newScore]);
    }
  };

  // Handle update team allocation
  const handleUpdateTeamAllocation = (teamId: string, judgeIds: string[], round: RoundType) => {
    setTeams(prev =>
      prev.map(team => {
        if (team.id === teamId) {
          const roundKey = round === 'Round 1' ? 'round1' : 'round2';
          return {
            ...team,
            allocatedJudges: {
              ...team.allocatedJudges,
              [roundKey]: judgeIds
            }
          };
        }
        return team;
      })
    );
  };

  // If not logged in, show login page
  if (!currentUser) {
    return (
      <LoginPage
        onLogin={handleLogin}
        mockAdminUser={mockAdminUser}
        mockJudgeUsers={mockJudgeUsers}
      />
    );
  }

  // Determine which component to render based on route
  const renderContent = () => {
    const path = location.pathname;

    if (currentUser.role === 'admin') {
      if (path === '/admin' || path === '/') {
        return (
          <AdminDashboard
            events={events}
            teams={teams}
            scores={scores}
            judges={judges}
          />
        );
      } else if (path === '/admin/events') {
        return (
          <EventsList
            events={events}
            teams={teams}
            judges={judges}
            onDeleteEvent={handleDeleteEvent}
            onToggleLock={handleToggleLock}
          />
        );
      } else if (path === '/admin/results') {
        return (
          <ResultsView
            events={events}
            teams={teams}
            scores={scores}
          />
        );
      } else if (path === '/admin/teams') {
        return (
          <TeamsManagement
            events={events}
            teams={teams}
          />
        );
      } else if (path === '/admin/judges') {
        return (
          <JudgesManagement
            judges={judges}
            events={events}
          />
        );
      } else if (path === '/admin/team-allocation') {
        // Get the active event (Pitch Perfect 2026)
        const activeEvent = events.find(e => e.id === 'event-1');
        if (!activeEvent) {
          return <div className="text-white">Event not found</div>;
        }
        return (
          <TeamAllocation
            event={activeEvent}
            teams={teams}
            judges={judges}
            scores={scores}
            onUpdateTeamAllocation={handleUpdateTeamAllocation}
          />
        );
      } else if (path === '/admin/allocation-view') {
        return (
          <AllocationView
            events={events}
            teams={teams}
            judges={judges}
            scores={scores}
          />
        );
      }
    } else if (currentUser.role === 'judge') {
      if (path === '/judge' || path === '/') {
        return (
          <JudgeDashboard
            currentUser={currentUser}
            events={events}
            teams={teams}
            scores={scores}
          />
        );
      } else if (path.startsWith('/judge/events/')) {
        return (
          <ScoringInterface
            currentUser={currentUser}
            events={events}
            teams={teams}
            scores={scores}
            onSubmitScore={handleSubmitScore}
          />
        );
      }
    }

    // Default: redirect to appropriate dashboard
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Page Not Found</h2>
        <p className="text-slate-600 mb-6">The page you're looking for doesn't exist.</p>
        <button
          onClick={() => navigate(currentUser.role === 'admin' ? '/admin' : '/judge')}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl text-white font-medium hover:from-blue-700 hover:to-blue-800 transition-all shadow-md"
        >
          Go to Dashboard
        </button>
      </div>
    );
  };

  return (
    <Layout currentUser={currentUser} onLogout={handleLogout}>
      {renderContent()}
    </Layout>
  );
}