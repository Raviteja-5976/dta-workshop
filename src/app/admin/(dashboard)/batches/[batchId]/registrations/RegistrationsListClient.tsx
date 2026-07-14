"use client";

import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Copy, 
  Check, 
  ExternalLink, 
  CreditCard, 
  RefreshCw, 
  UserCheck, 
  XOctagon, 
  AlertCircle,
  FileSpreadsheet
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { NeoButton } from '@/components/UI/NeoButton';
import { NeoCard } from '@/components/UI/NeoCard';
import { StatusBadge } from '@/components/UI/StatusBadge';
import { 
  generateRazorpayLinkAction, 
  updateRegistrationStatusAction, 
  mockProcessPaymentAction 
} from '@/actions/payments';

interface RegistrationItem {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  status: string;
  confirmation_code: string | null;
  registered_at: string;
  payment_status: string;
  payment_link: string | null;
  payment_amount: number | null;
}

interface RegistrationsListClientProps {
  batchId: string;
  workshopId: string;
  workshopTitle: string;
  batchLabel: string;
  batchPrice: number;
  initialRegistrations: RegistrationItem[];
}

export const RegistrationsListClient: React.FC<RegistrationsListClientProps> = ({
  batchId,
  workshopId,
  workshopTitle,
  batchLabel,
  batchPrice,
  initialRegistrations
}) => {
  const router = useRouter();
  const [registrations, setRegistrations] = useState<RegistrationItem[]>(initialRegistrations);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const [linkGeneratingId, setLinkGeneratingId] = useState<string | null>(null);
  const [paymentActionId, setPaymentActionId] = useState<string | null>(null);
  const [generatedLinkMap, setGeneratedLinkMap] = useState<Record<string, string>>({});

  const handleCopy = (text: string, id: string, type: 'link' | 'code') => {
    navigator.clipboard.writeText(text);
    if (type === 'link') {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } else {
      setCopiedCodeId(id);
      setTimeout(() => setCopiedCodeId(null), 2000);
    }
  };

  // Generate Razorpay Payment Link
  const handleGenerateLink = async (reg: RegistrationItem) => {
    setLinkGeneratingId(reg.id);
    
    const res = await generateRazorpayLinkAction(
      reg.id,
      batchId,
      reg.user_id,
      batchPrice,
      {
        name: reg.full_name,
        email: reg.email,
        phone: reg.phone || undefined
      },
      `Payment for ${workshopTitle} (${batchLabel})`
    );

    if (res.success && res.paymentLink) {
      setGeneratedLinkMap(prev => ({ ...prev, [reg.id]: res.paymentLink! }));
      setRegistrations(prev =>
        prev.map(r => (r.id === reg.id ? { ...r, payment_link: res.paymentLink, payment_status: 'pending' } : r))
      );
    } else {
      alert(res.error || 'Failed to generate payment link.');
    }
    setLinkGeneratingId(null);
  };

  // Update Status
  const handleUpdateStatus = async (regId: string, status: string) => {
    setPaymentActionId(regId);
    const res = await updateRegistrationStatusAction(regId, status, batchId);
    if (res.success) {
      // Reload on change to get new confirmation code from server
      window.location.reload();
    } else {
      alert(res.error || 'Failed to update registration status.');
      setPaymentActionId(null);
    }
  };

  // Process Mock Payment (Simulate Razorpay Webhook)
  const handleMockPay = async (regId: string) => {
    setPaymentActionId(regId);
    const res = await mockProcessPaymentAction(regId, batchId);
    if (res.success) {
      window.location.reload();
    } else {
      alert(res.error || 'Failed to process mock payment.');
      setPaymentActionId(null);
    }
  };

  // Export registrations to CSV
  const exportToCSV = () => {
    const headers = 'Name,Email,Phone,Registration Status,Payment Status,Confirmation Code,Registered At\n';
    const rows = registrations.map(r => 
      `"${r.full_name}","${r.email}","${r.phone || ''}","${r.status}","${r.payment_status}","${r.confirmation_code || ''}","${new Date(r.registered_at).toLocaleDateString()}"`
    ).join('\n');
    
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${workshopTitle.replace(/\s+/g, '_')}_${batchLabel}_registrations.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b-2 border-deep-navy/10 pb-4">
        <div className="flex items-center gap-3 text-left">
          <Link href={`/admin/workshops/${workshopId}/batches`}>
            <button className="p-2 border-2 border-deep-navy bg-white hover:bg-bg-cream rounded-xl shadow-[2px_2px_0px_0px_#1B1F3B] hover:-translate-y-0.5 active:translate-y-0 cursor-pointer">
              <ArrowLeft size={16} className="text-deep-navy" />
            </button>
          </Link>
          <div>
            <span className="text-[10px] font-display font-black tracking-widest text-deep-navy/50 uppercase block">
              {workshopTitle} ({batchLabel})
            </span>
            <h2 className="font-display font-black text-2xl text-deep-navy leading-none uppercase">
              Registered Students
            </h2>
          </div>
        </div>

        <div className="flex gap-2.5">
          <NeoButton variant="mint" size="sm" onClick={exportToCSV} disabled={registrations.length === 0}>
            <FileSpreadsheet size={16} /> Export CSV
          </NeoButton>
        </div>
      </div>

      {/* Registrations List */}
      <NeoCard variant="white" className="p-6">
        <div className="overflow-x-auto -mx-6">
          <div className="inline-block min-w-full align-middle px-6">
            <table className="min-w-full divide-y-3 divide-deep-navy">
              <thead>
                <tr className="bg-yellow border-b-3 border-deep-navy text-left font-display font-black text-xs uppercase text-deep-navy">
                  <th className="px-4 py-3">Student info</th>
                  <th className="px-4 py-3">Confirmation</th>
                  <th className="px-4 py-3 text-center">Reg Status</th>
                  <th className="px-4 py-3 text-center">Payment Status</th>
                  <th className="px-4 py-3">Payment Link / Action</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-deep-navy/10 text-sm font-semibold">
                {registrations.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-deep-navy/40 font-bold">
                      No registrations found for this batch run.
                    </td>
                  </tr>
                ) : (
                  registrations.map((reg) => {
                    const payLink = generatedLinkMap[reg.id] || reg.payment_link;
                    const isProcessing = paymentActionId === reg.id;
                    const isLinkGen = linkGeneratingId === reg.id;

                    return (
                      <tr key={reg.id} className="hover:bg-bg-cream/50 transition-colors">
                        <td className="px-4 py-4 text-left">
                          <p className="font-bold text-deep-navy capitalize">{reg.full_name}</p>
                          <p className="text-xs text-deep-navy/50">{reg.email}</p>
                          {reg.phone && <p className="text-xs text-deep-navy/50">{reg.phone}</p>}
                        </td>
                        <td className="px-4 py-4 text-left font-mono text-xs">
                          {reg.confirmation_code ? (
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold bg-bg-cream border border-deep-navy/20 px-2 py-0.5 rounded text-deep-navy">
                                {reg.confirmation_code}
                              </span>
                              <button
                                onClick={() => handleCopy(reg.confirmation_code!, reg.id, 'code')}
                                className="p-1 hover:bg-bg-cream rounded text-deep-navy/50 hover:text-deep-navy cursor-pointer"
                              >
                                {copiedCodeId === reg.id ? <Check size={12} className="text-success stroke-[3]" /> : <Copy size={12} />}
                              </button>
                            </div>
                          ) : (
                            <span className="text-deep-navy/30 italic">Not issued</span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-center">
                          <StatusBadge status={reg.status} />
                        </td>
                        <td className="px-4 py-4 text-center">
                          <StatusBadge status={reg.payment_status} />
                        </td>
                        <td className="px-4 py-4 text-left">
                          {reg.payment_status === 'paid' ? (
                            <span className="text-xs font-bold text-success inline-flex items-center gap-1">
                              Verified Paid
                            </span>
                          ) : payLink ? (
                            <div className="flex items-center gap-2">
                              {/* Open link */}
                              <a
                                href={payLink}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-xs text-primary-orange hover:underline font-bold"
                              >
                                Payment Link <ExternalLink size={12} />
                              </a>
                              {/* Copy button */}
                              <button
                                onClick={() => handleCopy(payLink, reg.id, 'link')}
                                className="p-1.5 border border-deep-navy bg-white hover:bg-bg-cream rounded shadow-[1px_1px_0px_0px_#1B1F3B] cursor-pointer"
                                title="Copy Payment Link"
                              >
                                {copiedId === reg.id ? (
                                  <Check size={12} className="text-success stroke-[3]" />
                                ) : (
                                  <Copy size={12} className="text-deep-navy" />
                                )}
                              </button>
                              {/* Mock Pay button */}
                              <button
                                onClick={() => handleMockPay(reg.id)}
                                disabled={isProcessing}
                                className="px-2 py-1 text-[10px] font-bold border-2 border-deep-navy bg-mint text-deep-navy rounded shadow-[1px_1px_0px_0px_#1B1F3B] hover:-translate-y-0.5 active:translate-y-0 cursor-pointer disabled:opacity-40"
                              >
                                Mock Pay
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleGenerateLink(reg)}
                              disabled={isLinkGen}
                              className="px-3 py-1.5 text-xs font-bold border-2 border-deep-navy bg-yellow text-deep-navy rounded-xl shadow-[2px_2px_0px_0px_#1B1F3B] hover:-translate-y-0.5 active:translate-y-0 cursor-pointer disabled:opacity-40 inline-flex items-center gap-1"
                            >
                              <CreditCard size={12} />
                              {isLinkGen ? 'Generating...' : 'Generate Link'}
                            </button>
                          )}
                        </td>
                        <td className="px-4 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {reg.status !== 'confirmed' && (
                              <button
                                onClick={() => handleUpdateStatus(reg.id, 'confirmed')}
                                disabled={isProcessing}
                                className="p-1.5 border-2 border-deep-navy bg-white hover:bg-mint/20 rounded-xl text-deep-navy shadow-[2px_2px_0px_0px_#1B1F3B] hover:-translate-y-0.5 active:translate-y-0 cursor-pointer disabled:opacity-40"
                                title="Confirm Registration Manually"
                              >
                                <UserCheck size={14} className="text-success" />
                              </button>
                            )}
                            {reg.status !== 'cancelled' && (
                              <button
                                onClick={() => handleUpdateStatus(reg.id, 'cancelled')}
                                disabled={isProcessing}
                                className="p-1.5 border-2 border-deep-navy bg-white hover:bg-coral/20 rounded-xl text-deep-navy shadow-[2px_2px_0px_0px_#1B1F3B] hover:-translate-y-0.5 active:translate-y-0 cursor-pointer disabled:opacity-40"
                                title="Cancel Registration"
                              >
                                <XOctagon size={14} className="text-coral" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </NeoCard>
    </div>
  );
};
export default RegistrationsListClient;
