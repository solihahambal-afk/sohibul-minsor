import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Plane, FileText, GraduationCap, Briefcase, Compass, Languages, Ticket, Star } from 'lucide-react';
import PageHero from '../components/PageHero';
import { apiClient, hasApiConfig } from '../lib/apiClient';

interface Service {
  id: string;
  title: string;
  iconImage: string;
  shortDescription: string;
}

const DEFAULT_SERVICES = [
  {
    title: "Travel & Immigration Consultation",
    icon: <Compass size={32} />,
    desc: "Comprehensive guidance on travel applications, interview preparation, and profiling to maximize your chances of approval."
  },
  {
    title: "Study Abroad Programs",
    icon: <GraduationCap size={32} />,
    desc: "Securing university admissions globally and navigating the student immigration process for UK, USA, Canada, Europe, and Asia."
  },
  {
    title: "Work & Employment Visas",
    icon: <Briefcase size={32} />,
    desc: "Assistance with employment documentation, employer sponsorships, and work permit applications."
  },
  {
    title: "Tourist & Visit Packages",
    icon: <Plane size={32} />,
    desc: "Hassle-free processing of tourist and visit applications for meeting family and friends abroad."
  },
  {
    title: "Flight Reservation",
    icon: <Ticket size={32} />,
    desc: "Affordable and flexible flight bookings, itinerary planning, and reservation assistance across major global airlines."
  },
  {
    title: "Documentation Support",
    icon: <FileText size={32} />,
    desc: "Expert review and organization of required travel and immigration documents to prevent application errors."
  },
  {
    title: "Documents Translation",
    icon: <Languages size={32} />,
    desc: "Certified translation of official documents (birth certificates, transcripts, legal papers) for international use."
  }
];

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = apiClient.from('services').select('*').eq('status', 'Active').order('displayOrder', { ascending: true })
      .subscribe(({ data, error }) => {
        setIsLoading(false);
        if (error) {
          console.error('Error fetching data:', error);
        } else if (data) {
          setServices(data);
        }
      });
    return () => { if (unsubscribe) unsubscribe(); };
  }, []);

  const displayServices = services.length > 0 ? services.map(s => ({
    title: s.title,
    icon: s.iconImage ? <img src={s.iconImage} alt={s.title} className="w-8 h-8 object-cover rounded" /> : <Briefcase size={32} />,
    desc: s.shortDescription
  })) : DEFAULT_SERVICES;

  return (
    <div className="w-full bg-gray-50 pb-24">
      {/* Page Header */}
      <PageHero 
        title="Our Services" 
        subtitle="Professional, efficient, and tailored solutions" 
      />

      {/* Services Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayServices.map((service, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:shadow-primary-900/5 transition-all group"
            >
              <div className="w-16 h-16 rounded-2xl bg-primary-50 text-primary-900 flex items-center justify-center mb-6 group-hover:bg-gold-500 transition-colors">
                {service.icon}
              </div>
              <h3 className="text-xl font-bold text-primary-900 mb-4">{service.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-6">
                {service.desc}
              </p>
              <Link to="/contact" className="text-gold-600 font-semibold text-sm hover:text-primary-900 transition-colors">
                Inquire Now &rarr;
              </Link>
            </motion.div>
          ))}
          
          {/* Hajj Feature Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
            className="bg-primary-900 p-8 rounded-2xl shadow-sm md:col-span-2 lg:col-span-1 text-white flex flex-col justify-between"
          >
            <div>
              <div className="w-16 h-16 rounded-2xl bg-gold-500/20 text-gold-500 flex items-center justify-center mb-6">
                <Star size={32} />
              </div>
              <h3 className="text-xl font-bold mb-4">Hajj & Umrah</h3>
              <p className="text-gray-300 text-sm leading-relaxed mb-6">
                Specialized pilgrimage packages with meticulous arrangements for flights, accommodations, and guided holy tours.
              </p>
            </div>
            <Link to="/hajj-umrah" className="inline-block bg-gold-500 text-primary-900 text-center py-3 rounded-lg font-bold text-sm hover:bg-gold-400 transition-colors">
              View Packages
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
