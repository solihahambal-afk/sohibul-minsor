import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Briefcase, 
  GraduationCap, 
  Image as ImageIcon, 
  MessageSquare, 
  Users, 
  Mail,
  Compass,
  ArrowUpRight,
  Clock,
  Plus,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Eye
} from 'lucide-react';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { apiClient, hasApiConfig, getErrorMessage } from '../../lib/apiClient';
import toast from 'react-hot-toast';

const StatCard = ({ title, value, icon: Icon, colorClass, delay }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow relative overflow-hidden group"
  >
    <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10 group-hover:scale-150 transition-transform duration-500 ${colorClass}`}></div>
    <div className="flex items-center justify-between mb-4 relative z-10">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${colorClass} bg-opacity-10 dark:bg-opacity-20`}>
        <Icon className={`w-6 h-6 ${colorClass.replace('bg-', 'text-').replace('-500', '-600')} dark:text-white`} />
      </div>
    </div>
    <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1 relative z-10">{title}</h3>
    <p className="text-3xl font-bold text-primary-900 dark:text-white relative z-10">{value}</p>
  </motion.div>
);

const QuickActionButton = ({ icon: Icon, label, onClick }: any) => (
  <button 
    onClick={onClick}
    className="flex flex-col items-center justify-center p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-gold-500 dark:hover:border-gold-500 transition-all group"
  >
    <div className="w-12 h-12 rounded-full bg-primary-50 dark:bg-gray-700 flex items-center justify-center text-primary-600 dark:text-primary-400 group-hover:bg-gold-500 group-hover:text-white transition-colors mb-3">
      <Icon size={24} />
    </div>
    <span className="text-sm font-bold text-primary-900 dark:text-white text-center">{label}</span>
  </button>
);

