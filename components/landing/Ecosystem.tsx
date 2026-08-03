"use client";

import { useState, useEffect, useRef } from 'react';
import { TrendingUp, Users, Building2, Globe, Shield, Activity } from 'lucide-react';

export default function Ecosystem() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const carouselRef = useRef<HTMLDivElement>(null);

  const ecosystems = [
    {
      id: 'patients',
      title: 'Patient Ecosystem',
      description: 'Patients navigate their health journey with personalized care pathways, trusted relationships, and seamless coordination across providers.',
      icon: Users,
      color: 'from-blue-500 to-cyan-600',
      features: [
        'Personalized Care Plans',
        'Care Coordination',
        'Provider Networks',
        'Health Records',
        'Medication Management',
        'Appointment Scheduling',
        'Health Tracking',
        'Education Resources',
      ],
      stats: '500M+ patients',
      growth: '+12% annually',
    },
    {
      id: 'providers',
      title: 'Provider Ecosystem',
      description: 'Healthcare professionals collaborate through standardized protocols, shared knowledge, and coordinated care delivery for optimal patient outcomes.',
      icon: Building2,
      color: 'from-indigo-500 to-purple-600',
      features: [
        'Clinical Protocols',
        'Research Integration',
        'Quality Assurance',
        'Professional Development',
        'Telemedicine',
        'Collaboration Tools',
        'Audit Systems',
        'Continuing Education',
      ],
      stats: '2.5M+ clinicians',
      growth: '+8% annually',
    },
    {
      id: 'systems',
      title: 'System Ecosystem',
      description: 'Enterprise and institutional healthcare systems integrate clinical intelligence, operational workflows, and analytics to streamline care delivery and improve outcomes.',
      icon: Activity,
      color: 'from-emerald-500 to-teal-600',
      features: [
        'HMIS Integration',
        'EMR Interoperability',
        'Billing & Revenue',
        'Compliance & Auditing',
        'Infrastructure Management',
        'Patient Portals',
        'Analytics & Reporting',
        'Mobile & Telemedicine',
      ],
      stats: '500+ hospitals',
      growth: '+15% annually',
    },
    {
      id: 'governments',
      title: 'Government Ecosystem',
      description: 'Public health authorities leverage clinical intelligence for national health strategies, disease surveillance, population health, and healthcare policy implementation.',
      icon: Shield,
      color: 'from-amber-500 to-orange-600',
      features: [
        'Public Health',
        'Disease Surveillance',
        'Health Policy',
        'Population Health',
        'National Standards',
        'Regulatory Compliance',
        'Health Metrics',
        'Research Integration',
      ],
      stats: '150+ countries',
      growth: '+5% annually',
    },
    {
      id: 'research',
      title: 'Research Ecosystem',
      description: 'Clinical research generates evidence, drives innovation, and advances medical knowledge through rigorous studies and data sharing.',
      icon: TrendingUp,
      color: 'from-rose-500 to-pink-600',
      features: [
        'Clinical Trials',
        'Evidence Synthesis',
        'Methodology',
        'Data Analytics',
        'Knowledge Graphs',
        'AI Research',
        'Publication',
        'Training Programs',
      ],
      stats: '2M+ studies annually',
      growth: '+20% annually',
    },
    {
      id: 'education',
      title: 'Education Ecosystem',
      description: 'Medical education prepares professionals through simulation, cases, protocols, and continuous learning experiences across all healthcare disciplines.',
      icon: Building2,
      color: 'from-sky-500 to-cyan-600',
      features: [
        'Simulation',
        'Case Studies',
        'Protocols',
        'Clinical Practice',
        'Competency',
        'Medical Ethics',
        'Professional Development',
        'CPD Programs',
      ],
      stats: '10M+ students & professionals',
      growth: '+10% annually',
    },
  ];

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % ecosystems.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, ecosystems.length]);

  const handleDotClick = (index: number) => {
    setActiveIndex(index);
    setIsAutoPlaying(false);
  };

  const handleMouseEnter = () => {
    setIsAutoPlaying(false);
  };

  const handleMouseLeave = () => {
    setIsAutoPlaying(true);
  };

  return (
    <section id="ecosystem" className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            The Healthcare Ecosystem
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            AMEXAN seamlessly connects every stakeholder in healthcare through intelligent ecosystems that collaborate, coordinate, and evolve together.
          </p>
        </div>

        {/* Desktop View */}
        <div
          ref={carouselRef}
          className="hidden md:block relative overflow-hidden rounded-2xl bg-white shadow-2xl"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="relative h-96 md:h-120">
            {ecosystems.map((ecosystem, index) => {
              const Icon = ecosystem.icon;
              return (
                <div
                  key={ecosystem.id}
                  className={`absolute inset-0 transition-all duration-700 ease-in-out ${activeIndex === index ? 'opacity-100 z-10 transform translate-x-0' : 'opacity-0 z-0 transform translate-x-8'}`}
                >
                  <div className="flex flex-col md:flex-row items-center h-full p-8 md:p-12">
                    <div className="flex-1 md:w-1/2">
                      <div className={`inline-flex items-center space-x-3 px-4 py-2 rounded-full bg-gradient-to-r ${ecosystem.color} text-white mb-6`}>
                        <Icon className="w-6 h-6" />
                        <span className="font-semibold">Ecosystem</span>
                      </div>
                      <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                        {ecosystem.title}
                      </h3>
                      <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                        {ecosystem.description}
                      </p>
                      <div className="space-y-3 mb-6">
                        {ecosystem.features.map((feature) => (
                          <div key={feature} className="flex items-center space-x-3">
                            <div className="w-2 h-2 bg-green-500 rounded-full" />
                            <span className="text-sm text-gray-700">{feature}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center space-x-8">
                        <div>
                          <div className="text-2xl font-bold text-gray-900">{ecosystem.stats}</div>
                          <div className="text-sm text-gray-500">Population</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-green-600">{ecosystem.growth}</div>
                          <div className="text-sm text-gray-500">Growth Rate</div>
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 md:w-1/2 relative">
                      <div className="absolute inset-0 bg-gradient-to-r ${ecosystem.color} opacity-10 rounded-2xl" />
                      <div className="relative h-64 md:h-80">
                        {/* Visual representation of ecosystem */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-32 h-32 rounded-full bg-gradient-to-br ${ecosystem.color} opacity-20 animate-pulse" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Icon className="w-16 h-16 text-white/50" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mobile View */}
        <div className="md:hidden space-y-4">
          {ecosystems.map((ecosystem, index) => {
            const Icon = ecosystem.icon;
            return (
              <div
                key={ecosystem.id}
                className={`bg-white rounded-lg shadow-md p-6 cursor-pointer transition-all duration-300 ${activeIndex === index ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-lg'}`}
                onClick={() => handleDotClick(index)}
              >
                <div className="flex items-center space-x-3 mb-3">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${ecosystem.color} flex items-center justify-center`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{ecosystem.title}</h4>
                    <p className="text-sm text-gray-600">{ecosystem.stats}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Dots Navigation */}
        <div className="flex justify-center mt-8 space-x-2">
          {ecosystems.map((_, index) => (
            <button
              key={index}
              onClick={() => handleDotClick(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${activeIndex === index ? 'bg-blue-600 scale-125' : 'bg-gray-300 hover:bg-gray-400'}`}
              aria-label={`Go to ecosystem ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}