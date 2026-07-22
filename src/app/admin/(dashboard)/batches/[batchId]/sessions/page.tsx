import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { isMock } from '@/lib/supabase/config';
import { SessionEditorClient } from './SessionEditorClient';
import { workshopsData as staticWorkshops } from '@/data/workshops';

interface SessionsPageProps {
  params: Promise<{ batchId: string }>;
}

export default async function SessionsPage({ params }: SessionsPageProps) {
  const { batchId } = await params;
  let workshopId = 'mock-ws-id';
  let workshopTitle = 'Workshop';
  let batchLabel = 'Batch 1';
  let sessions: any[] = [];

  if (isMock) {
    const staticWs = staticWorkshops[0];
    workshopTitle = staticWs.title;
    workshopId = staticWs.slug;
    batchLabel = 'Batch 1';
    sessions = staticWs.schedule.map((s, index) => ({
      title: s.title,
      about: s.about || '',
      duration_label: s.duration,
      scheduled_at: null,
      topics: s.topics,
      assignment: s.assignment,
      resources: s.resources || [],
      meeting_link: '',
      is_live: false
    }));
  } else {
    try {
      const supabase = await createClient();

      // Fetch batch and workshop details
      const { data: batch } = await supabase
        .from('workshop_batches')
        .select(`
          workshop_id,
          batch_label,
          workshops ( title )
        `)
        .eq('id', batchId)
        .single();
      
      if (batch) {
        workshopId = batch.workshop_id;
        batchLabel = batch.batch_label;
        workshopTitle = (batch.workshops as any)?.title || 'Workshop';
      }

      // Fetch sessions
      const { data: dbSessions, error } = await supabase
        .from('batch_sessions')
        .select('*')
        .eq('batch_id', batchId)
        .order('session_order', { ascending: true });

      if (error) throw error;

      if (dbSessions) {
        sessions = dbSessions.map((s: any) => ({
          id: s.id,
          title: s.title,
          about: s.about || '',
          duration_label: s.duration_label || '2 Hours',
          scheduled_at: s.scheduled_at,
          topics: Array.isArray(s.topics) ? s.topics : [],
          assignment: s.assignment || '',
          resources: Array.isArray(s.resources) ? s.resources : [],
          meeting_link: s.meeting_link || '',
          is_live: s.is_live === true
        }));
      }

    } catch (e) {
      console.error('Failed to load batch sessions:', e);
    }
  }

  return (
    <SessionEditorClient
      batchId={batchId}
      workshopId={workshopId}
      workshopTitle={workshopTitle}
      batchLabel={batchLabel}
      initialSessions={sessions}
    />
  );
}
