"use client";

import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  ExternalLink, 
  Copy, 
  Check 
} from 'lucide-react';
import { NeoCard } from '@/components/UI/NeoCard';
import { StatusBadge } from '@/components/UI/StatusBadge';

interface PaymentItem {
  id: string;
  amount: number;
  currency: string;
  status: string;
  provider: string | null;
  provider_order_id: string | null;
  provider_payment_id: string | null;
  payment_method: string | null;
  receipt_url: string | null;
  paid_at: string | null;
  created_at: string;
  full_name: string;
  email: string;
  workshop_title: string;
  batch_label: string;
}

interface PaymentsListClientProps {
  initialPayments: PaymentItem[];
}

export const PaymentsListClient: React.FC<PaymentsListClientProps> = ({
  initialPayments
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filter payments
  const filteredPayments = initialPayments.filter((p) => {
    const matchesSearch = 
      p.full_name.toLowerCase().includes(search.toLowerCase()) || 
      p.email.toLowerCase().includes(search.toLowerCase()) ||
      (p.provider_order_id && p.provider_order_id.toLowerCase().includes(search.toLowerCase())) ||
      (p.provider_payment_id && p.provider_payment_id.toLowerCase().includes(search.toLowerCase()));
    
    const matchesStatus = statusFilter === 'All' || p.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Filters Bar */}
      <NeoCard variant="white" borderSize="normal" shadowSize="none" className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-deep-navy/40" />
          </span>
          <input
            type="text"
            placeholder="Search by student, order ID, payment ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 border-3 border-deep-navy rounded-xl bg-bg-cream font-semibold shadow-neo-inset focus:bg-white focus:outline-none text-deep-navy text-sm"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 text-xs font-bold text-deep-navy">
          <Filter size={14} className="text-deep-navy/60" />
          <span>Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border-2 border-deep-navy bg-white rounded-lg px-2.5 py-1.5 focus:outline-none cursor-pointer"
          >
            <option value="All">All Transactions</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>
      </NeoCard>

      {/* Payments Table */}
      <NeoCard variant="white" borderSize="normal" shadowSize="normal" className="p-6">
        <div className="overflow-x-auto -mx-6">
          <div className="inline-block min-w-full align-middle px-6">
            <table className="min-w-full divide-y-3 divide-deep-navy">
              <thead>
                <tr className="bg-yellow border-b-3 border-deep-navy text-left font-display font-black text-xs uppercase text-deep-navy">
                  <th className="px-4 py-3">Student</th>
                  <th className="px-4 py-3">Workshop & Batch</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3">Gateway Details</th>
                  <th className="px-4 py-3 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-deep-navy/10 text-sm font-semibold">
                {filteredPayments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-deep-navy/40 font-bold">
                      No payments matched the active search/filters.
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map((p) => (
                    <tr key={p.id} className="hover:bg-bg-cream/50 transition-colors">
                      <td className="px-4 py-3.5 text-left">
                        <p className="font-bold text-deep-navy capitalize">{p.full_name}</p>
                        <p className="text-xs text-deep-navy/50">{p.email}</p>
                      </td>
                      <td className="px-4 py-3.5 text-left">
                        <p className="font-bold truncate max-w-xs">{p.workshop_title}</p>
                        <span className="text-xs px-2 py-0.5 border border-deep-navy/20 bg-bg-cream rounded font-mono font-bold">
                          {p.batch_label}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-left font-display font-black text-base text-deep-navy">
                        ₹{p.amount}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <StatusBadge status={p.status} />
                      </td>
                      <td className="px-4 py-3.5 text-left text-xs space-y-1">
                        {p.provider && (
                          <p className="font-bold uppercase text-deep-navy/60">
                            {p.provider} ({p.payment_method || 'UPI'})
                          </p>
                        )}
                        {p.provider_order_id && (
                          <div className="flex items-center gap-1 font-mono text-[10px] text-deep-navy/70">
                            <span>Link: {p.provider_order_id}</span>
                            <button
                              onClick={() => handleCopy(p.provider_order_id!, p.id + '-link')}
                              className="p-0.5 hover:bg-bg-cream rounded"
                            >
                              {copiedId === p.id + '-link' ? <Check size={10} className="text-success stroke-[3]" /> : <Copy size={10} />}
                            </button>
                          </div>
                        )}
                        {p.provider_payment_id && (
                          <div className="flex items-center gap-1 font-mono text-[10px] text-deep-navy/70">
                            <span>Txn: {p.provider_payment_id}</span>
                            <button
                              onClick={() => handleCopy(p.provider_payment_id!, p.id + '-pay')}
                              className="p-0.5 hover:bg-bg-cream rounded"
                            >
                              {copiedId === p.id + '-pay' ? <Check size={10} className="text-success stroke-[3]" /> : <Copy size={10} />}
                            </button>
                          </div>
                        )}
                        {p.receipt_url && p.status !== 'paid' && (
                          <a
                            href={p.receipt_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-primary-orange hover:underline font-bold font-mono text-[10px] mt-1"
                          >
                            Checkout URL <ExternalLink size={10} />
                          </a>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono text-xs text-deep-navy/60">
                        {p.paid_at ? (
                          <div>
                            <p className="font-bold text-deep-navy">Paid On</p>
                            <p>
                              {new Date(p.paid_at).toLocaleDateString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        ) : (
                          <div>
                            <p className="font-bold text-deep-navy/40">Created</p>
                            <p>
                              {new Date(p.created_at).toLocaleDateString('en-IN', {
                                day: '2-digit',
                                month: 'short'
                              })}
                            </p>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </NeoCard>
    </div>
  );
};
export default PaymentsListClient;
