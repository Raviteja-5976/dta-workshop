"use server";

import { assertAdmin } from '@/lib/auth';
import { getAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';
import { isMock } from '@/lib/supabase/config';

/**
 * Saves (overwrites) all sessions for a specific batch.
 * Deletes all existing sessions for the batch first and inserts the new list,
 * then updates the batch session count to match.
 */
export async function saveSessionsAction(batchId: string, workshopId: string, sessions: any[]) {
  try {
    await assertAdmin();

    if (isMock) {
      return { success: true };
    }

    const supabase = await getAdminClient();

    // 1. Delete all existing sessions for this batch
    const { error: deleteError } = await supabase
      .from('batch_sessions')
      .delete()
      .eq('batch_id', batchId);

    if (deleteError) throw deleteError;

    // 2. Insert new sessions list
    if (sessions.length > 0) {
      const sessionsToInsert = sessions.map((s, index) => ({
        batch_id: batchId,
        session_order: index + 1,
        title: s.title || `Session ${index + 1}`,
        about: s.about || null,
        duration_label: s.duration_label || '2 Hours',
        scheduled_at: s.scheduled_at || null,
        topics: Array.isArray(s.topics) ? s.topics : [],
        assignment: s.assignment || null,
        resources: Array.isArray(s.resources) ? s.resources : [],
        meeting_link: s.meeting_link || null,
        is_live: s.is_live === true,
      }));

      const { error: insertError } = await supabase
        .from('batch_sessions')
        .insert(sessionsToInsert);

      if (insertError) throw insertError;
    }

    // 3. Update the session count in workshop_batches
    const { error: updateBatchError } = await supabase
      .from('workshop_batches')
      .update({ num_sessions: sessions.length })
      .eq('id', batchId);

    if (updateBatchError) throw updateBatchError;

    revalidatePath('/workshops');
    revalidatePath(`/admin/workshops/${workshopId}/batches`);
    revalidatePath(`/admin/batches/${batchId}/sessions`);

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to save sessions.' };
  }
}

/**
 * Toggles a single already-saved session live/offline (and optionally updates its
 * meeting link) without rewriting the whole schedule. Used by the "Go Live"
 * switch so students see the Join button the instant it is flipped on.
 */
export async function updateSessionLiveAction(
  sessionId: string,
  isLive: boolean,
  meetingLink?: string
) {
  try {
    await assertAdmin();

    if (isMock) {
      return { success: true };
    }

    const supabase = await getAdminClient();
    const { error } = await supabase
      .from('batch_sessions')
      .update({
        is_live: isLive,
        // Only overwrite the link when a value was passed through.
        ...(meetingLink !== undefined ? { meeting_link: meetingLink || null } : {}),
      })
      .eq('id', sessionId);

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update session.' };
  }
}
