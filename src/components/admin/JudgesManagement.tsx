import { useMemo, useState } from 'react';
import { Judge, Event, JudgeType } from '../../types';
import { Gavel, Mail, Award, UserPlus, Pencil, X, Trash2 } from 'lucide-react';
import { createJudge, updateJudge, deleteJudge } from '../../api/scoringApi';
import { toast } from 'sonner';

interface JudgesManagementProps {
  judges: Judge[];
  events: Event[];
  onJudgeCreated: (judge: Judge) => void;
  onJudgeUpdated: (judge: Judge) => void;
  onJudgeDeleted: (judgeId: string) => void;
}

export function JudgesManagement({ judges, events, onJudgeCreated, onJudgeUpdated, onJudgeDeleted }: JudgesManagementProps) {
  const [name, setName] = useState('');
  const [judgeId, setJudgeId] = useState('');
  const [judgeType, setJudgeType] = useState<JudgeType>('Internal');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isEditing = Boolean(editingId);

  const resetForm = () => {
    setName('');
    setJudgeId('');
    setJudgeType('Internal');
    setEditingId(null);
  };

  const sortedJudges = useMemo(() => {
    return [...judges].sort((a, b) => a.name.localeCompare(b.name));
  }, [judges]);

  const handleEdit = (judge: Judge) => {
    setName(judge.name);
    setJudgeId(judge.id);
    setJudgeType(judge.type);
    setEditingId(judge.backendId || null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !judgeId.trim()) return;

    setLoading(true);
    try {
      if (isEditing) {
        if (!editingId) throw new Error('Missing judge record id. Please refresh.');
        const res: any = await updateJudge(editingId, {
          name: name.trim(),
          judgeId: judgeId.trim(),
          judgeType
        });
        onJudgeUpdated({
          backendId: res.id || editingId,
          id: res.judgeId || judgeId.trim(),
          name: res.name || name.trim(),
          email: '',
          expertise: [],
          assignedEventIds: ['event-1'],
          type: res.judgeType || judgeType
        });
        toast.success('Judge updated');
      } else {
        const res: any = await createJudge({
          name: name.trim(),
          judgeId: judgeId.trim(),
          judgeType
        });
        onJudgeCreated({
          backendId: res.id,
          id: res.judgeId || judgeId.trim(),
          name: res.name || name.trim(),
          email: '',
          expertise: [],
          assignedEventIds: ['event-1'],
          type: res.judgeType || judgeType
        });
        toast.success('Judge created');
      }
      resetForm();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save judge');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (judge: Judge) => {
    if (!judge.backendId) {
      toast.error('Cannot delete: Missing judge ID');
      return;
    }

    if (!confirm(`Are you sure you want to delete judge "${judge.name}"?`)) {
      return;
    }

    setLoading(true);
    try {
      await deleteJudge(judge.backendId);
      onJudgeDeleted(judge.id);
      toast.success('Judge deleted successfully');
      if (editingId === judge.backendId) {
        resetForm();
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete judge');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Judges Management</h1>
          <p className="text-sm sm:text-base text-slate-600 mt-1">Manage judges and their event assignments</p>
        </div>
      </div>

      {/* Add / Update Judge */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <UserPlus className="size-5 text-emerald-600" />
          <h2 className="text-lg font-semibold text-slate-900">{isEditing ? 'Update Judge' : 'Add Judge'}</h2>
        </div>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-2">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
              placeholder="Judge Name"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Judge ID</label>
            <input
              value={judgeId}
              onChange={(e) => setJudgeId(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
              placeholder="JDG-001"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Type</label>
            <select
              value={judgeType}
              onChange={(e) => setJudgeType(e.target.value as JudgeType)}
              className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
            >
              <option value="Internal">Internal</option>
              <option value="External">External</option>
            </select>
          </div>
          <div className="sm:col-span-2 lg:col-span-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold disabled:opacity-60 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              <UserPlus className="size-5" />
              {loading ? 'Saving...' : isEditing ? 'Update Judge' : 'Add Judge'}
            </button>
            {isEditing && (
              <button
                type="button"
                onClick={resetForm}
                className="inline-flex items-center justify-center gap-2 px-4 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <X className="size-4" /> Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Judges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedJudges.map(judge => {
          const assignedEvents = events.filter(e => e.assignedJudges.includes(judge.id));

          return (
            <div
              key={judge.id}
              className="bg-white border border-slate-200 rounded-xl p-4 sm:p-6 hover:border-blue-300 hover:shadow-md transition-all"
            >
              {/* Judge Header */}
              <div className="flex items-start gap-3 sm:gap-4 mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Gavel className="size-5 sm:size-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-900 truncate">{judge.name}</h3>
                  <div className="flex items-center gap-1 text-xs sm:text-sm text-slate-600 mt-1">
                    <Mail className="size-3" />
                    <span className="truncate">{judge.email}</span>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2">
                  <button
                    onClick={() => handleEdit(judge)}
                    className="inline-flex items-center gap-1 text-xs text-slate-700 hover:text-blue-600"
                  >
                    <Pencil className="size-3" /> <span className="hidden sm:inline">Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(judge)}
                    disabled={loading}
                    className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-700 disabled:opacity-50"
                  >
                    <Trash2 className="size-3" /> <span className="hidden sm:inline">Delete</span>
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                  judge.type === 'External'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-emerald-100 text-emerald-700'
                }`}>
                  {judge.type} Judge
                </span>
              </div>

              {/* Expertise */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="size-4 text-blue-600" />
                  <p className="text-sm font-medium text-slate-700">Expertise</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {judge.expertise.map(exp => (
                    <span
                      key={exp}
                      className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-md"
                    >
                      {exp}
                    </span>
                  ))}
                </div>
              </div>

              {/* Assigned Events */}
              <div className="pt-4 border-t border-slate-200">
                <p className="text-xs font-medium text-slate-600 mb-2">
                  Assigned Events ({assignedEvents.length})
                </p>
                {assignedEvents.length > 0 ? (
                  <div className="space-y-1">
                    {assignedEvents.map(event => (
                      <div
                        key={event.id}
                        className="text-sm text-slate-700 bg-slate-100 rounded px-2 py-1"
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
