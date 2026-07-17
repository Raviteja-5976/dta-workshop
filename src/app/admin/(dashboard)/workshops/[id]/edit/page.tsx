import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { isMock } from '@/lib/supabase/config';
import { WorkshopForm } from '../../WorkshopForm';
import { workshopsData as staticWorkshops } from '@/data/workshops';

interface EditWorkshopPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditWorkshopPage({ params }: EditWorkshopPageProps) {
  const { id } = await params;
  let workshop: any = null;
  let instructors: any[] = [];

  if (isMock) {
    // Return matching static workshop or fallback
    const staticWs = staticWorkshops.find(w => w.slug === id) || staticWorkshops[0];
    workshop = {
      id: id,
      title: staticWs.title,
      slug: staticWs.slug,
      description: staticWs.description,
      about_text: staticWs.aboutText || '',
      cover_image: staticWs.coverImage || '',
      difficulty: staticWs.difficulty,
      category: staticWs.category,
      highlights: staticWs.highlights,
      learning_outcomes: staticWs.learningOutcomes,
      faq: staticWs.faq,
      is_published: true
    };
  } else {
    try {
      const supabase = await createClient();
      
      // Fetch workshop details
      const { data, error } = await supabase
        .from('workshops')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      workshop = data;

      // Instructors = profiles with role 'instructor'. Map full_name -> name so
      // the WorkshopForm's { id, name } contract stays unchanged.
      const { data: instData } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('role', 'instructor')
        .order('full_name');
      instructors = (instData || []).map(p => ({ id: p.id, name: p.full_name || 'Unnamed' }));

    } catch (e) {
      console.error('Failed to fetch workshop for editing:', e);
    }
  }

  // Fallback if workshop not found
  if (!workshop) {
    return (
      <div className="p-8 text-center bg-white border-4 border-deep-navy rounded-3xl max-w-md mx-auto shadow-neo">
        <h3 className="font-display font-black text-xl text-deep-navy">Workshop Not Found</h3>
        <p className="text-sm font-semibold text-deep-navy/60 mt-2">
          The requested workshop record could not be loaded or does not exist.
        </p>
      </div>
    );
  }

  // Fallback demo instructors — only in mock mode. Against a real database we
  // must NOT inject fake non-UUID ids, or selecting one and saving would fail
  // the workshops.default_instructor_id UUID/foreign-key constraint.
  if (isMock && instructors.length === 0) {
    instructors = [
      { id: 'mock-inst-1', name: 'Alex Coder (Lead Architect)' },
      { id: 'mock-inst-2', name: 'Sarah Dev (Principal AI Eng)' }
    ];
  }

  return <WorkshopForm initialData={workshop} instructors={instructors} isEdit={true} />;
}
