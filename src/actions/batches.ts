"use server";

import { assertAdmin } from '@/lib/auth';
import { getAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';
import { isMock } from '@/lib/supabase/config';

/**
 * Creates a new batch/run of a workshop.
 */
export async function createBatchAction(formData: any) {
  try {
    await assertAdmin();

    if (isMock) {
      return { success: true, id: 'mock-batch-new-id' };
    }

    const supabase = await getAdminClient();
    const { data, error } = await supabase
      .from('workshop_batches')
      .insert({
        workshop_id: formData.workshop_id,
        instructor_id: formData.instructor_id || null,
        batch_label: formData.batch_label || 'Batch 1',
        status: formData.status || 'Upcoming',
        date_label: formData.date_label || 'TBA',
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        duration_label: formData.duration_label || '2 Days',
        num_sessions: Number(formData.num_sessions || 0),
        timezone: formData.timezone || 'Asia/Kolkata',
        currency: formData.currency || 'INR',
        price: Number(formData.price || 0),
        original_price: formData.original_price ? Number(formData.original_price) : null,
        seat_limit: Number(formData.seat_limit || 50),
        registration_open: formData.registration_open !== false,
        registration_deadline: formData.registration_deadline || null,
        payment_link: formData.payment_link || null,
      })
      .select('id')
      .single();

    if (error) throw error;

    revalidatePath('/workshops');
    revalidatePath('/admin/workshops');
    revalidatePath(`/admin/workshops/${formData.workshop_id}/batches`);

    return { success: true, id: data.id };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to create batch.' };
  }
}

/**
 * Updates an existing batch of a workshop.
 */
export async function updateBatchAction(id: string, formData: any) {
  try {
    await assertAdmin();

    if (isMock) {
      return { success: true };
    }

    const supabase = await getAdminClient();
    const { error } = await supabase
      .from('workshop_batches')
      .update({
        instructor_id: formData.instructor_id || null,
        batch_label: formData.batch_label,
        status: formData.status,
        date_label: formData.date_label,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        duration_label: formData.duration_label,
        num_sessions: Number(formData.num_sessions || 0),
        timezone: formData.timezone,
        currency: formData.currency,
        price: Number(formData.price || 0),
        original_price: formData.original_price ? Number(formData.original_price) : null,
        seat_limit: Number(formData.seat_limit || 50),
        registration_open: formData.registration_open !== false,
        registration_deadline: formData.registration_deadline || null,
        payment_link: formData.payment_link || null,
      })
      .eq('id', id);

    if (error) throw error;

    revalidatePath('/workshops');
    revalidatePath('/admin/workshops');
    revalidatePath(`/admin/workshops/${formData.workshop_id}/batches`);

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update batch.' };
  }
}

/**
 * Deletes a batch from a workshop.
 */
export async function deleteBatchAction(id: string, workshopId: string) {
  try {
    await assertAdmin();

    if (isMock) {
      return { success: true };
    }

    const supabase = await getAdminClient();
    const { error } = await supabase
      .from('workshop_batches')
      .delete()
      .eq('id', id);

    if (error) throw error;

    revalidatePath('/workshops');
    revalidatePath('/admin/workshops');
    revalidatePath(`/admin/workshops/${workshopId}/batches`);

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to delete batch.' };
  }
}
