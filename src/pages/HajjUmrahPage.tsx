import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Check, Star, Moon, Calendar, MapPin } from 'lucide-react';
import PageHero from '../components/PageHero';
import { apiClient, hasApiConfig } from '../lib/apiClient';

interface Package {
  id: string;
  name: string;
  featuredImage: string;
  type: 'Hajj' | 'Umrah';
  duration: string;
  price: number;
  departureDate: string;
  returnDate: string;
  availableSlots: number;
  shortDescription: string;
  fullDescription: string;
  status: 'Open' | 'Closed';
}

export default function HajjUmrahPage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = apiClient.from('hajj_umrah_packages').select('*').eq('status', 'Open')
      .subscribe(({ data, error }) => {
        setIsLoading(false);
        if (error) {
          console.error('Error fetching data:', error);
        } else if (data) {
          const sortedData = [...data].sort((a, b) => new Date(a.departureDate || 0).getTime() - new Date(b.departureDate || 0).getTime());
          setPackages(sortedData);
        }
      });
    return () => { if (unsubscribe) unsubscribe(); };
  }, []);

  return (
    <div className="w-full bg-white pb-24">
      {/* Page Header */}
      <PageHero 
        title="Hajj & Umrah Packages" 
        subtitle="Embark on a sacred journey with peace of mind" 
      />

      
      {/* Core Packages */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {/* Umrah Package */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-[2rem] p-8 md:p-10 border border-gray-100 shadow-xl shadow-gray-100/50 relative overflow-hidden flex flex-col h-full"
          >
            <div className="absolute top-0 right-8 bg-gray-100 text-gray-600 text-xs font-bold px-4 py-1.5 rounded-b-lg">
              Available Year Round
            </div>
            
            <div className="flex items-start gap-4 mb-6 pt-4">
              <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center shrink-0">
                <Star className="text-gold-500" size={28} />
              </div>
              <div>
                <h2 className="text-3xl font-serif font-bold text-primary-900 mb-1">Umrah Package</h2>
                <p className="text-gray-500">Standard & Premium Options</p>
              </div>
            </div>

            <p className="text-gray-600 mb-8 leading-relaxed">
              Experience the minor pilgrimage with our tailored Umrah packages. Whether you're seeking a standard trip or a luxurious stay close to the Haramain, we have you covered.
            </p>

            <ul className="space-y-4 mb-10 flex-grow">
              {[
                'Visa Processing & Documentation',
                'Return Flight Tickets',
                'Accommodation in Makkah & Madinah',
                'Ground Transfers via AC Coasters/Cars',
                'Ziyarah (Guided Historical Tours)',
                'Ihram & Dedicated Guidance'
              ].map((item, i) => (
                <li key={i} className="flex items-start">
                  <Check className="text-gold-500 mr-3 shrink-0 mt-0.5" size={20} />
                  <span className="text-gray-700">{item}</span>
                </li>
              ))}
            </ul>

            <Link 
              to="/contact" 
              className="w-full py-4 bg-primary-900 text-white rounded-xl font-bold text-lg hover:bg-primary-800 transition-colors text-center shadow-lg shadow-primary-900/20"
            >
              Inquire About Umrah
            </Link>
          </motion.div>

          {/* Hajj Package */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-primary-900 rounded-[2rem] p-8 md:p-10 border-2 border-gold-500/20 shadow-xl shadow-primary-900/10 relative overflow-hidden flex flex-col h-full"
          >
            <div className="absolute top-0 right-8 bg-gold-500 text-primary-900 text-xs font-bold px-4 py-1.5 rounded-b-lg flex items-center">
              <Calendar size={12} className="mr-1" /> Booking Open
            </div>
            
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10 pointer-events-none">
              <svg viewBox="0 0 400 400" className="absolute -top-20 -right-20 w-96 h-96">
                <path fill="#cca352" d="M42.1,-73.2C54.4,-65.4,63.9,-52.3,71.2,-38.3C78.4,-24.3,83.4,-9.4,81.5,4.8C79.6,19,70.8,32.6,60.6,44.2C50.4,55.8,38.8,65.3,25.2,71.5C11.5,77.7,-4.3,80.5,-19.1,77.1C-33.9,73.6,-47.8,63.9,-58.5,51.8C-69.2,39.7,-76.8,25.2,-79.8,9.8C-82.7,-5.7,-81,-22.1,-73.5,-36C-66,-49.9,-52.7,-61.2,-38.8,-68.3C-24.8,-75.4,-12.4,-78.3,1.7,-81.4C15.8,-84.4,31.5,-87.6,42.1,-73.2Z" transform="translate(200 200)" />
              </svg>
            </div>

            <div className="flex items-start gap-4 mb-6 pt-4 relative z-10">
              <div className="w-14 h-14 bg-primary-800 rounded-2xl border border-white/10 flex items-center justify-center shrink-0">
                <Moon className="text-gold-400" size={28} />
              </div>
              <div>
                <h2 className="text-3xl font-serif font-bold text-white mb-1">Hajj Package</h2>
                <p className="text-gray-300">Complete Hajj Pilgrimage</p>
              </div>
            </div>

            <p className="text-gray-300 mb-8 leading-relaxed relative z-10">
              Fulfill your sacred obligation with our comprehensive Hajj services. We ensure strict adherence to safety and Islamic guidelines throughout your stay.
            </p>

            <ul className="space-y-4 mb-10 flex-grow relative z-10">
              {[
                'Secured Hajj Visa & Logistics',
                'Premium Tents in Mina & Arafat',
                'Top-Tier Accommodation Settings',
                'Nutritional Meals Provided',
                'Dedicated Islamic Scholars & Guides',
                'Pre-departure Seminars & Kits'
              ].map((item, i) => (
                <li key={i} className="flex items-start">
                  <Check className="text-gold-400 mr-3 shrink-0 mt-0.5" size={20} />
                  <span className="text-gray-200">{item}</span>
                </li>
              ))}
            </ul>

            <Link 
              to="/contact" 
              className="w-full py-4 bg-gold-500 text-primary-900 rounded-xl font-bold text-lg hover:bg-gold-400 transition-colors text-center shadow-[0_0_20px_rgba(204,163,82,0.3)] relative z-10"
            >
              Book Your Hajj Seat
            </Link>
          </motion.div>
        </div>
        
        {/* Sacred Destinations */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-serif font-bold text-primary-900">Sacred Destinations</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="group relative h-80 rounded-[2rem] overflow-hidden"
          >
            <img 
              src="https://images.unsplash.com/photo-1580418827493-f2b22c0a76cb?auto=format&fit=crop&q=80&w=1200" 
              alt="Makkah" 
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-8 w-full">
              <h3 className="text-3xl font-bold text-white mb-2">Makkah</h3>
              <p className="text-gray-200 font-medium">The Holy City</p>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="group relative h-80 rounded-[2rem] overflow-hidden"
          >
            <img 
              src="https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&q=80&w=1200" 
              alt="Madinah" 
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-8 w-full">
              <h3 className="text-3xl font-bold text-white mb-2">Madinah</h3>
              <p className="text-gray-200 font-medium">The Radiant City</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Dynamic Packages Grid (If data exists) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-3xl font-serif font-bold text-primary-900 mb-8 text-center">Available Packages</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {packages.map((pkg, idx) => (
              <motion.div 
                key={pkg.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-shadow flex flex-col h-full relative"
              >
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur text-primary-900 font-bold px-3 py-1 rounded-full text-xs z-10">
                  {pkg.type}
                </div>
                <div className="h-48 relative">
                  <img 
                    src={pkg.featuredImage || 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&q=80&w=800'} 
                    alt={pkg.name} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                    <h3 className="text-xl font-bold text-white">{pkg.name}</h3>
                  </div>
                </div>
                <div className="p-6 flex-grow flex flex-col">
                  <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-100">
                    <span className="text-sm text-gray-500 flex items-center">
                      <Calendar size={14} className="mr-1" /> {pkg.duration}
                    </span>
                    <span className="text-lg font-bold text-gold-600">₦{pkg.price}</span>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed mb-6 flex-grow">
                    {pkg.shortDescription}
                  </p>
                  <div className="text-xs text-gray-500 mb-6 space-y-1">
                    <p><strong>Departure:</strong> {pkg.departureDate ? new Date(pkg.departureDate).toLocaleDateString() : 'TBA'}</p>
                    <p><strong>Available Slots:</strong> {pkg.availableSlots}</p>
                  </div>
                  <Link to="/contact" className="block w-full py-3 text-center rounded-xl bg-gray-50 text-primary-900 font-bold hover:bg-gold-500 transition-colors">
                    Inquire
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

      {/* Empty State */}
      {packages.length === 0 && !isLoading && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center text-gray-500">
          No packages available at the moment.
        </section>
      )}
      {packages.length === 0 && isLoading && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center text-gray-500">
          Loading packages...
        </section>
      )}
    </div>
  );
}
