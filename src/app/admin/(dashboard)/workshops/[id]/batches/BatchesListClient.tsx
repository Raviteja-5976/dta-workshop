"use client";

import React, { useEffect, useState } from 'react';
import { 
  Calendar, 
  Layers, 
  Users, 
  Edit3, 
  Trash2, 
  X, 
  Plus, 
  AlertTriangle,
  Link as LinkIcon,
  HelpCircle,
  Clock,
  Lock
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { NeoButton } from '@/components/UI/NeoButton';
import { NeoCard } from '@/components/UI/NeoCard';
import { StatusBadge } from '@/components/UI/StatusBadge';
import { createBatchAction, updateBatchAction, deleteBatchAction } from '@/actions/batches';
import {
  formatDeadline,
  isoToIstInput,
  istInputToISO,
  isRegistrationClosed,
  WORKSHOP_TIME_ZONE_LABEL,
} from '@/lib/datetime';

interface BatchItem {
  id: string;
  batch_label: string;
  status: string;
  date_label: string;
  start_date: string | null;
  end_date: string | null;
  duration_label: string;
  num_sessions: number;
  price: number;
  original_price: number | null;
  seat_limit: number;
  seats_taken: number;
  seats_remaining: number;
  registration_open: boolean;
  registration_deadline: string | null;
  payment_link: string | null;
  instructor_id: string | null;
  instructor_name: string;
}

interface InstructorItem {
  id: string;
  name: string;
}

interface BatchesListClientProps {
  workshopId: string;
  workshopTitle: string;
  initialBatches: BatchItem[];
  instructors: InstructorItem[];
}

export const BatchesListClient: React.FC<BatchesListClientProps> = ({
  workshopId,
  workshopTitle,
  initialBatches,
  instructors
}) => {
  const router = useRouter();
  const [batches, setBatches] = useState<BatchItem[]>(initialBatches);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState<BatchItem | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  // Wall clock used to flag batches whose deadline has passed. Starts null so
  // the server-rendered markup and the first client render match, then ticks
  // so a card flips to "Closed" without a page reload.
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setNow(Date.now());
    // Read the clock from timer callbacks only — a synchronous setState in the
    // effect body would cascade a second render on every mount.
    const first = setTimeout(tick, 0);
    const timer = setInterval(tick, 30_000);
    return () => {
      clearTimeout(first);
      clearInterval(timer);
    };
  }, []);

  // Form states
  const [batchLabel, setBatchLabel] = useState('');
  const [status, setStatus] = useState('Upcoming');
  const [dateLabel, setDateLabel] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [durationLabel, setDurationLabel] = useState('2 Days');
  const [numSessions, setNumSessions] = useState(0);
  const [price, setPrice] = useState(999);
  const [originalPrice, setOriginalPrice] = useState('');
  const [seatLimit, setSeatLimit] = useState(50);
  const [instructorId, setInstructorId] = useState('');
  const [registrationOpen, setRegistrationOpen] = useState(true);
  // IST wall-clock value bound to <input type="datetime-local">.
  const [registrationDeadline, setRegistrationDeadline] = useState('');
  const [paymentLink, setPaymentLink] = useState('');

  const openAddModal = () => {
    setEditingBatch(null);
    setBatchLabel(`Batch ${batches.length + 1}`);
    setStatus('Upcoming');
    setDateLabel('');
    setStartDate('');
    setEndDate('');
    setDurationLabel('2 Days');
    setNumSessions(4);
    setPrice(999);
    setOriginalPrice('2999');
    setSeatLimit(50);
    setInstructorId('');
    setRegistrationOpen(true);
    setRegistrationDeadline('');
    setPaymentLink('');
    setModalOpen(true);
  };

  const openEditModal = (batch: BatchItem) => {
    setEditingBatch(batch);
    setBatchLabel(batch.batch_label);
    setStatus(batch.status);
    setDateLabel(batch.date_label);
    setStartDate(batch.start_date || '');
    setEndDate(batch.end_date || '');
    setDurationLabel(batch.duration_label);
    setNumSessions(batch.num_sessions);
    setPrice(batch.price);
    setOriginalPrice(batch.original_price?.toString() || '');
    setSeatLimit(batch.seat_limit);
    setInstructorId(batch.instructor_id || '');
    setRegistrationOpen(batch.registration_open);
    setRegistrationDeadline(isoToIstInput(batch.registration_deadline));
    setPaymentLink(batch.payment_link || '');
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      workshop_id: workshopId,
      instructor_id: instructorId || null,
      batch_label: batchLabel,
      status,
      date_label: dateLabel,
      start_date: startDate || null,
      end_date: endDate || null,
      duration_label: durationLabel,
      num_sessions: numSessions,
      currency: 'INR',
      price,
      original_price: originalPrice ? Number(originalPrice) : null,
      seat_limit: seatLimit,
      registration_open: registrationOpen,
      registration_deadline: istInputToISO(registrationDeadline),
      payment_link: paymentLink || null,
    };

    try {
      if (editingBatch) {
        const res = await updateBatchAction(editingBatch.id, payload);
        if (res.success) {
          router.refresh();
          setModalOpen(false);
          // Simple reload to fetch updated relations from server
          window.location.reload();
        } else {
          alert(res.error || 'Failed to update batch.');
        }
      } else {
        const res = await createBatchAction(payload);
        if (res.success) {
          router.refresh();
          setModalOpen(false);
          window.location.reload();
        } else {
          alert(res.error || 'Failed to create batch.');
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmId) return;
    setLoading(true);

    const res = await deleteBatchAction(deleteConfirmId, workshopId);
    if (res.success) {
      setBatches(prev => prev.filter(b => b.id !== deleteConfirmId));
      setDeleteConfirmId(null);
    } else {
      alert(res.error || 'Failed to delete batch.');
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b-2 border-deep-navy/10 pb-4">
        <div className="text-left">
          <span className="text-[10px] font-display font-black tracking-widest text-deep-navy/50 uppercase block">
            Run Manager
          </span>
          <h2 className="font-display font-black text-2xl text-deep-navy leading-none uppercase">
            {workshopTitle} — Batches
          </h2>
        </div>
        <NeoButton variant="orange" size="sm" onClick={openAddModal} className="self-start sm:self-auto">
          <Plus size={16} /> Add New Run / Batch
        </NeoButton>
      </div>

      {/* Batches Grid */}
      {batches.length === 0 ? (
        <NeoCard variant="white" className="p-12 text-center">
          <h3 className="font-display font-black text-xl text-deep-navy">No Batches Yet</h3>
          <p className="text-sm font-semibold text-deep-navy/60 mt-2 max-w-sm mx-auto">
            This workshop template has no scheduled runs. Create a new batch run to start accepting student registrations.
          </p>
          <NeoButton variant="orange" size="sm" onClick={openAddModal} className="mt-6">
            + Create First Batch
          </NeoButton>
        </NeoCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {batches.map((batch) => {
            const seatsPct = Math.min(Math.round((batch.seats_taken / batch.seat_limit) * 100), 100);
            const closed =
              now !== null &&
              isRegistrationClosed({
                registrationOpen: batch.registration_open,
                registrationDeadline: batch.registration_deadline,
              }, now);
            return (
              <NeoCard key={batch.id} variant="white" borderSize="normal" shadowSize="normal" className="p-6 flex flex-col justify-between text-left">
                <div className="space-y-4">
                  {/* Top Bar Label + Status */}
                  <div className="flex items-center justify-between">
                    <span className="font-display font-black text-lg text-deep-navy uppercase">
                      {batch.batch_label}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {closed && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 border-2 border-deep-navy bg-coral text-white rounded-lg font-display font-black text-[9px] uppercase shadow-[1.5px_1.5px_0_0_#1B1F3B]">
                          <Lock size={10} className="stroke-[3]" /> Closed
                        </span>
                      )}
                      <StatusBadge status={batch.status} />
                    </div>
                  </div>

                  {/* Instructor & Date Details */}
                  <div className="space-y-2 text-xs font-semibold text-deep-navy/80">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-deep-navy/40" />
                      <span>{batch.date_label || 'TBA'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Layers size={14} className="text-deep-navy/40" />
                      <span>{batch.num_sessions} Sessions ({batch.duration_label})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users size={14} className="text-deep-navy/40" />
                      <span>Instructor: <span className="font-bold capitalize">{batch.instructor_name || 'DTA Team'}</span></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-deep-navy/40" />
                      {batch.registration_deadline ? (
                        <span>
                          Registration closes:{' '}
                          <span className="font-bold">{formatDeadline(batch.registration_deadline)}</span>
                        </span>
                      ) : (
                        <span className="text-deep-navy/50">No registration deadline</span>
                      )}
                    </div>
                    {batch.payment_link && (
                      <div className="flex items-center gap-2 text-primary-orange font-bold">
                        <LinkIcon size={14} />
                        <a href={batch.payment_link} target="_blank" rel="noreferrer" className="hover:underline truncate max-w-[200px]">
                          Payment Page Linked
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Pricing Info */}
                  <div className="flex items-baseline gap-2 border-t border-deep-navy/10 pt-3">
                    <span className="font-display font-black text-xl text-deep-navy">₹{batch.price}</span>
                    {batch.original_price && (
                      <span className="text-xs font-semibold text-deep-navy/40 line-through">₹{batch.original_price}</span>
                    )}
                  </div>

                  {/* Seat Occupancy Meter */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[10px] font-bold text-deep-navy/60">
                      <span>Seats: {batch.seats_taken} / {batch.seat_limit}</span>
                      <span>{seatsPct}% Filled</span>
                    </div>
                    <div className="w-full h-4 border-2 border-deep-navy bg-bg-cream rounded-lg overflow-hidden shadow-neo-inset p-0.5">
                      <div 
                        className="h-full bg-mint border-r border-deep-navy rounded-md transition-all duration-300"
                        style={{ width: `${seatsPct}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Batch Actions */}
                <div className="grid grid-cols-2 gap-2 mt-6">
                  <Link href={`/admin/batches/${batch.id}/sessions`} className="w-full">
                    <NeoButton variant="sky" size="sm" className="w-full py-2.5 text-xs">
                      Sessions
                    </NeoButton>
                  </Link>
                  <Link href={`/admin/batches/${batch.id}/registrations`} className="w-full">
                    <NeoButton variant="mint" size="sm" className="w-full py-2.5 text-xs">
                      Students
                    </NeoButton>
                  </Link>
                  <button
                    onClick={() => openEditModal(batch)}
                    className="flex-1 py-2 px-3 border-2 border-deep-navy bg-white hover:bg-bg-cream rounded-xl text-xs font-bold text-deep-navy shadow-[2px_2px_0px_0px_#1B1F3B] hover:-translate-y-0.5 active:translate-y-0 cursor-pointer inline-flex items-center justify-center gap-1.5"
                  >
                    <Edit3 size={12} /> Edit Run
                  </button>
                  <button
                    onClick={() => setDeleteConfirmId(batch.id)}
                    className="flex-1 py-2 px-3 border-2 border-deep-navy bg-coral hover:bg-[#ff708c] rounded-xl text-xs font-bold text-white shadow-[2px_2px_0px_0px_#1B1F3B] hover:-translate-y-0.5 active:translate-y-0 cursor-pointer inline-flex items-center justify-center gap-1.5"
                  >
                    <Trash2 size={12} /> Delete
                  </button>
                </div>
              </NeoCard>
            );
          })}
        </div>
      )}

      {/* Add / Edit Neo Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-deep-navy/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <NeoCard variant="white" borderSize="thick" shadowSize="large" className="p-6 md:p-8 max-w-lg w-full relative">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 border-2 border-deep-navy bg-white hover:bg-bg-cream rounded-xl shadow-[2px_2px_0px_0px_#1B1F3B] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_#1B1F3B] cursor-pointer"
            >
              <X size={14} className="text-deep-navy stroke-[3]" />
            </button>

            <h3 className="font-display font-black text-xl text-deep-navy uppercase mb-6 text-left">
              {editingBatch ? 'Modify Batch Run' : 'Schedule New Run'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              <div className="grid grid-cols-2 gap-4">
                {/* Label */}
                <div className="space-y-1">
                  <label className="text-[10px] font-display font-black uppercase text-deep-navy">Batch Label</label>
                  <input
                    type="text"
                    required
                    value={batchLabel}
                    onChange={(e) => setBatchLabel(e.target.value)}
                    placeholder="e.g. Batch 1"
                    className="w-full border-2 border-deep-navy rounded-lg bg-bg-cream font-semibold px-2.5 py-1.5 text-xs focus:outline-none"
                  />
                </div>

                {/* Status */}
                <div className="space-y-1">
                  <label className="text-[10px] font-display font-black uppercase text-deep-navy">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full border-2 border-deep-navy rounded-lg bg-bg-cream font-semibold px-2.5 py-1.5 text-xs focus:outline-none cursor-pointer"
                  >
                    <option value="Upcoming">Upcoming</option>
                    <option value="Live">Live</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                {/* Date Label */}
                <div className="space-y-1">
                  <label className="text-[10px] font-display font-black uppercase text-deep-navy">Date Label</label>
                  <input
                    type="text"
                    required
                    value={dateLabel}
                    onChange={(e) => setDateLabel(e.target.value)}
                    placeholder="e.g. 11 - 12 July"
                    className="w-full border-2 border-deep-navy rounded-lg bg-bg-cream font-semibold px-2.5 py-1.5 text-xs focus:outline-none"
                  />
                </div>

                {/* Duration */}
                <div className="space-y-1">
                  <label className="text-[10px] font-display font-black uppercase text-deep-navy">Duration Label</label>
                  <input
                    type="text"
                    required
                    value={durationLabel}
                    onChange={(e) => setDurationLabel(e.target.value)}
                    placeholder="e.g. 2 Days"
                    className="w-full border-2 border-deep-navy rounded-lg bg-bg-cream font-semibold px-2.5 py-1.5 text-xs focus:outline-none"
                  />
                </div>

                {/* Start Date */}
                <div className="space-y-1">
                  <label className="text-[10px] font-display font-black uppercase text-deep-navy">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full border-2 border-deep-navy rounded-lg bg-bg-cream font-semibold px-2.5 py-1.5 text-xs focus:outline-none cursor-pointer"
                  />
                </div>

                {/* End Date */}
                <div className="space-y-1">
                  <label className="text-[10px] font-display font-black uppercase text-deep-navy">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full border-2 border-deep-navy rounded-lg bg-bg-cream font-semibold px-2.5 py-1.5 text-xs focus:outline-none cursor-pointer"
                  />
                </div>

                {/* Price */}
                <div className="space-y-1">
                  <label className="text-[10px] font-display font-black uppercase text-deep-navy">Price (INR)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full border-2 border-deep-navy rounded-lg bg-bg-cream font-semibold px-2.5 py-1.5 text-xs focus:outline-none"
                  />
                </div>

                {/* Original Price */}
                <div className="space-y-1">
                  <label className="text-[10px] font-display font-black uppercase text-deep-navy">Original Price</label>
                  <input
                    type="number"
                    min={0}
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(e.target.value)}
                    placeholder="e.g. 2999"
                    className="w-full border-2 border-deep-navy rounded-lg bg-bg-cream font-semibold px-2.5 py-1.5 text-xs focus:outline-none"
                  />
                </div>

                {/* Seat Limit */}
                <div className="space-y-1">
                  <label className="text-[10px] font-display font-black uppercase text-deep-navy">Seat Capacity Limit</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={seatLimit}
                    onChange={(e) => setSeatLimit(Number(e.target.value))}
                    className="w-full border-2 border-deep-navy rounded-lg bg-bg-cream font-semibold px-2.5 py-1.5 text-xs focus:outline-none"
                  />
                </div>

                {/* Number of sessions */}
                <div className="space-y-1">
                  <label className="text-[10px] font-display font-black uppercase text-deep-navy">Sessions Count</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={numSessions}
                    onChange={(e) => setNumSessions(Number(e.target.value))}
                    className="w-full border-2 border-deep-navy rounded-lg bg-bg-cream font-semibold px-2.5 py-1.5 text-xs focus:outline-none"
                  />
                </div>

                {/* Instructor Override */}
                <div className="space-y-1 col-span-2">
                  <label className="text-[10px] font-display font-black uppercase text-deep-navy">Instructor Override</label>
                  <select
                    value={instructorId}
                    onChange={(e) => setInstructorId(e.target.value)}
                    className="w-full border-2 border-deep-navy rounded-lg bg-bg-cream font-semibold px-2.5 py-1.5 text-xs focus:outline-none cursor-pointer"
                  >
                    <option value="">Use Default Workshop Instructor...</option>
                    {instructors.map(inst => (
                      <option key={inst.id} value={inst.id}>{inst.name}</option>
                    ))}
                  </select>
                </div>

                {/* Registration Deadline */}
                <div className="space-y-1 col-span-2">
                  <label className="text-[10px] font-display font-black uppercase text-deep-navy flex items-center gap-1">
                    <Clock size={11} className="stroke-[3]" />
                    Registration Deadline ({WORKSHOP_TIME_ZONE_LABEL}) — Optional
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="datetime-local"
                      value={registrationDeadline}
                      onChange={(e) => setRegistrationDeadline(e.target.value)}
                      className="flex-1 border-2 border-deep-navy rounded-lg bg-bg-cream font-semibold px-2.5 py-1.5 text-xs focus:outline-none cursor-pointer"
                    />
                    {registrationDeadline && (
                      <button
                        type="button"
                        onClick={() => setRegistrationDeadline('')}
                        className="px-2.5 py-1.5 border-2 border-deep-navy bg-white hover:bg-bg-cream rounded-lg text-[10px] font-bold text-deep-navy shadow-[2px_2px_0px_0px_#1B1F3B] cursor-pointer"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <p className="text-[10px] font-semibold text-deep-navy/50">
                    {registrationDeadline
                      ? `Students can no longer register after ${formatDeadline(istInputToISO(registrationDeadline))}.`
                      : 'Leave empty to accept registrations until you flip the switch below.'}
                  </p>
                </div>

                {/* Static Payment Link */}
                <div className="space-y-1 col-span-2">
                  <label className="text-[10px] font-display font-black uppercase text-deep-navy flex items-center gap-1">
                    Static Payment URL (Optional)
                  </label>
                  <input
                    type="text"
                    value={paymentLink}
                    onChange={(e) => setPaymentLink(e.target.value)}
                    placeholder="https://rzp.io/l/your-batch-page"
                    className="w-full border-2 border-deep-navy rounded-lg bg-bg-cream font-semibold px-2.5 py-1.5 text-xs focus:outline-none"
                  />
                </div>
              </div>

              {/* Registration Open Switch */}
              <div className="flex items-center gap-2 bg-bg-cream/40 border border-dashed border-deep-navy/20 rounded-lg p-2.5 mt-2">
                <input
                  type="checkbox"
                  id="reg_open"
                  checked={registrationOpen}
                  onChange={(e) => setRegistrationOpen(e.target.checked)}
                  className="w-4 h-4 accent-mint cursor-pointer"
                />
                <label htmlFor="reg_open" className="text-[10px] font-display font-black uppercase text-deep-navy cursor-pointer">
                  Accepting registrations for this batch
                </label>
              </div>

              <NeoButton
                variant="orange"
                type="submit"
                size="sm"
                className="w-full mt-4"
                disabled={loading}
              >
                {loading ? 'Processing...' : editingBatch ? 'Save Changes' : 'Create Run'}
              </NeoButton>
            </form>
          </NeoCard>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-deep-navy/70 backdrop-blur-sm flex items-center justify-center p-4">
          <NeoCard variant="white" borderSize="thick" shadowSize="large" className="p-6 max-w-sm w-full space-y-6 text-center">
            <div className="w-16 h-16 bg-coral/10 border-3 border-coral rounded-2xl flex items-center justify-center mx-auto shadow-neo">
              <AlertTriangle className="w-8 h-8 text-coral" />
            </div>
            <div className="space-y-2">
              <h3 className="font-display font-black text-xl text-deep-navy leading-none uppercase">
                Delete Run
              </h3>
              <p className="text-sm font-semibold text-deep-navy/60">
                Are you sure you want to delete this batch? All student registrations and payments for this batch will be lost.
              </p>
            </div>
            <div className="flex gap-4">
              <NeoButton variant="white" className="flex-1 text-deep-navy" size="sm" onClick={() => setDeleteConfirmId(null)} disabled={loading}>
                Cancel
              </NeoButton>
              <NeoButton variant="coral" className="flex-1" size="sm" onClick={handleDelete} disabled={loading}>
                {loading ? 'Deleting...' : 'Delete'}
              </NeoButton>
            </div>
          </NeoCard>
        </div>
      )}
    </div>
  );
};
export default BatchesListClient;
