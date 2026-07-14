"use server";

import { assertAdmin } from '@/lib/auth';
import { getAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';
import { isMock } from '@/lib/supabase/config';

// Simple helper to auto-slugify if needed
function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')       // Replace spaces with -
    .replace(/&/g, '-and-')     // Replace & with 'and'
    .replace(/[^\w\-]+/g, '')   // Remove all non-word chars
    .replace(/\-\-+/g, '-');    // Replace multiple - with single -
}

/**
 * Creates a new workshop template.
 */
export async function createWorkshopAction(formData: any) {
  try {
    await assertAdmin();

    const slug = formData.slug ? slugify(formData.slug) : slugify(formData.title);

    if (isMock) {
      return { success: true, slug, id: 'mock-ws-new-id' };
    }

    const supabase = await getAdminClient();
    
    // Check if slug is unique
    const { data: existing } = await supabase
      .from('workshops')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();

    if (existing) {
      return { success: false, error: 'A workshop with this slug already exists.' };
    }

    const { data, error } = await supabase
      .from('workshops')
      .insert({
        title: formData.title,
        slug,
        description: formData.description,
        about_text: formData.about_text || null,
        cover_image: formData.cover_image || null,
        difficulty: formData.difficulty,
        category: formData.category,
        default_instructor_id: formData.default_instructor_id || null,
        is_published: formData.is_published !== false,
        highlights: formData.highlights || [],
        learning_outcomes: formData.learning_outcomes || [],
        faq: formData.faq || []
      })
      .select('id')
      .single();

    if (error) throw error;

    revalidatePath('/workshops');
    revalidatePath(`/workshops/${slug}`);
    revalidatePath('/admin/workshops');

    return { success: true, id: data.id, slug };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to create workshop.' };
  }
}

/**
 * Updates an existing workshop template.
 */
export async function updateWorkshopAction(id: string, formData: any) {
  try {
    await assertAdmin();

    const slug = formData.slug ? slugify(formData.slug) : slugify(formData.title);

    if (isMock) {
      return { success: true };
    }

    const supabase = await getAdminClient();

    // Check if slug is unique (excluding current workshop)
    const { data: existing } = await supabase
      .from('workshops')
      .select('id')
      .eq('slug', slug)
      .neq('id', id)
      .maybeSingle();

    if (existing) {
      return { success: false, error: 'A workshop with this slug already exists.' };
    }

    const { error } = await supabase
      .from('workshops')
      .update({
        title: formData.title,
        slug,
        description: formData.description,
        about_text: formData.about_text || null,
        cover_image: formData.cover_image || null,
        difficulty: formData.difficulty,
        category: formData.category,
        default_instructor_id: formData.default_instructor_id || null,
        is_published: formData.is_published !== false,
        highlights: formData.highlights || [],
        learning_outcomes: formData.learning_outcomes || [],
        faq: formData.faq || []
      })
      .eq('id', id);

    if (error) throw error;

    revalidatePath('/workshops');
    revalidatePath(`/workshops/${slug}`);
    revalidatePath('/admin/workshops');

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update workshop.' };
  }
}

/**
 * Deletes a workshop template.
 */
export async function deleteWorkshopAction(id: string) {
  try {
    await assertAdmin();

    if (isMock) {
      return { success: true };
    }

    const supabase = await getAdminClient();
    const { error } = await supabase
      .from('workshops')
      .delete()
      .eq('id', id);

    if (error) throw error;

    revalidatePath('/workshops');
    revalidatePath('/admin/workshops');

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to delete workshop.' };
  }
}
export async function updateWorkshopPublishAction(id: string, isPublished: boolean) {
  try {
    await assertAdmin();

    if (isMock) {
      return { success: true };
    }

    const supabase = await getAdminClient();
    const { error } = await supabase
      .from('workshops')
      .update({ is_published: isPublished })
      .eq('id', id);

    if (error) throw error;

    revalidatePath('/workshops');
    revalidatePath('/admin/workshops');

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update publish state.' };
  }
}
