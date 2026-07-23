import { motion } from 'motion/react';
import { Target, Eye, ShieldCheck, Award, HeartHandshake } from 'lucide-react';
import PageHero from '../components/PageHero';

export default function AboutPage() {
  return (
    <div className="w-full bg-white">
      {/* Page Header */}
      <PageHero 
        title="About Us" 
        subtitle="Sohibul Minsor Classic Ltd" 
      />

      {/* Company Overview */}
      <section className="py-20 lg:py-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h2 className="text-3xl lg:text-4xl font-serif font-bold text-primary-900">
              Your Gateway to Global Opportunities
            </h2>
            <div className="w-20 h-1.5 bg-gold-500 rounded-full"></div>
            <p className="text-gray-600 leading-relaxed text-lg">
              Sohibul Minsor Classic Ltd (RC: 8411491) is a premier travel, tours, Hajj & Umrah, and educational 
              consultancy agency based in Ilorin, Kwara State, Nigeria. We specialize in 
              providing seamless, end-to-end travel solutions for individuals, students, 
              and professionals looking to explore international opportunities.
            </p>
            <p className="text-gray-600 leading-relaxed text-lg">
              With a deep understanding of complex immigration procedures, scholarship 
              acquisitions, and religious pilgrimages (Hajj & Umrah), our experienced 
              consultants work tirelessly to ensure your travel dreams become a reality. 
              We pride ourselves on transparency, integrity, and exceptional customer service.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 gap-4"
          >
            <img src="/kaaba-makkah.jpg" alt="Travel" className="w-full h-48 md:h-64 object-cover rounded-2xl shadow-lg" />
            <img src="/consultation.jpg" alt="Consultation" className="w-full h-48 md:h-64 object-cover rounded-2xl shadow-lg mt-8" />
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-gray-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center"
            >
              <div className="bg-primary-50 p-4 rounded-2xl text-primary-900 mb-6">
                <Target size={40} />
              </div>
              <h3 className="text-2xl font-bold text-primary-900 mb-4">Our Mission</h3>
              <p className="text-gray-600 leading-relaxed">
                To provide reliable, transparent, and affordable travel, educational, and pilgrimage consultancy 
                services, empowering our clients to achieve their educational, professional, 
                and spiritual travel goals with peace of mind.
              </p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-primary-900 p-10 rounded-3xl shadow-xl flex flex-col items-center text-center text-white"
            >
              <div className="bg-gold-500/20 p-4 rounded-2xl text-gold-500 mb-6">
                <Eye size={40} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Our Vision</h3>
              <p className="text-gray-300 leading-relaxed">
                To be the most trusted and sought-after travel consultancy in Nigeria, recognized 
                for our exceptional success rates, customer-centric approach, and contribution 
                to global connectivity.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why Clients Trust Us */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-serif font-bold text-primary-900 mb-16">
            Why Clients Trust Us
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="p-8 rounded-2xl bg-white border border-gray-100 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] hover:-translate-y-2 transition-transform"
            >
              <ShieldCheck size={48} className="text-gold-500 mx-auto mb-6" />
              <h4 className="text-xl font-bold text-primary-900 mb-3">Registered & Verified</h4>
              <p className="text-gray-600 text-sm leading-relaxed">
                Legally registered as a corporate entity (RC: 8411491), ensuring your transactions are safe, legal, and thoroughly protected.
              </p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="p-8 rounded-2xl bg-white border border-gray-100 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] hover:-translate-y-2 transition-transform"
            >
              <Award size={48} className="text-gold-500 mx-auto mb-6" />
              <h4 className="text-xl font-bold text-primary-900 mb-3">Proven Success Rate</h4>
              <p className="text-gray-600 text-sm leading-relaxed">
                Years of experience have allowed us to master complex travel and immigration procedures, yielding exceptionally high approval rates for our clients.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="p-8 rounded-2xl bg-white border border-gray-100 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] hover:-translate-y-2 transition-transform"
            >
              <HeartHandshake size={48} className="text-gold-500 mx-auto mb-6" />
              <h4 className="text-xl font-bold text-primary-900 mb-3">Personalized Service</h4>
              <p className="text-gray-600 text-sm leading-relaxed">
                Every application is unique. We provide tailored solutions and one-on-one guidance throughout your entire document processing journey.
              </p>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
