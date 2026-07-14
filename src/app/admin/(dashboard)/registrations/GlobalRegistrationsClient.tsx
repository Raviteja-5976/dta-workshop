"use client";

import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  FileSpreadsheet, 
  Layers
} from 'lucide-react';
import { NeoCard } from '@/components/UI/NeoCard';
import { StatusBadge } from '@/components/UI/StatusBadge';
import { NeoButton } from '@/components/UI/NeoButton';

interface GlobalRegItem {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  status: string;
  confirmation_code: string | null;
  registered_at: string;
  workshop_title: string;
  batch_label: string;
  payment_status: string;
}

interface GlobalRegistrationsClientProps {
  initialRegistrations: GlobalRegItem[];
}

export const GlobalRegistrationsClient: React.FC<GlobalRegistrationsClientProps> = ({
  initialRegistrations
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [paymentFilter, setPaymentFilter] = useState('All');
  const [workshopFilter, setWorkshopFilter] = useState('All');

  // Unique list of workshops for filtering
  const workshopsList = Array.from(new Set(initialRegistrations.map(r => r.workshop_title)));

  // Filter registrations
  const filteredRegs = initialRegistrations.filter((r) => {
    const matchesSearch = 
      r.full_name.toLowerCase().includes(search.toLowerCase()) || 
      r.email.toLowerCase().includes(search.toLowerCase()) ||
      (r.confirmation_code && r.confirmation_code.toLowerCase().includes(search.toLowerCase()));
    
    const matchesStatus = statusFilter === 'All' || r.status === statusFilter;
    const matchesPayment = paymentFilter === 'All' || r.payment_status === paymentFilter;
    const matchesWorkshop = workshopFilter === 'All' || r.workshop_title === workshopFilter;

    return matchesSearch && matchesStatus && matchesPayment && matchesWorkshop;
  });

  const exportAllToCSV = () => {
    const headers = 'Name,Email,Phone,Workshop,Batch,Registration Status,Payment Status,Confirmation Code,Registered At\n';
    const rows = filteredRegs.map(r => 
      `"${r.full_name}","${r.email}","${r.phone || ''}","${r.workshop_title}","${r.batch_label}","${r.status}","${r.payment_status}","${r.confirmation_code || ''}","${new Date(r.registered_at).toLocaleDateString()}"`
    ).join('\n');
    
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'all_dta_registrations.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Filters Bar */}
      <NeoCard variant="white" borderSize="normal" shadowSize="none" className="p-4 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-deep-navy/40" />
          </span>
          <input
            type="text"
            placeholder="Search by student name, email, confirmation code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 border-3 border-deep-navy rounded-xl bg-bg-cream font-semibold shadow-neo-inset focus:bg-white focus:outline-none text-deep-navy text-sm"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-deep-navy">
          {/* Workshop Filter */}
          <div className="flex items-center gap-1">
            <Filter size={14} className="text-deep-navy/60" />
            <span>Workshop:</span>
            <select
              value={workshopFilter}
              onChange={(e) => setWorkshopFilter(e.target.value)}
              className="border-2 border-deep-navy bg-white rounded-lg px-2.5 py-1.5 focus:outline-none cursor-pointer max-w-xs"
            >
              <option value="All">All Workshops</option>
              {workshopsList.map(w => <option key={w} value={w}>{w}</option>)}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1">
            <span>Reg Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border-2 border-deep-navy bg-white rounded-lg px-2.5 py-1.5 focus:outline-none cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="waitlisted">Waitlisted</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Payment Status Filter */}
          <div className="flex items-center gap-1">
            <span>Payment Status:</span>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="border-2 border-deep-navy bg-white rounded-lg px-2.5 py-1.5 focus:outline-none cursor-pointer"
            >
              <option value="All">All Payments</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="unpaid">Unpaid</option>
            </select>
          </div>

          <NeoButton variant="mint" size="sm" onClick={exportAllToCSV} disabled={filteredRegs.length === 0} className="py-2 px-3 text-xs">
            <FileSpreadsheet size={14} /> Export CSV
          </NeoButton>
        </div>
      </NeoCard>

      {/* Global Table */}
      <NeoCard variant="white" borderSize="normal" shadowSize="normal" className="p-6">
        <div className="overflow-x-auto -mx-6">
          <div className="inline-block min-w-full align-middle px-6">
            <table className="min-w-full divide-y-3 divide-deep-navy">
              <thead>
                <tr className="bg-yellow border-b-3 border-deep-navy text-left font-display font-black text-xs uppercase text-deep-navy">
                  <th className="px-4 py-3">Student</th>
                  <th className="px-4 py-3">Workshop & Batch</th>
                  <th className="px-4 py-3">Registered At</th>
                  <th className="px-4 py-3">Confirmation</th>
                  <th className="px-4 py-3 text-center">Reg Status</th>
                  <th className="px-4 py-3 text-center">Payment Status</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-deep-navy/10 text-sm font-semibold">
                {filteredRegs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-deep-navy/40 font-bold">
                      No registrations matched the active parameters.
                    </td>
                  </tr>
                ) : (
                  filteredRegs.map((reg) => (
                    <tr key={reg.id} className="hover:bg-bg-cream/50 transition-colors">
                      <td className="px-4 py-3.5 text-left">
                        <p className="font-bold text-deep-navy capitalize">{reg.full_name}</p>
                        <p className="text-xs text-deep-navy/50">{reg.email}</p>
                        {reg.phone && <p className="text-xs text-deep-navy/50">{reg.phone}</p>}
                      </td>
                      <td className="px-4 py-3.5 text-left">
                        <p className="font-bold truncate max-w-xs">{reg.workshop_title}</p>
                        <span className="text-xs px-2 py-0.5 border border-deep-navy/20 bg-bg-cream rounded font-mono font-bold">
                          {reg.batch_label}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-left text-xs text-deep-navy/60 font-mono">
                        {new Date(reg.registered_at).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="px-4 py-3.5 text-left font-mono text-xs">
                        {reg.confirmation_code ? (
                          <span className="bg-bg-cream border border-deep-navy/20 px-2 py-0.5 rounded text-deep-navy">
                            {reg.confirmation_code}
                          </span>
                        ) : (
                          <span className="text-deep-navy/30 italic">Not issued</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <StatusBadge status={reg.status} />
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <StatusBadge status={reg.payment_status} />
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
export default GlobalRegistrationsClient;
