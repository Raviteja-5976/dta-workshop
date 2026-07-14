import React from 'react';
import Navbar from '@/components/Layout/Navbar';
import Hero from '@/components/Sections/Hero';
import Statistics from '@/components/Sections/Statistics';
import Philosophy from '@/components/Sections/Philosophy';
import WorkshopFeatures from '@/components/Sections/WorkshopFeatures';
import FeaturedWorkshop from '@/components/Sections/FeaturedWorkshop';
import LatestWorkshops from '@/components/Sections/LatestWorkshops';
import UpcomingWorkshops from '@/components/Sections/UpcomingWorkshops';
import SuggestWorkshop from '@/components/Sections/SuggestWorkshop';
import FAQ from '@/components/Sections/FAQ';
import CTA from '@/components/Sections/CTA';
import Footer from '@/components/Layout/Footer';
import { getWorkshops } from '@/lib/data/workshops';

export default async function Home() {
  const workshops = await getWorkshops();

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <Hero />
        <Statistics />
        <Philosophy />
        <WorkshopFeatures />
        <FeaturedWorkshop workshops={workshops} />
        <LatestWorkshops workshops={workshops} />
        <UpcomingWorkshops workshops={workshops} />
        <SuggestWorkshop />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
