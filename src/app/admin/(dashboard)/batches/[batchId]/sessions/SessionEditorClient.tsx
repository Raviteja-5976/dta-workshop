"use client";

import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Save, 
  Clock,
  Calendar,
  Layers,
  BookOpen,
  Info,
  Video
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { NeoButton } from '@/components/UI/NeoButton';
import { NeoCard } from '@/components/UI/NeoCard';
import { TagInput } from '@/components/UI/TagInput';
import { saveSessionsAction, updateSessionLiveAction } from '@/actions/sessions';

interface SessionItem {
  id?: string;
  title: string;
  about: string;
  duration_label: string;
  scheduled_at: string | null;
  topics: string[];
  assignment: string;
  resources: string[];
  meeting_link: string;
  is_live: boolean;
}

interface SessionEditorClientProps {
  batchId: string;
  workshopId: string;
  workshopTitle: string;
  batchLabel: string;
  initialSessions: SessionItem[];
}

export const SessionEditorClient: React.FC<SessionEditorClientProps> = ({
  batchId,
  workshopId,
  workshopTitle,
  batchLabel,
  initialSessions
}) => {
  const router = useRouter();
  const [sessions, setSessions] = useState<SessionItem[]>(initialSessions);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [liveBusy, setLiveBusy] = useState<number | null>(null);

  const addSession = () => {
    setSessions([
      ...sessions,
      {
        title: `Session ${sessions.length + 1}`,
        about: '',
        duration_label: '2 Hours',
        scheduled_at: '',
        topics: [],
        assignment: '',
        resources: [],
        meeting_link: '',
        is_live: false,
      }
    ]);
  };

  // Flip a session live/offline. Turning it on opens the meeting link (the
  // instructor joins) and — for an already-saved session — persists instantly so
  // students see the Join button right away. New unsaved sessions persist on Save.
  const toggleLive = async (idx: number) => {
    const session = sessions[idx];
    const next = !session.is_live;

    if (next && !session.meeting_link.trim()) {
      setErrorMsg('Add a meeting link for this session before switching it live.');
      return;
    }

    setErrorMsg(null);
    updateSession(idx, 'is_live', next);

    if (next && session.meeting_link) {
      window.open(session.meeting_link, '_blank', 'noopener,noreferrer');
    }

    if (session.id) {
      setLiveBusy(idx);
      const res = await updateSessionLiveAction(session.id, next, session.meeting_link);
      setLiveBusy(null);
      if (!res.success) {
        setErrorMsg(res.error || 'Failed to update live status.');
        updateSession(idx, 'is_live', !next); // revert on failure
      } else {
        router.refresh();
      }
    }
  };

  const removeSession = (idx: number) => {
    setSessions(sessions.filter((_, i) => i !== idx));
  };

  const updateSession = (idx: number, field: keyof SessionItem, val: any) => {
    const updated = [...sessions];
    updated[idx] = {
      ...updated[idx],
      [field]: val
    };
    setSessions(updated);
  };

  const moveUp = (idx: number) => {
    if (idx === 0) return;
    const updated = [...sessions];
    const temp = updated[idx];
    updated[idx] = updated[idx - 1];
    updated[idx - 1] = temp;
    setSessions(updated);
  };

  const moveDown = (idx: number) => {
    if (idx === sessions.length - 1) return;
    const updated = [...sessions];
    const temp = updated[idx];
    updated[idx] = updated[idx + 1];
    updated[idx + 1] = temp;
    setSessions(updated);
  };

  const handleSave = async () => {
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await saveSessionsAction(batchId, workshopId, sessions);
      if (res.success) {
        setSuccessMsg('Session schedule saved successfully!');
        router.refresh();
        setTimeout(() => {
          setSuccessMsg(null);
        }, 3000);
      } else {
        setErrorMsg(res.error || 'Failed to save sessions.');
      }
    } catch (err: any) {
      setErrorMsg('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b-2 border-deep-navy/10 pb-4">
        <div className="flex items-center gap-3 text-left">
          <Link href={`/admin/workshops/${workshopId}/batches`}>
            <button className="p-2 border-2 border-deep-navy bg-white hover:bg-bg-cream rounded-xl shadow-[2px_2px_0px_0px_#1B1F3B] hover:-translate-y-0.5 active:translate-y-0 cursor-pointer">
              <ArrowLeft size={16} className="text-deep-navy" />
            </button>
          </Link>
          <div>
            <span className="text-[10px] font-display font-black tracking-widest text-deep-navy/50 uppercase block">
              {workshopTitle} ({batchLabel})
            </span>
            <h2 className="font-display font-black text-2xl text-deep-navy leading-none uppercase">
              Schedule & Sessions Editor
            </h2>
          </div>
        </div>

        <div className="flex gap-2.5">
          <NeoButton variant="mint" size="sm" onClick={addSession}>
            <Plus size={16} /> Add Session
          </NeoButton>
          <NeoButton variant="orange" size="sm" onClick={handleSave} disabled={loading}>
            <Save size={16} /> Save Schedule
          </NeoButton>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-coral/10 border-2 border-coral rounded-xl text-coral text-sm font-bold">
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-mint/10 border-2 border-mint rounded-xl text-deep-navy text-sm font-bold">
          {successMsg}
        </div>
      )}

      {/* Sessions List */}
      <div className="space-y-6 text-left">
        {sessions.length === 0 ? (
          <NeoCard variant="white" className="p-12 text-center">
            <h3 className="font-display font-black text-lg text-deep-navy">No Sessions Schematized</h3>
            <p className="text-sm text-deep-navy/60 font-semibold mt-2 max-w-xs mx-auto">
              This run has no sessions listed. Click "Add Session" above to start mapping topics and timing.
            </p>
          </NeoCard>
        ) : (
          sessions.map((session, idx) => (
            <NeoCard key={idx} variant="white" className="p-6 md:p-8 space-y-6 relative border-3 border-deep-navy shadow-neo">
              {/* Header Title with order and sorting actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-deep-navy/10 pb-4">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg border-2 border-deep-navy bg-yellow text-deep-navy flex items-center justify-center font-display font-black">
                    {idx + 1}
                  </span>
                  <input
                    type="text"
                    value={session.title}
                    onChange={(e) => updateSession(idx, 'title', e.target.value)}
                    placeholder={`Session ${idx + 1} Title`}
                    className="font-display font-black text-xl text-deep-navy bg-transparent border-b-2 border-dashed border-transparent hover:border-deep-navy/30 focus:border-primary-orange focus:outline-none py-0.5 max-w-md w-full"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => moveUp(idx)}
                    disabled={idx === 0}
                    className="p-2 border-2 border-deep-navy bg-white hover:bg-bg-cream rounded-xl disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                  >
                    <ArrowUp size={14} className="text-deep-navy" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveDown(idx)}
                    disabled={idx === sessions.length - 1}
                    className="p-2 border-2 border-deep-navy bg-white hover:bg-bg-cream rounded-xl disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                  >
                    <ArrowDown size={14} className="text-deep-navy" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeSession(idx)}
                    className="p-2 border-2 border-deep-navy bg-coral text-white rounded-xl hover:bg-[#ff708c] cursor-pointer"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Form content */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Live meeting control */}
                <div className={`space-y-2.5 md:col-span-2 border-2 rounded-xl p-4 transition-colors ${session.is_live ? 'border-success bg-mint/10' : 'border-deep-navy/15 bg-bg-cream/30'}`}>
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <label className="text-[10px] font-display font-black uppercase text-deep-navy flex items-center gap-1">
                      <Video size={12} className="text-deep-navy/50" /> Live Meeting Link
                    </label>
                    <button
                      type="button"
                      onClick={() => toggleLive(idx)}
                      disabled={liveBusy === idx}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 border-2 border-deep-navy rounded-lg font-display font-black text-[10px] uppercase shadow-[2px_2px_0px_0px_#1B1F3B] hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none ${session.is_live ? 'bg-success text-white' : 'bg-white text-deep-navy'}`}
                    >
                      <span className={`w-2 h-2 rounded-full ${session.is_live ? 'bg-white animate-pulse' : 'bg-deep-navy/30'}`} />
                      {liveBusy === idx ? 'Saving...' : session.is_live ? 'Live Now — End Session' : 'Go Live'}
                    </button>
                  </div>
                  <input
                    type="text"
                    value={session.meeting_link}
                    onChange={(e) => updateSession(idx, 'meeting_link', e.target.value)}
                    placeholder="https://meet.google.com/... or a Zoom / Teams link"
                    className="w-full border-2 border-deep-navy rounded-lg bg-white font-semibold px-3 py-2 text-xs focus:outline-none"
                  />
                  <p className="text-[10px] font-bold text-deep-navy/50 leading-relaxed">
                    Only confirmed students see this — inside their dashboard. Switching it live opens the link
                    and reveals the Join button for them. Remember to <span className="font-black text-deep-navy">Save Schedule</span> after editing the link.
                  </p>
                </div>

                {/* About this session */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[10px] font-display font-black uppercase text-deep-navy flex items-center gap-1">
                    <Info size={12} className="text-deep-navy/50" /> About This Session
                  </label>
                  <textarea
                    rows={2}
                    value={session.about}
                    onChange={(e) => updateSession(idx, 'about', e.target.value)}
                    placeholder="Short description of what this session covers, shown to students on the workshop page..."
                    className="w-full border-2 border-deep-navy rounded-lg bg-bg-cream font-semibold px-3 py-2 text-xs focus:outline-none"
                  />
                </div>

                {/* Duration */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-display font-black uppercase text-deep-navy flex items-center gap-1">
                    <Clock size={12} className="text-deep-navy/50" /> Duration Label
                  </label>
                  <input
                    type="text"
                    value={session.duration_label}
                    onChange={(e) => updateSession(idx, 'duration_label', e.target.value)}
                    placeholder="e.g. 2 Hours"
                    className="w-full border-2 border-deep-navy rounded-lg bg-bg-cream font-semibold px-3 py-2 text-xs focus:outline-none"
                  />
                </div>

                {/* Scheduled At */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-display font-black uppercase text-deep-navy flex items-center gap-1">
                    <Calendar size={12} className="text-deep-navy/50" /> Scheduled Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={session.scheduled_at ? session.scheduled_at.substring(0, 16) : ''}
                    onChange={(e) => updateSession(idx, 'scheduled_at', e.target.value)}
                    className="w-full border-2 border-deep-navy rounded-lg bg-bg-cream font-semibold px-3 py-2 text-xs focus:outline-none cursor-pointer"
                  />
                </div>

                {/* Topics TagInput */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[10px] font-display font-black uppercase text-deep-navy flex items-center gap-1">
                    <Layers size={12} className="text-deep-navy/50" /> Session Topics
                  </label>
                  <TagInput
                    tags={session.topics}
                    onChange={(tags) => updateSession(idx, 'topics', tags)}
                    placeholder="Type topic and press Enter..."
                  />
                </div>

                {/* Assignment */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[10px] font-display font-black uppercase text-deep-navy flex items-center gap-1">
                    <BookOpen size={12} className="text-deep-navy/50" /> Session Assignment (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={session.assignment}
                    onChange={(e) => updateSession(idx, 'assignment', e.target.value)}
                    placeholder="Describe the homework assignment for this session..."
                    className="w-full border-2 border-deep-navy rounded-lg bg-bg-cream font-semibold px-3 py-2 text-xs focus:outline-none"
                  />
                </div>

                {/* Resources TagInput */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[10px] font-display font-black uppercase text-deep-navy flex items-center gap-1">
                    <Info size={12} className="text-deep-navy/50" /> Recommended Resources (Optional)
                  </label>
                  <TagInput
                    tags={session.resources}
                    onChange={(tags) => updateSession(idx, 'resources', tags)}
                    placeholder="Type resource asset link/name and press Enter..."
                  />
                </div>
              </div>
            </NeoCard>
          ))
        )}
      </div>

      {/* Floating Save Bar */}
      {sessions.length > 0 && (
        <NeoCard variant="white" borderSize="normal" shadowSize="normal" className="p-4 flex justify-between items-center bg-white sticky bottom-4 border-3 z-10 shadow-neo">
          <p className="text-xs font-bold text-deep-navy/60">
            You have <span className="text-deep-navy font-black">{sessions.length} sessions</span> mapped for this batch.
          </p>
          <NeoButton variant="orange" size="sm" onClick={handleSave} disabled={loading}>
            <Save size={16} /> Save All Changes
          </NeoButton>
        </NeoCard>
      )}
    </div>
  );
};
export default SessionEditorClient;
