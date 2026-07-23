import React, { useState } from 'react';
import { motion } from 'motion/react';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle } from 'lucide-react';
import PageHero from '../components/PageHero';
import { apiClient, hasApiConfig } from '../lib/apiClient';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');

    // Save the data to use
    const dataToSubmit = { ...formData };
    
    // Set success immediately for better UX
    setSubmitSuccess(true);
    setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    setIsSubmitting(false);

    // Run the actual insert and email sending in the background
    try {
      apiClient.from('messages').insert([
        {
          name: dataToSubmit.name,
          email: dataToSubmit.email,
          phone: dataToSubmit.phone,
          subject: dataToSubmit.subject,
          message: dataToSubmit.message,
          status: 'Unread'
        }
      ]).then(({ error }) => {
        if (error) console.error('Api DB Insert Error:', error);
      });

      apiClient.functions.invoke("email-handler", {
        body: {
          type: "contact",
          subject: `New Contact Message: ${dataToSubmit.subject}`,
          html: `<h2>New message from ${dataToSubmit.name}</h2>
                 <p><strong>Email:</strong> ${dataToSubmit.email}</p>
                 <p><strong>Phone:</strong> ${dataToSubmit.phone || 'N/A'}</p>
                 <p><strong>Subject:</strong> ${dataToSubmit.subject}</p>
                 <p><strong>Message:</strong><br/>${dataToSubmit.message}</p>`
        }
      }).catch(emailErr => {
        console.error("Failed to send contact email async:", emailErr);
      });
    } catch (err: any) {
      console.error('Error in background submit:', err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="w-full bg-gray-50 pb-24">
      {/* Page Header */}
      <PageHero 
        title="Get in Touch" 
        subtitle="We are here to help you" 
      />

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 -mt-8 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Info */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1 space-y-6"
          >
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex items-start space-x-4">
              <div className="bg-primary-50 p-3 rounded-lg text-primary-900 shrink-0">
                <MapPin size={24} />
              </div>
              <div>
                <h3 className="font-bold text-primary-900 mb-1">Our Office</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Shop B3, Emirate Plaza,<br />
                  Opposite Abanik Filling Station,<br />
                  Saw Mill Area, Ilorin,<br />
                  Kwara State, Nigeria.
                </p>
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex items-start space-x-4">
              <div className="bg-primary-50 p-3 rounded-lg text-primary-900 shrink-0">
                <Phone size={24} />
              </div>
              <div>
                <h3 className="font-bold text-primary-900 mb-1">Phone & WhatsApp</h3>
                <p className="text-gray-600 text-sm leading-relaxed flex flex-col space-y-1 mt-2">
                  <a href="tel:+2348074414734" className="hover:text-gold-600">+234 807 441 4734</a>
                  <a href="https://wa.me/2347068609404" target="_blank" rel="noopener noreferrer" className="hover:text-gold-600">+234 706 860 9404 (WhatsApp)</a>
                </p>
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex items-start space-x-4">
              <div className="bg-primary-50 p-3 rounded-lg text-primary-900 shrink-0">
                <Mail size={24} />
              </div>
              <div>
                <h3 className="font-bold text-primary-900 mb-1">Email Us</h3>
                <div className="flex flex-col space-y-2 mt-2">
                  <a href="mailto:info@sohibulminsorclassic.com" className="text-gray-600 text-sm leading-relaxed hover:text-gold-600 break-all flex items-center">
                    info@sohibulminsorclassic.com
                  </a>
                  <a href="mailto:admin@sohibulminsorclassic.com" className="text-gray-600 text-sm leading-relaxed hover:text-gold-600 break-all flex items-center">
                    admin@sohibulminsorclassic.com
                  </a>
                  <a href="mailto:support@sohibulminsorclassic.com" className="text-gray-600 text-sm leading-relaxed hover:text-gold-600 break-all flex items-center">
                    support@sohibulminsorclassic.com
                  </a>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex items-start space-x-4">
              <div className="bg-primary-50 p-3 rounded-lg text-primary-900 shrink-0">
                <Clock size={24} />
              </div>
              <div>
                <h3 className="font-bold text-primary-900 mb-1">Working Hours</h3>
                <p className="text-gray-600 text-sm leading-relaxed mt-2">
                  Monday - Sunday: 24 Hours<br />
                  Always Open (24/7 Support)
                </p>
              </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-gray-100"
          >
            <h2 className="text-2xl font-bold text-primary-900 mb-2">Send Us a Message</h2>
            <p className="text-gray-600 text-sm mb-8">Fill out the form below and our team will get back to you within 24 hours.</p>
            
            {submitSuccess ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-green-50 border border-green-200 rounded-xl p-8 text-center space-y-4"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mb-2">
                  <CheckCircle size={32} />
                </div>
                <h3 className="text-xl font-bold text-green-800">Message Sent!</h3>
                <p className="text-green-700">
                  Thank you for contacting Sohibulminsor Classic. Your message has been received successfully. Our team will contact you as soon as possible using the email address you provided.
                </p>
                <button 
                  onClick={() => setSubmitSuccess(false)}
                  className="mt-6 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Send Another Message
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {submitError && (
                  <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm">
                    {submitError}
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-colors" placeholder="Ahmad Ibrahim" disabled={isSubmitting} />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                    <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-colors" placeholder="ahmad@example.com" disabled={isSubmitting} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} required className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-colors" placeholder="+234 XXX XXXX" disabled={isSubmitting} />
                  </div>
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">Service of Interest</label>
                    <select id="subject" name="subject" value={formData.subject} onChange={handleChange} required className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-colors text-gray-700" disabled={isSubmitting}>
                      <option value="">Select a service...</option>
                      <option value="Travel Consultation">Travel Consultation</option>
                      <option value="Study Abroad">Study Abroad</option>
                      <option value="Work & Immigration">Work & Immigration</option>
                      <option value="Hajj & Umrah">Hajj & Umrah</option>
                      <option value="Flight Reservation">Flight Reservation</option>
                      <option value="General Inquiry">General Inquiry</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">Your Message</label>
                  <textarea id="message" name="message" value={formData.message} onChange={handleChange} required rows={5} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-colors resize-none" placeholder="How can we help you?" disabled={isSubmitting}></textarea>
                </div>

                <button type="submit" disabled={isSubmitting} className="w-full sm:w-auto px-8 py-4 bg-primary-600 text-white font-bold rounded-xl hover:bg-gold-500 hover:text-primary-900 transition-colors flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed">
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                  {!isSubmitting && <Send className="ml-2" size={18} />}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </section>

      {/* Map Section */}
      <section className="h-96 w-full mt-12 bg-gray-200 relative">
        <iframe 
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15762.65!2d4.53!3d8.5!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zOMKwMzAnMDAuMCJOIDTCsDMxJzQ4LjAiRQ!5e0!3m2!1sen!2sng!4v1630000000000!5m2!1sen!2sng" 
          width="100%" 
          height="100%" 
          style={{ border: 0 }} 
          allowFullScreen={false} 
          loading="lazy"
          title="Sohibul Minsor Location"
        ></iframe>
      </section>
    </div>
  );
}
