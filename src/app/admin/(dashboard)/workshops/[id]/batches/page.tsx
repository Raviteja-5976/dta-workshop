import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { isMock } from '@/lib/supabase/config';
import { BatchesListClient } from './BatchesListClient';
import { workshopsData as staticWorkshops } from '@/data/workshops';

interface BatchesPageProps {
  params: Promise<{ id: string }>;
}

export default async function BatchesPage({ params }: BatchesPageProps) {
  const { id } = await params;
  let workshopTitle = 'Workshop';
  let batches: any[] = [];
  let instructors: any[] = [];

  if (isMock) {
    const staticWs = staticWorkshops.find(w => w.slug === id) || staticWorkshops[0];
    workshopTitle = staticWs.title;
    batches = [
      {
        id: 'mock-batch-1',
        batch_label: 'Batch 1',
        status: 'Live',
        date_label: staticWs.date,
        start_date: '2026-07-11',
        end_date: '2026-07-12',
        duration_label: staticWs.duration,
        num_sessions: staticWs.sessions,
        price: staticWs.price,
        original_price: staticWs.originalPrice || null,
        seat_limit: staticWs.seatLimit,
        seats_taken: staticWs.seatLimit - staticWs.remainingSeats,
        seats_remaining: staticWs.remainingSeats,
        registration_open: true,
        payment_link: null,
        instructor_id: 'mock-inst-1',
        instructor_name: staticWs.instructor
      }
    ];
  } else {
    try {
      const supabase = await createClient();

      // Fetch workshop details
      const { data: ws } = await supabase
        .from('workshops')
        .select('title')
        .eq('id', id)
        .single();
      
      if (ws) {
        workshopTitle = ws.title;
      }

      // Fetch instructors
      const { data: instData } = await supabase
        .from('instructors')
        .select('id, name')
        .order('name');
      instructors = instData || [];

      // Fetch batches
      const { data: dbBatches, error } = await supabase
        .from('workshop_batches')
        .select(`
          id,
          batch_label,
          status,
          date_label,
          start_date,
          end_date,
          duration_label,
          num_sessions,
          price,
          original_price,
          seat_limit,
          registration_open,
          payment_link,
          instructor_id,
          instructors ( name )
        `)
        .eq('workshop_id', id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      if (dbBatches && dbBatches.length > 0) {
        // Fetch seat counts
        const batchIds = dbBatches.map(b => b.id);
        const { data: seatCounts } = await supabase
          .from('batch_seat_status')
          .select('batch_id, seats_taken, seats_remaining')
          .in('batch_id', batchIds);

        batches = dbBatches.map((b: any) => {
          const seatCount = seatCounts?.find(s => s.batch_id === b.id);
          return {
            id: b.id,
            batch_label: b.batch_label,
            status: b.status,
            date_label: b.date_label,
            start_date: b.start_date,
            end_date: b.end_date,
            duration_label: b.duration_label,
            num_sessions: b.num_sessions,
            price: Number(b.price || 0),
            original_price: b.original_price ? Number(b.original_price) : null,
            seat_limit: b.seat_limit,
            seats_taken: seatCount?.seats_taken || 0,
            seats_remaining: seatCount?.seats_remaining ?? b.seat_limit,
            registration_open: b.registration_open,
            payment_link: b.payment_link,
            instructor_id: b.instructor_id,
            instructor_name: b.instructors?.name || 'DTA Team'
          };
        });
      }

    } catch (e) {
      console.error('Failed to load workshop batches:', e);
    }
  }

  // Fallback demo instructors — only in mock mode. Against a real database we
  // must NOT inject fake non-UUID ids, or choosing one as a batch instructor
  // override and saving would fail the instructor_id UUID/foreign-key constraint.
  if (isMock && instructors.length === 0) {
    instructors = [
      { id: 'mock-inst-1', name: 'Alex Coder (Lead Architect)' },
      { id: 'mock-inst-2', name: 'Sarah Dev (Principal AI Eng)' }
    ];
  }

  return (
    <BatchesListClient
      workshopId={id}
      workshopTitle={workshopTitle}
      initialBatches={batches}
      instructors={instructors}
    />
  );
}
