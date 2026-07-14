import React from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { isMock } from '@/lib/supabase/config';
import { WorkshopsListClient } from './WorkshopsListClient';
import { NeoButton } from '@/components/UI/NeoButton';
import { workshopsData as staticWorkshops } from '@/data/workshops';

export default async function WorkshopsPage() {
  let workshops: any[] = [];

  if (isMock) {
    workshops = staticWorkshops.map((w, index) => ({
      id: `mock-ws-${index}`,
      title: w.title,
      slug: w.slug,
      category: w.category,
      difficulty: w.difficulty,
      is_published: true,
      batch_count: 1
    }));
  } else {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from('workshops')
        .select(`
          id,
          title,
          slug,
          category,
          difficulty,
          is_published,
          workshop_batches ( id )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      workshops = data.map((w: any) => ({
        id: w.id,
        title: w.title,
        slug: w.slug,
        category: w.category,
        difficulty: w.difficulty,
        is_published: w.is_published,
        batch_count: w.workshop_batches?.length || 0
      }));
    } catch (e) {
      console.error('Failed to fetch workshops:', e);
      workshops = [];
    }
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1 text-left">
          <span className="inline-flex items-center gap-1.5 border-2 border-deep-navy bg-yellow px-3 py-1 rounded-full text-xs font-display font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_#1B1F3B]">
            Maintain
          </span>
          <h1 className="font-display font-black text-4xl text-deep-navy tracking-tight leading-none uppercase">
            Workshops Catalog
          </h1>
        </div>
        <div className="flex gap-3 self-start md:self-auto">
          <Link href="/admin/workshops/new">
            <NeoButton variant="orange" size="sm">
              + New Workshop
            </NeoButton>
          </Link>
        </div>
      </div>

      <WorkshopsListClient initialWorkshops={workshops} />
    </div>
  );
}
