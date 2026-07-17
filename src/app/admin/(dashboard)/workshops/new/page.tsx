import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { isMock } from '@/lib/supabase/config';
import { WorkshopForm } from '../WorkshopForm';

export default async function NewWorkshopPage() {
  let instructors: any[] = [];

  if (!isMock) {
    try {
      const supabase = await createClient();
      // Instructors = profiles with role 'instructor'. Map full_name -> name so
      // the WorkshopForm's { id, name } contract stays unchanged.
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('role', 'instructor')
        .order('full_name');
      instructors = (data || []).map(p => ({ id: p.id, name: p.full_name || 'Unnamed' }));
    } catch (e) {
      console.error('Failed to fetch instructors for new workshop:', e);
    }
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

  return <WorkshopForm instructors={instructors} />;
}
