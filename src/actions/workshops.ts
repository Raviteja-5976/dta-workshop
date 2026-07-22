"use server";

import { assertAdmin } from '@/lib/auth';
import { getAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';
import { isMock } from '@/lib/supabase/config';

/**
 * Uploads a workshop cover image to the Supabase Storage bucket and returns the
 * stored object path. The path is what gets saved into workshops.cover_image;
 * resolveCoverImage() turns it into a public URL for display on both the admin
 * preview and the public/user-facing pages (same image everywhere).
 */
export async function uploadWorkshopCoverAction(formData: FormData) {
  try {
    await assertAdmin();

    const file = formData.get('file');
    if (!(file instanceof File) || file.size === 0) {
      return { success: false, error: 'No image file provided.' };
    }
    if (!file.type.startsWith('image/')) {
      return { success: false, error: 'Please choose an image file (PNG, JPG, WEBP).' };
    }
    if (file.size > 5 * 1024 * 1024) {
      return { success: false, error: 'Image is too large (max 5MB).' };
    }

    const bucket = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET;
    if (isMock || !bucket) {
      return {
        success: false,
        error: 'Image uploads need a live Supabase project with NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET set.',
      };
    }

    const supabase = await getAdminClient();
    const ext = (file.name.split('.').pop() || 'png').toLowerCase().replace(/[^a-z0-9]/g, '');
    const path = `covers/${Date.now()}-${crypto.randomUUID()}.${ext}`;
    const bytes = new Uint8Array(await file.arrayBuffer());

    const { error } = await supabase.storage.from(bucket).upload(path, bytes, {
      contentType: file.type,
      upsert: false,
    });
    if (error) return { success: false, error: error.message };

    return { success: true, path };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to upload image.' };
  }
}

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
        faq: formData.faq || [],
        project_preview_url: formData.project_preview_url || null,
        project_preview_enabled: formData.project_preview_enabled === true
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
        faq: formData.faq || [],
        project_preview_url: formData.project_preview_url || null,
        project_preview_enabled: formData.project_preview_enabled === true
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
