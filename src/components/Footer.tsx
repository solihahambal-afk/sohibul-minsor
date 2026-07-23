import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Facebook, Plane, MessageCircle, Instagram } from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiClient, hasApiConfig, getErrorMessage } from '../lib/apiClient';
import toast from 'react-hot-toast';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    const emailToSubscribe = email;
    setEmail('');
    setIsSubscribing(false);
    toast.success('Subscription successful.');

    // Background process to avoid blocking the user
    try {
      apiClient.from('subscribers').insert([
        { 
          email: emailToSubscribe, 
          status: 'Active'
        }
      ]).then(({ error }) => {
        if (error) {
          if (error.code === '23505' || error.message.includes('unique')) {
            toast.error('This email is already subscribed.');
          } else {
             console.error('Subscription error:', error);
          }
        }
      });
      
      apiClient.functions.invoke("send-mail", {
        body: {
          type: "welcome",
          payload: { email: emailToSubscribe }
        }
      }).catch(emailErr => {
        console.error('Welcome email error:', emailErr);
      });
      
    } catch (error: any) {
      console.error('Background subscription error:', error);
    }
  };

  return (
    <footer className="bg-primary-900 text-gray-300 pt-16 pb-8 border-t border-primary-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-3 sm:space-x-4 mb-6">
              <img 
                src="/new_logo.png?v=3" 
                alt="Sohibulminsor Classic Logo" 
                className="h-16 w-auto sm:h-20 object-contain drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]" 
              />
              <div className="flex flex-col justify-center">
                <span className="font-serif text-lg sm:text-xl font-bold text-gold-500 leading-none tracking-wide">
                  Sohibul Minsor
                </span>
                <span className="font-sans text-white text-[10px] sm:text-xs font-black tracking-wider uppercase mt-1">
                  CLASSIC LTD
                </span>
              </div>
            </div>
            <p className="text-sm text-gray-400 mb-6 leading-relaxed">
              Your trusted partner in international travel, Hajj & Umrah, and global educational opportunities. Making your travel dreams a stress-free reality.
            </p>
            <div className="flex flex-col space-y-3">
              <a href="https://www.facebook.com/sohibulminsor" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-3 text-gray-400 hover:text-[#1877F2] transition-colors group">
                <div className="w-10 h-10 rounded-full bg-primary-800 flex items-center justify-center text-white group-hover:bg-[#1877F2] group-hover:text-white transition-colors">
                  <Facebook size={18} />
                </div>
                <span className="text-sm font-medium">Sohibul Minsor</span>
              </a>
              <a href="https://whatsapp.com/channel/0029Vb6fPm98KMqfgxKD8b1N" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-3 text-gray-400 hover:text-[#25D366] transition-colors group">
                <div className="w-10 h-10 rounded-full bg-primary-800 flex items-center justify-center text-white group-hover:bg-[#25D366] group-hover:text-white transition-colors">
                  <MessageCircle size={18} />
                </div>
                <span className="text-sm font-medium">WhatsApp Channel</span>
              </a>
              <a href="https://www.tiktok.com/@sohibulminsor" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-3 text-gray-400 hover:text-white transition-colors group">
                <div className="w-10 h-10 rounded-full bg-primary-800 flex items-center justify-center text-white group-hover:bg-black group-hover:text-white transition-colors">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a5.64 5.64 0 0 1-1.04-.1z" />
                  </svg>
                </div>
                <span className="text-sm font-medium">TikTok</span>
              </a>
              <a href="https://instagram.com/sohibulminsor1" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-3 text-gray-400 hover:text-[#E1306C] transition-colors group">
                <div className="w-10 h-10 rounded-full bg-primary-800 flex items-center justify-center text-white group-hover:bg-gradient-to-tr group-hover:from-[#FD1D1D] group-hover:via-[#E1306C] group-hover:to-[#833AB4] group-hover:text-white transition-colors">
                  <Instagram size={18} />
                </div>
                <span className="text-sm font-medium">Instagram</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-6">Quick Links</h3>
            <ul className="space-y-4 text-sm text-gray-400">
              <li><Link to="/about" className="hover:text-gold-500 transition-colors">About Us</Link></li>
              <li><Link to="/services" className="hover:text-gold-500 transition-colors">Our Services</Link></li>
              <li><Link to="/hajj-umrah" className="hover:text-gold-500 transition-colors">Hajj & Umrah Packages</Link></li>
              <li><Link to="/scholarships" className="hover:text-gold-500 transition-colors">Scholarship Programs</Link></li>
              <li><Link to="/news" className="hover:text-gold-500 transition-colors">News & Updates</Link></li>
              <li><Link to="/contact" className="hover:text-gold-500 transition-colors">Contact Support</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-6">Contact Us</h3>
            <ul className="space-y-4 text-sm text-gray-400">
              <li className="flex items-start space-x-3">
                <MapPin size={18} className="text-gold-500 flex-shrink-0 mt-0.5" />
                <span>Shop B3, Emirate Plaza, Opposite Abanik Filling Station, Saw Mill Area, Ilorin, Kwara State, Nigeria.</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone size={18} className="text-gold-500 flex-shrink-0" />
                <div className="flex flex-col">
                  <span>+234 807 441 4734</span>
                  <span>+234 706 860 9404</span>
                </div>
              </li>
              <li className="flex items-center space-x-3">
                <Mail size={18} className="text-gold-500 flex-shrink-0" />
                <a href="mailto:info@sohibulminsorclassic.com" className="hover:text-gold-500 transition-colors">
                  info@sohibulminsorclassic.com
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-6">Stay Updated</h3>
            <p className="text-sm text-gray-400 mb-4">
              Subscribe to our newsletter for the latest travel tips, scholarship opportunities, and Hajj & Umrah updates.
            </p>
            <form className="space-y-2" onSubmit={handleSubscribe}>
              <input 
                type="email" 
                placeholder="Your email address" 
                className="w-full bg-primary-800 border border-primary-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-gold-500 text-white transition-colors"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubscribing}
                required
              />
              <button 
                type="submit"
                disabled={isSubscribing}
                className="w-full bg-gold-500 text-primary-900 font-semibold rounded-lg px-4 py-2.5 text-sm hover:bg-gold-400 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubscribing ? 'Subscribing...' : 'Subscribe'}
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-primary-800 pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 text-sm py-4">
          <p className="text-gray-500">
            &copy; {currentYear} Sohibul Minsor Classic Ltd. All rights reserved. (RC: 8411491)
          </p>
          <div className="flex space-x-6 text-gray-500">
            <Link to="#" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="#" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
