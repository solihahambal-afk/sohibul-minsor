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
    const unsubscribe = apiClient.from('hajj_umrah_packages').select('*').eq('status', 'Open').order('departureDate', { ascending: true })
      .subscribe(({ data, error }) => {
        setIsLoading(false);
        if (error) {
          console.error('Error fetching data:', error);
        } else if (data) {
          setPackages(data);
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

      {/* Dynamic Packages Grid (If data exists) */}
      {packages.length > 0 && (
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
      )}

      {/* Static / Default Packages */}
      {packages.length === 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Umrah Package */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="border-2 border-gray-100 rounded-3xl p-8 hover:border-gold-500 transition-colors bg-white relative"
            >
              <div className="absolute top-0 right-0 bg-gray-100 text-gray-600 font-bold px-4 py-2 rounded-bl-3xl rounded-tr-3xl text-sm">
                Available Year Round
              </div>
              <div className="flex items-center space-x-4 mb-6">
                <div className="bg-gold-500/10 p-4 rounded-xl text-gold-600">
                  <Star size={32} />
                </div>
                <div>
                  <h2 className="text-3xl font-serif font-bold text-primary-900">Umrah Package</h2>
                  <p className="text-gray-500 mt-1">Standard & Premium Options</p>
                </div>
              </div>
              
              <p className="text-gray-600 leading-relaxed mb-8">
                Experience the minor pilgrimage with our tailored Umrah packages. Whether you're seeking a standard trip or a luxurious stay close to the Haramain, we have you covered.
              </p>

              <ul className="space-y-4 mb-8">
                {[
                  "Visa Processing & Documentation",
                  "Return Flight Tickets",
                  "Accommodation in Makkah & Madinah",
                  "Ground Transfers via AC Coasters/Cars",
                  "Ziyarah (Guided Historical Tours)",
                  "Ihram & Dedicated Guidance"
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start">
                    <Check size={20} className="text-gold-500 mr-3 mt-0.5 shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>

              <Link to="/contact" className="block w-full py-4 text-center rounded-xl bg-primary-900 text-white font-bold hover:bg-gold-500 hover:text-primary-900 transition-colors">
                Inquire About Umrah
              </Link>
            </motion.div>

            {/* Hajj Package */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="border-2 border-gold-500 rounded-3xl p-8 bg-primary-900 text-white relative shadow-2xl"
            >
              <div className="absolute top-0 right-0 bg-gold-500 text-primary-900 font-bold px-4 py-2 rounded-bl-3xl rounded-tr-xl text-sm flex items-center">
                <Calendar size={16} className="mr-2" /> Booking Open
              </div>
              
              <div className="flex items-center space-x-4 mb-6">
                <div className="bg-white/10 p-4 rounded-xl text-gold-500 border border-white/20">
                  <Moon size={32} />
                </div>
                <div>
                  <h2 className="text-3xl font-serif font-bold text-white">Hajj Package</h2>
                  <p className="text-gray-300 mt-1">Complete Hajj Pilgrimage</p>
                </div>
              </div>
              
              <p className="text-gray-300 leading-relaxed mb-8">
                Fulfill your sacred obligation with our comprehensive Hajj services. We ensure strict adherence to safety, comfort, and Islamic guidelines throughout your stay.
              </p>

              <ul className="space-y-4 mb-8">
                {[
                  "Secured Hajj Visa & Logistics",
                  "Premium Tents in Mina & Arafat",
                  "Top-Tier Accommodation Settings",
                  "Nutritional Meals Provided",
                  "Dedicated Islamic Scholars & Guides",
                  "Pre-departure Seminars & Kits"
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start">
                    <Check size={20} className="text-gold-500 mr-3 mt-0.5 shrink-0" />
                    <span className="text-gray-200">{item}</span>
                  </li>
                ))}
              </ul>

              <Link to="/contact" className="block w-full py-4 text-center rounded-xl bg-gold-500 text-primary-900 font-bold hover:bg-gold-400 transition-colors">
                Book Your Hajj Seat
              </Link>
            </motion.div>
          </div>
        </section>
      )}

      {/* Gallery Section */}
      <section className="bg-gray-50 py-20 border-t border-gray-100">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
           <h2 className="text-3xl font-serif font-bold text-primary-900 mb-12">Sacred Destinations</h2>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="relative group overflow-hidden rounded-2xl h-80">
               <img src="https://images.unsplash.com/photo-1565552643952-b4b159f81156?auto=format&fit=crop&q=80&w=1200" alt="Kaaba, Makkah" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
               <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-6">
                 <div>
                   <h3 className="text-2xl font-bold text-white mb-1">Makkah</h3>
                   <p className="text-gray-300">The Holy City</p>
                 </div>
               </div>
             </div>
             <div className="relative group overflow-hidden rounded-2xl h-80">
               <img src="https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&q=80&w=1200" alt="Masjid an-Nabawi, Madinah" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
               <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-6">
                 <div>
                   <h3 className="text-2xl font-bold text-white mb-1">Madinah</h3>
                   <p className="text-gray-300">The Radiant City</p>
                 </div>
               </div>
             </div>
           </div>
         </div>
      </section>
    </div>
  );
}
