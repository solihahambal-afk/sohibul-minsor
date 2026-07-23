import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Star, CheckCircle, Quote, MapPin, Search, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiClient } from '../lib/apiClient';

const BACKGROUND_IMAGES = [
  "/bg.jpg",
  "/bg-1.jpeg",
  "/bg-2.jpg",
  "/bg-3.jpg",
  "/bg-4.jpg",
  "/bg-5.jpg",
  "/bg-6.jpg",
];

export default function HomePage() {
  const [currentBg, setCurrentBg] = useState(0);
  const [testimonials, setTestimonials] = useState<any[]>([
    { author: "Ahmad Ibrahim", role: "UK Student Visa", content: "They made my study abroad process incredibly smooth. From securing admission to visa approval, I am very grateful.", rating: 5 },
    { author: "Fatima Yusuf", role: "Umrah Pilgrim", content: "The Umrah package handled by Sohibul Minsor was excellent. Everything from our hotel in Makkah to our flight was perfectly arranged.", rating: 5 },
    { author: "Samuel O.", role: "Canada Work Visa", content: "Highly professional and transparent. They didn't just help with my work visa, they also provided great travel guidance.", rating: 5 }
  ]);

  useEffect(() => {
    // Preload images to prevent flickering
    BACKGROUND_IMAGES.forEach((src) => {
      const img = new Image();
      img.src = src;
    });

    const timer = setInterval(() => {
      setCurrentBg((prev) => (prev + 1) % BACKGROUND_IMAGES.length);
    }, 6000);

    const fetchTestimonials = async () => {
      try {
        const { data, error } = await apiClient
          .from('testimonials')
          .select('*')
          .eq('isPublished', true)
          .order('created_at', { ascending: false })
          .limit(3);
        if (!error && data && data.length > 0) {
          setTestimonials(data);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchTestimonials();

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative min-h-[95vh] flex items-center pt-32 pb-20 justify-center">
        {/* Background Image & Overlay */}
        <div className="absolute inset-0 w-full h-full bg-primary-950 overflow-hidden z-0">
          {BACKGROUND_IMAGES.map((img, idx) => (
            <img 
              key={idx}
              src={img} 
              alt={`Travel Background ${idx + 1}`} 
              className={`absolute inset-0 w-full h-full object-cover object-center transition-all duration-[1500ms] ease-in-out brightness-75 ${
                idx === currentBg 
                  ? 'opacity-100 z-10 scale-100' 
                  : idx === (currentBg === 0 ? BACKGROUND_IMAGES.length - 1 : currentBg - 1)
                    ? 'opacity-100 z-0 scale-105'
                    : 'opacity-0 z-0 scale-105'
              }`}
            />
          ))}
          
          {/* Subtle world map / abstract pattern */}
          <div className="absolute inset-0 z-20 pointer-events-none opacity-[0.05] mix-blend-overlay"></div>

          {/* Soft curved flight-path lines & geometric accents */}
          <svg className="absolute inset-0 w-full h-full z-20 pointer-events-none opacity-40 mix-blend-lighten" viewBox="0 0 1440 800" preserveAspectRatio="xMidYMid slice">
            <path d="M -200 600 C 300 100, 800 700, 1600 300" fill="none" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="1.5" strokeDasharray="6 8" />
            <path d="M -100 400 C 400 50, 900 800, 1500 100" fill="none" stroke="rgba(212, 175, 55, 0.25)" strokeWidth="1" strokeDasharray="4 6" />
            <circle cx="800" cy="450" r="3" fill="rgba(212, 175, 55, 0.5)" className="animate-pulse" />
            <circle cx="300" cy="290" r="2.5" fill="rgba(255, 255, 255, 0.4)" className="animate-pulse" style={{ animationDelay: '1s' }} />
            <circle cx="1100" cy="550" r="2.5" fill="rgba(255, 255, 255, 0.4)" className="animate-pulse" style={{ animationDelay: '2s' }} />
          </svg>

          {/* Premium dark blue gradient overlays (adjusted for better visibility) & Lighting */}
          <div className="absolute inset-0 bg-black/40 z-20 pointer-events-none"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-primary-950/90 to-transparent z-20 pointer-events-none"></div>
          
          {/* Radial depth effect / glassmorphism base */}
          <div className="absolute inset-0 bg-primary-950/20 z-20 pointer-events-none"></div>

          {/* Navigation Indicators */}
          <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-30 flex items-center justify-center space-x-3">
            {BACKGROUND_IMAGES.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentBg(idx)}
                className={`h-1.5 rounded-full transition-all duration-500 ease-in-out ${
                  idx === currentBg 
                    ? 'w-10 bg-gold-500 opacity-100 shadow-[0_0_10px_rgba(212,175,55,0.5)]' 
                    : 'w-6 bg-white/40 hover:bg-white/70 hover:w-8 opacity-70'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        <div className="relative z-30 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mt-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="max-w-4xl mx-auto space-y-8 flex flex-col items-center"
          >
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold font-serif text-white leading-tight drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)]">
              Your Trusted Partner in <span className="text-gold-500 drop-shadow-[0_2px_12px_rgba(212,175,55,0.5)]">Global Travel</span>
            </h1>
            <p className="text-xl md:text-2xl text-white max-w-2xl mx-auto font-medium drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
              We make your travel dreams a reality, from seamless global travel arrangements to sacred Hajj & Umrah journeys.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
              <Link 
                to="/contact" 
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-gold-500 text-primary-900 font-bold text-lg hover:bg-gold-400 hover:scale-105 transition-all shadow-xl shadow-gold-500/30 flex items-center justify-center group"
              >
                Apply Now
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
              </Link>
              <a 
                href="https://wa.me/2347068609404"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-white/10 text-white font-bold text-lg hover:bg-white/20 border border-white/20 transition-all flex items-center justify-center backdrop-blur-md"
              >
                WhatsApp Us
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Services Overview Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-gold-600 font-bold tracking-widest uppercase text-sm">What We Offer</span>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-primary-900 mt-3 mb-4">Our Premium Services</h2>
            <div className="w-24 h-1.5 bg-gold-500 mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Service Cards */}
            {[
              { title: "Travel & Immigration", icon: <CheckCircle />, desc: "Expert guidance on travel, work, and study documentation ensuring high success rates." },
              { title: "Hajj & Umrah", icon: <Star />, desc: "Seamless Islamic pilgrimage packages including flights, bespoke accommodation, and guided tours." },
              { title: "Study Abroad", icon: <Search />, desc: "Secure admissions and scholarships in top international universities globally." },
              { title: "Flight Reservation", icon: <MapPin />, desc: "Reliable and affordable flight bookings tailored to your schedule and budget." }
            ].map((service, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-gray-50 border border-gray-100 p-8 rounded-2xl hover:shadow-xl hover:shadow-primary-900/5 transition-all group"
              >
                <div className="w-14 h-14 bg-primary-900 rounded-xl flex items-center justify-center text-gold-500 mb-6 group-hover:bg-gold-500 group-hover:text-primary-900 transition-colors">
                  {service.icon}
                </div>
                <h3 className="text-xl font-bold text-primary-900 mb-3">{service.title}</h3>
                <p className="text-gray-600 leading-relaxed text-sm mb-6">
                  {service.desc}
                </p>
                <Link to="/services" className="text-primary-900 font-semibold text-sm flex items-center group-hover:text-gold-600 transition-colors">
                  Learn more <ArrowRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-24 bg-primary-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gold-500/5 blur-[120px] rounded-full translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-1/3 h-full bg-primary-800/50 blur-[120px] rounded-full -translate-x-1/2"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <span className="text-gold-500 font-bold tracking-widest uppercase text-sm">Why Choose Us</span>
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mt-3 mb-6">
                Excellence in Every Journey
              </h2>
              <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                With years of proven expertise, Sohibul Minsor Classic Ltd is dedicated to providing transparent, efficient, and successful travel solutions tailored to your unique needs. We prioritize your peace of mind above all.
              </p>
              
              <ul className="space-y-6">
                {[
                  "Registered & Trusted Agency (RC: 8411491)",
                  "High Success & Approval Rates",
                  "Dedicated 24/7 Customer Support",
                  "Transparent Processing with No Hidden Fees"
                ].map((item, index) => (
                  <li key={index} className="flex items-center space-x-4">
                    <div className="bg-gold-500/20 p-1.5 rounded-full shrink-0">
                      <CheckCircle className="text-gold-500" size={20} />
                    </div>
                    <span className="text-gray-200 font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="absolute -inset-4 bg-gold-500/20 rounded-[2rem] blur-xl"></div>
              <img 
                src="/happy-traveler.jpg" 
                alt="Happy Traveler" 
                className="relative rounded-2xl shadow-2xl object-cover h-[500px] w-full border border-primary-800"
              />
              <div className="absolute -bottom-8 -left-8 bg-white p-6 rounded-2xl shadow-xl hidden md:block">
                <div className="flex items-center space-x-4">
                  <div className="bg-gold-500 w-12 h-12 rounded-full flex items-center justify-center text-primary-900 font-bold text-xl">
                    10+
                  </div>
                  <div>
                    <h4 className="font-bold text-primary-900 text-lg">Years Experience</h4>
                    <p className="text-sm text-gray-500">In Travel & Tourism</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-primary-900 mt-3 mb-4">Client Success Stories</h2>
            <div className="w-24 h-1.5 bg-gold-500 mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 relative"
              >
                <Quote className="text-gold-500/20 absolute top-6 right-8" size={60} />
                <div className="flex text-gold-500 mb-6">
                  {[...Array(parseInt(testimonial.rating) || 5)].map((_, idx) => <Star key={idx} size={18} className="fill-current" />)}
                </div>
                <p className="text-gray-600 mb-6 relative z-10 text-sm leading-relaxed italic">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center gap-4">
                  {testimonial.avatarUrl ? (
                    <img src={testimonial.avatarUrl} alt={testimonial.author} className="w-12 h-12 rounded-full object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-lg">
                      {testimonial.author.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h4 className="font-bold text-primary-900">{testimonial.author}</h4>
                    {testimonial.role && <span className="text-sm text-gold-600 font-medium">{testimonial.role}</span>}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-12 max-w-4xl mx-auto bg-white p-8 md:p-10 rounded-2xl shadow-sm border border-gold-100 relative group hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex items-start sm:items-center space-x-6"
          >
            <div className="bg-green-100 p-4 rounded-full text-green-600 flex-shrink-0">
              <CheckCircle size={32} className="fill-current text-green-100 stroke-green-600" />
            </div>
            <div>
              <h4 className="font-bold text-primary-900 text-lg mb-2">Global Visa Success</h4>
              <p className="text-gray-600 text-base md:text-lg leading-relaxed">
                We have successfully processed visas for our clients traveling to <strong className="text-primary-900">TURKEY 🇹🇷, MALAYSIA 🇲🇾, SAUDI ARABIA 🇸🇦, KUWAIT 🇰🇼,</strong> and <strong className="text-primary-900">OMAN 🇴🇲</strong>.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-gold-500 py-20 relative z-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-serif font-bold text-primary-900 mb-6 drop-shadow-sm">
            Ready to Begin Your Journey?
          </h2>
          <p className="text-lg text-primary-800 mb-10 max-w-2xl mx-auto font-medium">
            Contact us today for a free consultation. Our team of experts is ready to assist you with your travel, pilgrimage, and educational needs.
          </p>

          <div className="flex flex-col md:flex-row justify-center items-center gap-6 mb-12">
            <div className="bg-white/90 backdrop-blur-sm px-6 py-4 rounded-2xl shadow-lg flex items-center space-x-3 border border-white/50 transform hover:-translate-y-1 transition-transform">
              <div className="bg-primary-100 p-2 rounded-full text-primary-700">
                <Mail size={20} />
              </div>
              <a href="mailto:info@sohibulminsorclassic.com" className="text-primary-900 font-semibold hover:text-primary-700 transition-colors">
                info@sohibulminsorclassic.com
              </a>
            </div>
            
            <div className="bg-white/90 backdrop-blur-sm px-6 py-4 rounded-2xl shadow-lg flex items-center space-x-3 border border-white/50 transform hover:-translate-y-1 transition-transform">
              <div className="bg-primary-100 p-2 rounded-full text-primary-700">
                <Mail size={20} />
              </div>
              <a href="mailto:admin@sohibulminsorclassic.com" className="text-primary-900 font-semibold hover:text-primary-700 transition-colors">
                admin@sohibulminsorclassic.com
              </a>
            </div>
            
            <div className="bg-white/90 backdrop-blur-sm px-6 py-4 rounded-2xl shadow-lg flex items-center space-x-3 border border-white/50 transform hover:-translate-y-1 transition-transform">
              <div className="bg-primary-100 p-2 rounded-full text-primary-700">
                <Mail size={20} />
              </div>
              <a href="mailto:support@sohibulminsorclassic.com" className="text-primary-900 font-semibold hover:text-primary-700 transition-colors">
                support@sohibulminsorclassic.com
              </a>
            </div>
          </div>

          <div className="flex justify-center">
            <Link to="/contact" className="px-10 py-5 rounded-full bg-primary-900 text-gold-400 font-bold text-xl hover:bg-primary-800 hover:scale-105 transition-all shadow-[0_4px_14px_rgba(0,0,0,0.25)] flex items-center">
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
