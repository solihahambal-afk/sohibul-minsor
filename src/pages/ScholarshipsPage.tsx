import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { GraduationCap, BookOpen, Globe, FileCheck, ArrowRight, Calendar, MapPin, Building } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageHero from '../components/PageHero';
import { apiClient, hasApiConfig } from '../lib/apiClient';

interface Scholarship {
  id: string;
  title: string;
  featuredImage: string;
  country: string;
  institution: string;
  degreeLevel: string;
  deadline: string;
  eligibility: string;
  applicationLink: string;
  shortDescription: string;
  fullDescription: string;
  status: 'Open' | 'Closed';
}

export default function ScholarshipsPage() {
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = apiClient.from('scholarships').select('*').eq('status', 'Open').order('deadline', { ascending: true })
      .subscribe(({ data, error }) => {
        setIsLoading(false);
        if (error) {
          console.error('Error fetching data:', error);
        } else if (data) {
          setScholarships(data);
        }
      });
    return () => { if (unsubscribe) unsubscribe(); };
  }, []);

  return (
    <div className="w-full bg-gray-50 pb-24">
      {/* Page Header */}
      <PageHero 
        title="Study Abroad Scholarships" 
        subtitle="Unlock your academic potential globally" 
      />

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 text-center md:text-left mb-20">
          {/* Programs */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100"
          >
            <div className="w-14 h-14 bg-primary-50 text-primary-900 rounded-xl flex items-center justify-center mb-6 mx-auto md:mx-0">
              <Globe size={28} />
            </div>
            <h3 className="text-xl font-bold text-primary-900 mb-4">Global Programs</h3>
            <p className="text-gray-600 text-sm leading-relaxed mb-4">
              We connect ambitious students with top-tier universities offering merit-based, need-based, and country-specific scholarships. Destinations include the UK, Canada, USA, Australia, and European Union countries.
            </p>
          </motion.div>

          {/* Application Guidance */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100"
          >
            <div className="w-14 h-14 bg-primary-50 text-primary-900 rounded-xl flex items-center justify-center mb-6 mx-auto md:mx-0">
              <BookOpen size={28} />
            </div>
            <h3 className="text-xl font-bold text-primary-900 mb-4">Application Guidance</h3>
            <p className="text-gray-600 text-sm leading-relaxed mb-4">
              Writing a winning statement of purpose, requesting strong letters of recommendation, and preparing a compelling academic CV. We guide you step-by-step through the highly competitive application process.
            </p>
          </motion.div>

          {/* Document Translation */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100"
          >
            <div className="w-14 h-14 bg-primary-50 text-primary-900 rounded-xl flex items-center justify-center mb-6 mx-auto md:mx-0">
              <FileCheck size={28} />
            </div>
            <h3 className="text-xl font-bold text-primary-900 mb-4">Document Translation</h3>
            <p className="text-gray-600 text-sm leading-relaxed mb-4">
              Ensure your transcripts, birth certificates, and academic records meet international university standards. We provide certified translation services for non-English academic documents.
            </p>
          </motion.div>
        </div>

        {/* Dynamic Scholarships List */}
        {scholarships.length > 0 && (
          <div className="mb-20">
            <h2 className="text-3xl font-serif font-bold text-primary-900 mb-8 text-center md:text-left">Available Scholarships</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {scholarships.map((scholarship, idx) => (
                <motion.div 
                  key={scholarship.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-shadow flex flex-col sm:flex-row"
                >
                  <div className="sm:w-2/5 h-48 sm:h-auto relative">
                    <img 
                      src={scholarship.featuredImage || 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=800'} 
                      alt={scholarship.title} 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 left-4 bg-primary-900 text-white text-xs font-bold px-3 py-1 rounded-full">
                      {scholarship.degreeLevel}
                    </div>
                  </div>
                  <div className="p-6 sm:w-3/5 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-primary-900 mb-2">{scholarship.title}</h3>
                      <div className="space-y-1 mb-4">
                        <div className="flex items-center text-sm text-gray-500">
                          <Building size={14} className="mr-2 text-gold-500" />
                          {scholarship.institution}
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <MapPin size={14} className="mr-2 text-gold-500" />
                          {scholarship.country}
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar size={14} className="mr-2 text-gold-500" />
                          Deadline: {new Date(scholarship.deadline).toLocaleDateString()}
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                        {scholarship.shortDescription}
                      </p>
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                      <Link to="/contact" className="text-gold-600 font-semibold text-sm hover:text-primary-900 transition-colors">
                        Get Help Applying &rarr;
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="bg-primary-900 text-white rounded-3xl p-10 md:p-16 flex flex-col md:flex-row items-center justify-between shadow-2xl relative overflow-hidden"
        >
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-gold-500/20 rounded-full blur-3xl"></div>
          <div className="mb-8 md:mb-0 max-w-xl relative z-10 text-center md:text-left">
            <h2 className="text-3xl font-serif font-bold mb-4">Ready to Apply?</h2>
            <p className="text-gray-300 text-lg">
              Book a free eligibility consultation with our education experts today. Let's find the best scholarship program tailored to your academic profile.
            </p>
          </div>
          <Link to="/contact" className="px-8 py-4 bg-gold-500 text-primary-900 font-bold rounded-xl hover:bg-gold-400 transition-colors flex items-center relative z-10 whitespace-nowrap">
            Book Consultation
            <ArrowRight className="ml-2" size={20} />
          </Link>
        </motion.div>
      </section>
    </div>
  );
}
