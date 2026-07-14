"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  Layers, 
  Plus, 
  Eye, 
  EyeOff,
  AlertTriangle
} from 'lucide-react';
import { NeoButton } from '@/components/UI/NeoButton';
import { NeoCard } from '@/components/UI/NeoCard';
import { StatusBadge } from '@/components/UI/StatusBadge';
import { updateWorkshopPublishAction, deleteWorkshopAction } from '@/actions/workshops';

interface WorkshopItem {
  id: string;
  title: string;
  slug: string;
  category: string;
  difficulty: string;
  is_published: boolean;
  batch_count: number;
}

interface WorkshopsListClientProps {
  initialWorkshops: WorkshopItem[];
}

export const WorkshopsListClient: React.FC<WorkshopsListClientProps> = ({ initialWorkshops }) => {
  const [workshops, setWorkshops] = useState<WorkshopItem[]>(initialWorkshops);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [difficultyFilter, setDifficultyFilter] = useState('All');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const categories = ['All', 'Frontend', 'Backend', 'AI', 'Career', 'Dev Tools', 'Portfolio'];
  const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced'];

  // Handle publish toggle
  const handleTogglePublish = async (id: string, current: boolean) => {
    // Optimistic update
    setWorkshops(prev =>
      prev.map(w => (w.id === id ? { ...w, is_published: !current } : w))
    );

    const res = await updateWorkshopPublishAction(id, !current);
    if (!res.success) {
      alert(res.error || 'Failed to update publish state.');
      // Rollback
      setWorkshops(prev =>
        prev.map(w => (w.id === id ? { ...w, is_published: current } : w))
      );
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!deleteConfirmId) return;
    setIsDeleting(true);

    const res = await deleteWorkshopAction(deleteConfirmId);
    if (res.success) {
      setWorkshops(prev => prev.filter(w => w.id !== deleteConfirmId));
      setDeleteConfirmId(null);
    } else {
      alert(res.error || 'Failed to delete workshop.');
    }
    setIsDeleting(false);
  };

  // Filtered workshops
  const filteredWorkshops = workshops.filter((w) => {
    const matchesSearch = w.title.toLowerCase().includes(search.toLowerCase()) || 
                          w.slug.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || w.category === categoryFilter;
    const matchesDifficulty = difficultyFilter === 'All' || w.difficulty === difficultyFilter;
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  return (
    <div className="space-y-6">
      {/* Search & Filter Bar */}
      <NeoCard variant="white" borderSize="normal" shadowSize="none" className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-deep-navy/40" />
          </span>
          <input
            type="text"
            placeholder="Search workshops by title or slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 border-3 border-deep-navy rounded-xl bg-bg-cream font-semibold shadow-neo-inset focus:bg-white focus:outline-none text-deep-navy text-sm"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-deep-navy">
          {/* Category Filter */}
          <div className="flex items-center gap-1">
            <Filter size={14} className="text-deep-navy/60" />
            <span>Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="border-2 border-deep-navy bg-white rounded-lg px-2.5 py-1.5 focus:outline-none cursor-pointer"
            >
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Difficulty Filter */}
          <div className="flex items-center gap-1">
            <span>Difficulty:</span>
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="border-2 border-deep-navy bg-white rounded-lg px-2.5 py-1.5 focus:outline-none cursor-pointer"
            >
              {difficulties.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>
      </NeoCard>

      {/* Workshop Table */}
      <NeoCard variant="white" borderSize="normal" shadowSize="normal" className="p-6">
        <div className="overflow-x-auto -mx-6">
          <div className="inline-block min-w-full align-middle px-6">
            <table className="min-w-full divide-y-3 divide-deep-navy">
              <thead>
                <tr className="bg-yellow border-b-3 border-deep-navy text-left font-display font-black text-xs uppercase text-deep-navy">
                  <th className="px-4 py-3">Cover / Title</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Difficulty</th>
                  <th className="px-4 py-3 text-center">Active Batches</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-deep-navy/10 text-sm font-semibold">
                {filteredWorkshops.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-deep-navy/40 font-bold">
                      No workshops match the active search/filters.
                    </td>
                  </tr>
                ) : (
                  filteredWorkshops.map((w) => (
                    <tr key={w.id} className="hover:bg-bg-cream/50 transition-colors">
                      <td className="px-4 py-4 text-left">
                        <div>
                          <p className="font-display font-black text-base text-deep-navy">{w.title}</p>
                          <p className="text-xs text-deep-navy/50 font-mono mt-0.5">/{w.slug}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-left">
                        <span className="px-2 py-0.5 border border-deep-navy bg-yellow/10 rounded font-bold text-xs uppercase text-deep-navy">
                          {w.category}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-left">
                        <span className="px-2 py-0.5 border border-deep-navy/20 bg-bg-cream rounded font-bold text-xs">
                          {w.difficulty}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center font-mono font-bold text-base">
                        {w.batch_count}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <button
                          onClick={() => handleTogglePublish(w.id, w.is_published)}
                          className="cursor-pointer focus:outline-none transition-transform hover:scale-105 active:scale-95"
                          title="Toggle Publication Status"
                        >
                          {w.is_published ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-mint text-deep-navy border-2 border-deep-navy rounded-lg text-xs font-bold shadow-[1px_1px_0px_0px_#1B1F3B]">
                              <Eye size={12} /> Published
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-coral/10 text-coral border-2 border-deep-navy/35 rounded-lg text-xs font-bold">
                              <EyeOff size={12} /> Draft
                            </span>
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-2.5">
                          <Link href={`/admin/workshops/${w.id}/batches`}>
                            <NeoButton variant="mint" size="sm" className="px-3 py-1.5 text-xs" title="Manage Batches">
                              <Layers size={14} /> Batches
                            </NeoButton>
                          </Link>
                          <Link href={`/admin/workshops/${w.id}/edit`}>
                            <button className="p-2 border-2 border-deep-navy bg-white hover:bg-bg-cream rounded-xl shadow-[2px_2px_0px_0px_#1B1F3B] hover:-translate-y-0.5 active:translate-y-0 cursor-pointer">
                              <Edit3 size={14} className="text-deep-navy" />
                            </button>
                          </Link>
                          <button
                            onClick={() => setDeleteConfirmId(w.id)}
                            className="p-2 border-2 border-deep-navy bg-coral text-white rounded-xl shadow-[2px_2px_0px_0px_#1B1F3B] hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </NeoCard>

      {/* Neo Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-deep-navy/70 backdrop-blur-sm flex items-center justify-center p-4">
          <NeoCard variant="white" borderSize="thick" shadowSize="large" className="p-6 max-w-sm w-full space-y-6 text-center">
            <div className="w-16 h-16 bg-coral/10 border-3 border-coral rounded-2xl flex items-center justify-center mx-auto shadow-neo">
              <AlertTriangle className="w-8 h-8 text-coral" />
            </div>
            <div className="space-y-2">
              <h3 className="font-display font-black text-xl text-deep-navy leading-none uppercase">
                Danger Zone
              </h3>
              <p className="text-sm font-semibold text-deep-navy/60">
                Are you absolutely sure you want to delete this workshop? This will permanently delete all associated batches, sessions, registrations, and payment logs. This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-4">
              <NeoButton variant="white" className="flex-1 text-deep-navy" size="sm" onClick={() => setDeleteConfirmId(null)} disabled={isDeleting}>
                Cancel
              </NeoButton>
              <NeoButton variant="coral" className="flex-1" size="sm" onClick={handleDelete} disabled={isDeleting}>
                {isDeleting ? 'Deleting...' : 'Yes, Delete'}
              </NeoButton>
            </div>
          </NeoCard>
        </div>
      )}
    </div>
  );
};
export default WorkshopsListClient;
