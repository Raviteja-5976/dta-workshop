import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { isMock } from '@/lib/supabase/config';
import { NeoCard } from '@/components/UI/NeoCard';

export default async function InstructorsPage() {
  let instructors: any[] = [];

  if (isMock) {
    instructors = [
      { id: 'mock-1', full_name: 'Alex Coder', email: 'alex@dta.com', phone: null },
      { id: 'mock-2', full_name: 'Sarah Dev', email: 'sarah@dta.com', phone: null }
    ];
  } else {
    try {
      const supabase = await createClient();
      // Instructors are profiles whose role = 'instructor'. Set the role in the
      // profiles table (or via the admin UI) to add someone here.
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, email, phone')
        .eq('role', 'instructor')
        .order('full_name');
      instructors = data || [];
    } catch (e) {
      console.error('Failed to load instructors list:', e);
    }
  }

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between border-b-2 border-deep-navy/10 pb-4 text-left">
        <div>
          <span className="inline-flex items-center gap-1.5 border-2 border-deep-navy bg-yellow px-3 py-1 rounded-full text-xs font-display font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_#1B1F3B]">
            Maintain
          </span>
          <h1 className="font-display font-black text-4xl text-deep-navy tracking-tight leading-none uppercase mt-2">
            Instructors List
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
        {instructors.length === 0 ? (
          <p className="text-sm font-semibold text-deep-navy/40 py-8 col-span-2 text-center">
            No instructors yet. Set a user&apos;s role to &lsquo;instructor&rsquo; in the profiles table to add one.
          </p>
        ) : (
          instructors.map(inst => (
            <NeoCard key={inst.id} className="p-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl border-2 border-deep-navy bg-primary-orange flex items-center justify-center font-display font-black text-white text-lg">
                  {(inst.full_name || inst.email || '?')[0].toUpperCase()}
                </div>
                <div>
                  <h3 className="font-display font-black text-lg text-deep-navy capitalize">{inst.full_name || 'Unnamed'}</h3>
                  <p className="text-xs font-bold text-deep-navy/50">Instructor</p>
                </div>
              </div>
              <div className="text-sm font-semibold text-deep-navy/80 leading-relaxed space-y-1">
                <p>{inst.email || 'No email on file.'}</p>
                {inst.phone && <p className="text-deep-navy/50">{inst.phone}</p>}
              </div>
            </NeoCard>
          ))
        )}
      </div>
    </div>
  );
}
