"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Calendar, Brain, Users2, Sparkles, Filter, RefreshCw, ChevronRight } from 'lucide-react';
import Navbar from '@/components/Layout/Navbar';
import Footer from '@/components/Layout/Footer';
import { NeoCard } from '@/components/UI/NeoCard';
import { NeoButton } from '@/components/UI/NeoButton';
import { Workshop } from '@/data/workshops';

export default function WorkshopsCatalog({
  workshops,
  registeredBatches = {},
}: {
  workshops: Workshop[];
  registeredBatches?: Record<string, string>;
}) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string[]>([]);

  // Unique categories, difficulties, statuses for reference
  const difficulties = ['Beginner', 'Intermediate', 'Advanced'];
  const statuses = ['Live', 'Upcoming', 'Completed'];
  const categories = ['Frontend', 'Backend', 'AI', 'Career', 'Dev Tools', 'Portfolio'];

  // Toggle handlers
  const handleToggleDiff = (diff: string) => {
    setSelectedDifficulty(prev =>
      prev.includes(diff) ? prev.filter(d => d !== diff) : [...prev, diff]
    );
  };

  const handleToggleStatus = (status: string) => {
    setSelectedStatus(prev =>
      prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
    );
  };

  const handleToggleCat = (cat: string) => {
    setSelectedCategory(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedDifficulty([]);
    setSelectedStatus([]);
    setSelectedCategory([]);
  };

  // Filtered Workshops (auto-memoized by the React Compiler)
  const filteredWorkshops = workshops.filter(w => {
    // Search query filter
    const matchesSearch = w.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          w.description.toLowerCase().includes(searchQuery.toLowerCase());

    // Difficulty filter
    const matchesDiff = selectedDifficulty.length === 0 || selectedDifficulty.includes(w.difficulty);

    // Status filter
    const matchesStatus = selectedStatus.length === 0 || selectedStatus.includes(w.status);

    // Category filter
    const matchesCat = selectedCategory.length === 0 || selectedCategory.includes(w.category);

    return matchesSearch && matchesDiff && matchesStatus && matchesCat;
  });

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-bg-cream bg-grid-pattern pb-20">
        {/* Hero Section */}
        <section className="bg-white border-b-4 border-deep-navy py-12 md:py-20 text-center relative overflow-hidden">
          <div className="max-w-4xl mx-auto px-4 md:px-8 space-y-4 relative z-10">
            <div className="inline-flex items-center gap-1.5 border-2 border-deep-navy bg-yellow px-4 py-1.5 rounded-full font-display font-bold text-sm text-deep-navy shadow-[2px_2px_0px_0px_#1B1F3B] uppercase">
              <Sparkles className="w-4 h-4 text-deep-navy" />
              <span>CATALOG</span>
            </div>
            <h1 className="font-display font-black text-4xl md:text-6xl text-deep-navy leading-none">
              Live Practical Workshops
            </h1>
            <p className="font-sans font-bold text-base md:text-lg text-deep-navy/70 uppercase">
              Browse all available and upcoming batches.
            </p>
          </div>
        </section>

        {/* Filter & Listing Layout */}
        <div className="max-w-7xl mx-auto px-4 md:px-8 mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left Panel: Sidebar Filters */}
          <aside className="lg:col-span-3 space-y-6">
            <NeoCard variant="white" borderSize="normal" shadowSize="normal" className="p-6 text-left space-y-6">
              <div className="flex items-center justify-between border-b-2 border-deep-navy pb-3">
                <h3 className="font-display font-black text-lg text-deep-navy flex items-center gap-2">
                  <Filter size={18} />
                  <span>Filters</span>
                </h3>
                <button
                  onClick={handleResetFilters}
                  className="font-sans font-bold text-[10px] uppercase text-primary-orange hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw size={10} />
                  Clear All
                </button>
              </div>

              {/* Difficulty Section */}
              <div className="space-y-3">
                <h4 className="font-display font-bold text-sm uppercase text-deep-navy/60">Difficulty</h4>
                <div className="space-y-2">
                  {difficulties.map(diff => (
                    <label key={diff} className="flex items-center gap-2.5 font-sans font-bold text-sm text-deep-navy cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={selectedDifficulty.includes(diff)}
                        onChange={() => handleToggleDiff(diff)}
                        className="w-4 h-4 accent-primary-orange border-2 border-deep-navy rounded"
                      />
                      <span>{diff}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Status Section */}
              <div className="space-y-3 border-t-2 border-deep-navy/10 pt-4">
                <h4 className="font-display font-bold text-sm uppercase text-deep-navy/60">Status</h4>
                <div className="space-y-2">
                  {statuses.map(stat => (
                    <label key={stat} className="flex items-center gap-2.5 font-sans font-bold text-sm text-deep-navy cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={selectedStatus.includes(stat)}
                        onChange={() => handleToggleStatus(stat)}
                        className="w-4 h-4 accent-primary-orange border-2 border-deep-navy rounded"
                      />
                      <span>{stat}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Category Section */}
              <div className="space-y-3 border-t-2 border-deep-navy/10 pt-4">
                <h4 className="font-display font-bold text-sm uppercase text-deep-navy/60">Category</h4>
                <div className="space-y-2">
                  {categories.map(cat => (
                    <label key={cat} className="flex items-center gap-2.5 font-sans font-bold text-sm text-deep-navy cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={selectedCategory.includes(cat)}
                        onChange={() => handleToggleCat(cat)}
                        className="w-4 h-4 accent-primary-orange border-2 border-deep-navy rounded"
                      />
                      <span>{cat}</span>
                    </label>
                  ))}
                </div>
              </div>
            </NeoCard>
          </aside>

          {/* Right Panel: Search Bar and Grid */}
          <div className="lg:col-span-9 space-y-8">
            {/* Search Input Box */}
            <div className="relative">
              <Search className="absolute left-4 top-3.5 w-5 h-5 text-deep-navy/40" />
              <input
                type="text"
                placeholder="Search workshops by title or details..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-3 border-deep-navy rounded-2xl bg-white font-semibold text-sm focus:outline-none shadow-neo-inset"
              />
            </div>

            {/* Grid List */}
            {filteredWorkshops.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                {filteredWorkshops.map((shop, i) => {
                  const colors = ['yellow', 'sky', 'mint', 'coral'];
                  const themeColor = colors[i % colors.length];
                  const regStatus = shop.batchId ? registeredBatches[shop.batchId] : undefined;

                  return (
                    <NeoCard
                      key={shop.slug}
                      variant="white"
                      borderSize="normal"
                      shadowSize="normal"
                      hoverEffect={true}
                      className="p-6 flex flex-col justify-between items-start gap-5 border-3 h-full"
                    >
                      {/* Thumbnail — only shown when a cover image is set */}
                      {shop.coverImage && (
                        <div className="w-full h-40 border-2 border-deep-navy rounded-xl overflow-hidden shadow-neo-inset">
                          <img
                            src={shop.coverImage}
                            alt={`${shop.title} thumbnail`}
                            loading="lazy"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}

                      {/* Top Row */}
                      <div className="w-full flex items-center justify-between">
                        <span className={`px-2.5 py-0.5 border-2 border-deep-navy bg-${themeColor} rounded-lg font-display font-black text-xs uppercase text-deep-navy`}>
                          {shop.category}
                        </span>
                        <span className={`px-2 py-0.5 border border-deep-navy rounded-md font-sans font-black text-[9px] uppercase ${
                          shop.status === 'Live' ? 'bg-success text-white' :
                          shop.status === 'Upcoming' ? 'bg-yellow text-deep-navy' : 'bg-deep-navy/10 text-deep-navy'
                        }`}>
                          {shop.status}
                        </span>
                      </div>

                      {/* Header details */}
                      <div className="space-y-2 flex-1">
                        <h3 className="font-display font-black text-2xl text-deep-navy leading-none">
                          {shop.title}
                        </h3>
                        <p className="font-sans font-semibold text-xs md:text-sm text-deep-navy/80 leading-relaxed line-clamp-3">
                          {shop.description}
                        </p>
                      </div>

                      {/* Specs details */}
                      <div className="w-full grid grid-cols-2 gap-3 border-y border-deep-navy/10 py-4 font-semibold text-[10px]">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={12} className="text-deep-navy/50" />
                          <div>
                            <span className="text-deep-navy/40 uppercase block leading-none">Date</span>
                            <span className="text-deep-navy text-xs font-display font-bold mt-1 block">{shop.date}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Brain size={12} className="text-deep-navy/50" />
                          <div>
                            <span className="text-deep-navy/40 uppercase block leading-none">Difficulty</span>
                            <span className="text-deep-navy text-xs font-display font-bold mt-1 block">{shop.difficulty}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Users2 size={12} className="text-deep-navy/50" />
                          <div>
                            <span className="text-deep-navy/40 uppercase block leading-none">Seats Limit</span>
                            <span className="text-deep-navy text-xs font-display font-bold mt-1 block">
                              {shop.status === 'Completed' ? 'Sold Out' : `${shop.remainingSeats} Seats`}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-black text-deep-navy">$</span>
                          <div>
                            <span className="text-deep-navy/40 uppercase block leading-none">Price</span>
                            <span className="text-deep-navy text-xs font-display font-bold mt-1 block">
                              {shop.price === 0 ? 'FREE' : `₹${shop.price}`}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Instructor block */}
                      <div className="w-full flex items-center justify-between text-[10px] font-bold text-deep-navy/60">
                        <span>Instructor: {shop.instructor}</span>
                        <span>{shop.duration} ({shop.sessions} sessions)</span>
                      </div>

                      {/* Buttons */}
                      <div className="w-full grid grid-cols-2 gap-3 pt-2">
                        {regStatus ? (
                          <NeoButton
                            variant="mint"
                            size="sm"
                            onClick={() => router.push('/dashboard')}
                          >
                            {regStatus === 'confirmed' ? 'Registered ✓' : 'Payment Pending'}
                          </NeoButton>
                        ) : (
                          <NeoButton
                            variant={shop.status === 'Completed' ? 'white' : 'orange'}
                            size="sm"
                            disabled={shop.status === 'Completed'}
                            onClick={() => router.push(`/workshops/${shop.slug}`)}
                          >
                            Register
                          </NeoButton>
                        )}
                        <NeoButton
                          variant="white"
                          size="sm"
                          onClick={() => router.push(`/workshops/${shop.slug}`)}
                        >
                          Details
                          <ChevronRight size={14} className="ml-1" />
                        </NeoButton>
                      </div>
                    </NeoCard>
                  );
                })}
              </div>
            ) : (
              /* Empty State */
              <NeoCard variant="white" borderSize="thick" shadowSize="large" className="p-12 text-center space-y-6">
                <div className="w-16 h-16 border-3 border-deep-navy bg-yellow rounded-2xl flex items-center justify-center shadow-neo mx-auto">
                  <span className="font-display font-black text-3xl">?</span>
                </div>
                <div className="space-y-2">
                  <h3 className="font-display font-black text-2xl text-deep-navy">No Workshops Found</h3>
                  <p className="font-sans font-bold text-sm text-deep-navy/60 max-w-sm mx-auto">
                    We couldn&apos;t find any workshops matching your search or filters. Try adjusting them.
                  </p>
                </div>
                <NeoButton variant="orange" size="sm" onClick={handleResetFilters}>
                  Reset All Filters
                </NeoButton>
              </NeoCard>
            )}
          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}
