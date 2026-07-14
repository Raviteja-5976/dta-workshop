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
