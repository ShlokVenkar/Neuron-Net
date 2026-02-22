import React from 'react';
import { HeroModern } from '@/components/ui/hero-modern';
import Header from '../components/Header';
import Footer from '../components/Footer';

const HeroDemo = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <HeroModern 
        title="NEURON NET"
        subtitle="Decentralized GPU compute power on Monad blockchain. Rent high-performance GPUs using MON tokens. Access enterprise-grade compute resources instantly."
        eyebrow="Powered by Monad Blockchain"
        ctaLabel="Get Started"
        ctaHref="/signup"
        secondaryCtaLabel="Explore GPUs"
        secondaryCtaHref="/login"
      />
      <Footer />
    </div>
  );
};

export default HeroDemo;