export default function AdminDashboard() {
  const { user } = useAdminAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [counts, setCounts] = useState({
    news: 0,
    services: 0,
    packages: 0,
    scholarships: 0,
    gallery: 0,
    testimonials: 0,
    subscribers: 0,
    messages: 0,
    activeSubscribers: 0
  });
  const [recentMessages, setRecentMessages] = useState<any[]>([]);
  const [latestSubscribers, setLatestSubscribers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000); // Update every minute
    return () => clearInterval(timer);
  }, []);

  
  useEffect(() => {
    setIsLoading(true);
    let n = 0, s = 0, p = 0, sc = 0, sub = 0, asub = 0, m = 0, t = 0;
    
    const updateCounts = () => {
      setCounts({
        news: n, services: s, packages: p, scholarships: sc, gallery: 0,
        testimonials: t, subscribers: sub, activeSubscribers: asub, messages: m
      });
    };

    const unsub1 = apiClient.from('news').select('*').subscribe(({ data }) => { if(data) { n = data.length; updateCounts(); } });
    const unsub2 = apiClient.from('services').select('*').subscribe(({ data }) => { if(data) { s = data.length; updateCounts(); } });
    const unsub3 = apiClient.from('hajj_umrah_packages').select('*').subscribe(({ data }) => { if(data) { p = data.length; updateCounts(); } });
    const unsub4 = apiClient.from('scholarships').select('*').subscribe(({ data }) => { if(data) { sc = data.length; updateCounts(); } });
    const unsub5 = apiClient.from('subscribers').select('*').subscribe(({ data }) => { 
      if(data) { 
        sub = data.length; 
        asub = data.filter(x => x.status === 'Active').length;
        setLatestSubscribers(data.slice(0, 5));
        updateCounts(); 
      } 
    });
    const unsub6 = apiClient.from('messages').select('*').subscribe(({ data }) => { 
      if(data) { 
        m = data.length; 
        setRecentMessages(data.slice(0, 5));
        updateCounts(); 
      } 
    });
    const unsub7 = apiClient.from('testimonials').select('*').subscribe(({ data }) => { if(data) { t = data.length; updateCounts(); } });
    
    setIsLoading(false);
    return () => {
      unsub1(); unsub2(); unsub3(); unsub4(); unsub5(); unsub6(); unsub7();
    };
  }, []);


  const stats = [
    { title: 'Total News', value: counts.news, icon: FileText, colorClass: 'bg-blue-500' },
    { title: 'Total Services', value: counts.services, icon: Briefcase, colorClass: 'bg-indigo-500' },
    { title: 'Hajj & Umrah Packages', value: counts.packages, icon: Compass, colorClass: 'bg-emerald-500' },
    { title: 'Scholarships', value: counts.scholarships, icon: GraduationCap, colorClass: 'bg-purple-500' },
    { title: 'Gallery Images', value: counts.gallery, icon: ImageIcon, colorClass: 'bg-pink-500' },
    { title: 'Testimonials', value: counts.testimonials, icon: MessageSquare, colorClass: 'bg-orange-500' },
    { title: 'Subscribers', value: counts.subscribers, icon: Users, colorClass: 'bg-cyan-500' },
    { title: 'Contact Messages', value: counts.messages, icon: Mail, colorClass: 'bg-red-500' },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary-900 dark:text-white mb-2">Welcome back, {user?.name || user?.email?.split('@')[0]}</h1>
          <p className="text-gray-500 dark:text-gray-400">Here's what's happening with your website today.</p>
        </div>
        <div className="flex flex-col items-start md:items-end bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
            {currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          <p className="text-2xl font-bold text-primary-900 dark:text-white flex items-center">
            <Clock size={20} className="mr-2 text-gold-500" />
            {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4"
      >
        <QuickActionButton icon={FileText} label="Add News" />
        <QuickActionButton icon={Briefcase} label="Add Service" />
        <QuickActionButton icon={Compass} label="Add Hajj Pkg" />
        <QuickActionButton icon={GraduationCap} label="Add Scholarship" />
        <QuickActionButton icon={MessageSquare} label="Add Testimonial" />
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatCard key={stat.title} {...stat} delay={index * 0.05} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Contact Messages */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col"
        >
          <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-primary-900 dark:text-white">Recent Contact Messages</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Latest inquiries</p>
            </div>
            <button className="text-sm font-medium text-gold-600 hover:text-gold-700 flex items-center">
              View All <ArrowRight size={16} className="ml-1" />
            </button>
          </div>
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900/50">
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Sender</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Subject</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {recentMessages.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                      No records found.
                    </td>
                  </tr>
                ) : recentMessages.map((msg, i) => (
                  <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-primary-900 dark:text-white">{msg.name}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{msg.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-1">{msg.subject}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(msg.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 inline-flex text-xs font-semibold rounded-full ${
                        msg.status === 'Unread' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                        msg.status === 'Replied' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {msg.status || 'Unread'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-primary-600 hover:text-gold-600 bg-primary-50 dark:bg-gray-700 p-2 rounded-lg transition-colors">
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Subscriber Summary & Latest Activity */}
        <div className="flex flex-col gap-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700"
          >
            <h2 className="text-lg font-bold text-primary-900 dark:text-white mb-6">Subscriber Summary</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-600">
                <div className="flex items-center text-gray-600 dark:text-gray-300">
                  <Users size={18} className="mr-2 text-primary-600 dark:text-primary-400" /> Total
                </div>
                <span className="font-bold text-primary-900 dark:text-white">{counts.subscribers}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-600">
                <div className="flex items-center text-gray-600 dark:text-gray-300">
                  <CheckCircle2 size={18} className="mr-2 text-blue-500" /> Active
                </div>
                <span className="font-bold text-primary-900 dark:text-white">{counts.activeSubscribers}</span>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
              <h3 className="text-sm font-bold text-primary-900 dark:text-white mb-4">Latest Subscribers</h3>
              <div className="space-y-3">
                {latestSubscribers.length === 0 ? (
                  <p className="text-sm text-gray-500">No records found.</p>
                ) : latestSubscribers.map((sub, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400 truncate pr-4">{sub.email}</span>
                    <span className="text-xs text-gray-400 whitespace-nowrap">
                      {new Date(sub.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
              <Link to="/admin/subscribers" className="block w-full mt-4 text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-gold-600 text-center">
                View All Subscribers
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
