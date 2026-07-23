import React, { useState, useMemo, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Calendar, ChevronRight, ChevronLeft, ArrowRight, Tag, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageHero from '../components/PageHero';
import { NewsCategory, NewsPost } from '../types/news';
import { apiClient, hasApiConfig, getErrorMessage } from '../lib/apiClient';

const CATEGORIES: NewsCategory[] = [
  'All',
  'Visa',
  'Services',
  'Hajj & Umrah',
  'Scholarships',
  'Promotions',
  'Announcements',
  'Success Stories'
];

const ITEMS_PER_PAGE = 9;

export default function NewsPage() {
  const [activeCategory, setActiveCategory] = useState<NewsCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [newsPosts, setNewsPosts] = useState<NewsPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [email, setEmail] = useState('');

  // Use effect for SEO
  
  const [realNews, setRealNews] = useState<any[]>([]);
  const [realServices, setRealServices] = useState<any[]>([]);
  const [realScholarships, setRealScholarships] = useState<any[]>([]);
  const [realHajj, setRealHajj] = useState<any[]>([]);
  const [realTestimonials, setRealTestimonials] = useState<any[]>([]);

  useEffect(() => {
    document.title = "News & Updates | Sohibul Minsor Classic Ltd";
    setIsLoading(true);

    const unsubNews = apiClient.from('news').select('*').eq('status', 'Published').order('datePublished', { ascending: false }).subscribe(({ data }) => setRealNews(data || []));
    const unsubServices = apiClient.from('services').select('*').eq('status', 'Active').subscribe(({ data }) => setRealServices(data || []));
    const unsubScholarships = apiClient.from('scholarships').select('*').eq('status', 'Open').subscribe(({ data }) => setRealScholarships(data || []));
    const unsubHajj = apiClient.from('hajj_umrah_packages').select('*').eq('status', 'Open').subscribe(({ data }) => setRealHajj(data || []));
    const unsubTestimonials = apiClient.from('testimonials').select('*').eq('isPublished', true).subscribe(({ data }) => setRealTestimonials(data || []));

    return () => {
      if (unsubNews) unsubNews();
      if (unsubServices) unsubServices();
      if (unsubScholarships) unsubScholarships();
      if (unsubHajj) unsubHajj();
      if (unsubTestimonials) unsubTestimonials();
    };
  }, []);

  useEffect(() => {
    let allPosts = [...realNews];
    
    realServices.forEach(s => {
      allPosts.push({
        id: s.id,
        title: s.title,
        slug: `/services`,
        shortDescription: s.shortDescription || '',
        fullContent: s.fullDescription || '',
        category: 'Services',
        datePublished: s.created_at || new Date().toISOString(),
        author: 'Admin',
        featuredImage: s.image || 'https://images.unsplash.com/photo-1542314831-c6a4d14fe6a1?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80',
        status: 'Published'
      });
    });

    realScholarships.forEach(s => {
      allPosts.push({
        id: s.id,
        title: s.title,
        slug: `/scholarships`,
        shortDescription: s.shortDescription || `Study in ${s.country}`,
        fullContent: s.eligibility || '',
        category: 'Scholarships',
        datePublished: s.created_at || new Date().toISOString(),
        author: 'Admin',
        featuredImage: s.image || 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80',
        status: 'Published'
      });
    });

    realHajj.forEach(h => {
      allPosts.push({
        id: h.id,
        title: h.name,
        slug: `/hajj-umrah`,
        shortDescription: h.shortDescription || `${h.duration} package`,
        fullContent: h.description || '',
        category: 'Hajj & Umrah',
        datePublished: h.created_at || new Date().toISOString(),
        author: 'Admin',
        featuredImage: h.image || 'https://images.unsplash.com/photo-1565552643952-25064c5d5e23?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80',
        status: 'Published'
      });
    });

    realTestimonials.forEach(t => {
      allPosts.push({
        id: t.id,
        title: `Success Story: ${t.name}`,
        slug: '#',
        shortDescription: t.quote || '',
        fullContent: t.content || '',
        category: 'Success Stories',
        datePublished: t.created_at || new Date().toISOString(),
        author: t.name,
        featuredImage: t.image || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80',
        status: 'Published'
      });
    });

    allPosts.sort((a, b) => new Date(b.datePublished).getTime() - new Date(a.datePublished).getTime());
    
    setNewsPosts(allPosts);
    setIsLoading(false);
  }, [realNews, realServices, realScholarships, realHajj, realTestimonials]);


  // Simulating Api fetch / filtering
  const { featuredNews, filteredNews } = useMemo(() => {
    const publishedNews = newsPosts;
    
    // Find one featured post for the top section
    const featured = publishedNews.find(post => post.featured);
    
    // Exclude the featured post from the general list if we found one
    let filtered = featured 
      ? publishedNews.filter(post => post.id !== featured.id) 
      : [...publishedNews];

    // Apply category filter
    if (activeCategory !== 'All') {
      filtered = filtered.filter(post => post.category === activeCategory);
    }

    // Apply search filter (title, category, or short description)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(post => 
        post.title.toLowerCase().includes(query) ||
        post.category.toLowerCase().includes(query) ||
        (post.shortDescription && post.shortDescription.toLowerCase().includes(query)) ||
        post.fullContent.toLowerCase().includes(query)
      );
    }

    return {
      featuredNews: (activeCategory === 'All' && !searchQuery) ? featured : null,
      filteredNews: filtered
    };
  }, [activeCategory, searchQuery, newsPosts]);

  // Pagination logic
  const totalPages = Math.ceil(filteredNews.length / ITEMS_PER_PAGE);
  const currentNews = filteredNews.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 500, behavior: 'smooth' });
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const getPreviewText = (post: NewsPost) => {
    if (post.shortDescription && post.shortDescription.trim() !== '') {
      return (post.shortDescription || '').length > 150 ? (post.shortDescription || '').substring(0, 150) + '...' : (post.shortDescription || '');
    }
    const contentPreview = (post.fullContent || '').substring(0, 150);
    return contentPreview.length >= 150 ? contentPreview + '...' : contentPreview;
  };

  return (
    <div className="w-full bg-gray-50 pb-24">
      {/* Page Header */}
      <PageHero 
        title="News & Updates" 
        subtitle="Stay informed with the latest visa announcements, Hajj & Umrah updates, scholarship opportunities, travel news, promotions, and company announcements."
      />

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 -mt-8 relative z-20">
        
        {/* Search & Categories Bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-12 flex flex-col lg:flex-row gap-6 items-center justify-between">
          <div className="flex flex-wrap gap-2 justify-center lg:justify-start w-full lg:w-auto">
            {CATEGORIES.map(category => (
              <button
                key={category}
                onClick={() => {
                  setActiveCategory(category);
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeCategory === category
                    ? 'bg-primary-900 text-gold-400 shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-primary-100 hover:text-primary-900'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="relative w-full lg:w-72 shrink-0">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search news..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-colors"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Main Content Area (3 cols on desktop) */}
          <div className="lg:col-span-3 space-y-12">
            
            {/* Featured News */}
            {featuredNews && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl shadow-md border border-gray-100 overflow-hidden group flex flex-col md:flex-row"
              >
                <div className="w-full md:w-1/2 relative overflow-hidden h-72 md:h-auto">
                  <img 
                    src={featuredNews.featuredImage || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&q=80&w=800'} 
                    alt={featuredNews.title} 
                    className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-gold-500 text-primary-900 text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center uppercase tracking-wider">
                      <Star size={12} className="mr-1" /> Featured
                    </span>
                  </div>
                </div>
                <div className="w-full md:w-1/2 p-8 md:p-10 flex flex-col justify-center">
                  <div className="flex items-center space-x-4 mb-4 text-xs font-medium text-gray-500">
                    <span className="bg-primary-50 text-primary-900 px-3 py-1 rounded-full">{featuredNews.category}</span>
                    <span className="flex items-center"><Calendar size={14} className="mr-1.5" /> {formatDate(featuredNews.datePublished)}</span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-primary-900 mb-4 leading-tight group-hover:text-gold-600 transition-colors">
                    {featuredNews.title}
                  </h2>
                  <p className="text-gray-600 mb-8 leading-relaxed">
                    {featuredNews.shortDescription && featuredNews.shortDescription.trim() !== '' 
                      ? featuredNews.shortDescription 
                      : ((featuredNews.fullContent || '').length > 300 ? (featuredNews.fullContent || '').substring(0, 300) + '...' : (featuredNews.fullContent || ''))}
                  </p>
                  <Link to={`/news/${featuredNews.slug}`} className="inline-flex items-center text-primary-700 font-bold hover:text-gold-600 transition-colors mt-auto">
                    Read Full Story <ArrowRight size={18} className="ml-2 transform group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </motion.div>
            )}

            {/* News Grid */}
            {currentNews.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                  {currentNews.map((post, index) => (
                    <motion.article 
                      key={post.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-xl transition-all duration-300 flex flex-col h-full"
                    >
                      <div className="relative h-48 overflow-hidden">
                        <img 
                          src={post.featuredImage || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&q=80&w=800'} 
                          alt={post.title} 
                          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="absolute top-4 left-4">
                          <span className="bg-white/90 backdrop-blur-sm text-primary-900 text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                            {post.category}
                          </span>
                        </div>
                      </div>
                      <div className="p-6 flex flex-col flex-grow">
                        <div className="flex items-center text-xs text-gray-500 mb-3">
                          <Calendar size={14} className="mr-1.5" />
                          {formatDate(post.datePublished)}
                        </div>
                        <h3 className="text-lg font-bold text-primary-900 mb-3 leading-snug group-hover:text-gold-600 transition-colors">
                          {post.title}
                        </h3>
                        <p className="text-gray-600 text-sm mb-6 line-clamp-3">
                          {getPreviewText(post)}
                        </p>
                        <Link to={`/news/${post.slug}`} className="mt-auto inline-flex items-center text-sm font-bold text-primary-700 hover:text-gold-600 transition-colors">
                          Read More <ChevronRight size={16} className="ml-1 transform group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </div>
                    </motion.article>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-50 mb-4">
                  <Search size={24} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-bold text-primary-900 mb-2">No News Found</h3>
                <p className="text-gray-500">We couldn't find any articles matching your current filters.</p>
                <button 
                  onClick={() => { setActiveCategory('All'); setSearchQuery(''); }}
                  className="mt-6 px-6 py-2 bg-primary-50 text-primary-700 font-medium rounded-lg hover:bg-primary-100 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 pt-8">
                <button 
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="w-10 h-10 rounded-full flex items-center justify-center border border-gray-200 text-gray-600 hover:bg-primary-50 hover:text-primary-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={18} />
                </button>
                
                {Array.from({ length: totalPages }).map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => handlePageChange(idx + 1)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-medium transition-colors ${
                      currentPage === idx + 1
                        ? 'bg-primary-900 text-white'
                        : 'border border-gray-200 text-gray-600 hover:bg-primary-50 hover:text-primary-900'
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}

                <button 
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="w-10 h-10 rounded-full flex items-center justify-center border border-gray-200 text-gray-600 hover:bg-primary-50 hover:text-primary-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </div>

          {/* Sidebar (Desktop only) */}
          <div className="hidden lg:block lg:col-span-1 space-y-8">
            {/* Sidebar Categories */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-primary-900 mb-4 pb-4 border-b border-gray-100 flex items-center">
                <Tag size={18} className="mr-2 text-gold-500" /> Categories
              </h3>
              <ul className="space-y-3">
                {CATEGORIES.slice(1).map(category => {
                  const count = newsPosts.filter(n => n.category === category && n.status === 'Published').length;
                  return (
                    <li key={category}>
                      <button 
                        onClick={() => { setActiveCategory(category); setCurrentPage(1); }}
                        className={`w-full flex items-center justify-between text-sm group ${
                          activeCategory === category ? 'text-primary-900 font-bold' : 'text-gray-600 hover:text-primary-900'
                        }`}
                      >
                        <span className="flex items-center transition-transform group-hover:translate-x-1">
                          <ChevronRight size={14} className={`mr-1 ${activeCategory === category ? 'text-gold-500' : 'text-gray-400 group-hover:text-gold-500'}`} />
                          {category}
                        </span>
                        <span className="bg-gray-50 text-gray-500 text-xs py-0.5 px-2 rounded-full border border-gray-100">
                          {count}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Popular/Recent Posts Sidebar Widget */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-primary-900 mb-4 pb-4 border-b border-gray-100">
                Recent Announcements
              </h3>
              <div className="space-y-4">
                {newsPosts.filter(n => n.category === 'Announcements').slice(0, 3).map(post => (
                  <Link to={`/news/${post.slug}`} key={post.id} className="flex space-x-3 group">
                    <img 
                      src={post.featuredImage || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&q=80&w=800'} 
                      alt="" 
                      className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                      loading="lazy"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-primary-900 leading-snug group-hover:text-gold-600 transition-colors line-clamp-2">
                        {post.title}
                      </h4>
                      <span className="text-xs text-gray-500 mt-1 block">{formatDate(post.datePublished)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
        <div className="bg-primary-900 rounded-3xl p-8 md:p-12 text-center shadow-xl relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none"></div>
          <div className="relative z-10">
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-white mb-4">Stay Updated</h2>
            <p className="text-white mb-8 max-w-xl mx-auto">
              Receive the latest visa updates, Hajj & Umrah packages, scholarship opportunities and travel news directly in your inbox.
            </p>
            <form className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto" onSubmit={async (e) => {
              e.preventDefault();
              if (!email) return;
              
              setIsSubscribing(true);
              try {

                const { error } = await apiClient.from('subscribers').insert([
                  { email, status: 'Active' }
                ]);
                
                if (error) {
                  if (error.code === '23505' || error.message?.includes('unique') || error.message?.includes('duplicate')) {
                    toast.error('This email is already subscribed.');
                    setIsSubscribing(false);
                    return;
                  }
                  throw error;
                }
                
                try {
                  // Run in background without awaiting, or await it but don't show email-specific toasts
                  apiClient.functions.invoke("send-mail", {
                    body: {
                      type: "welcome",
                      payload: { email }
                    }
                  }).catch(emailErr => {
                    console.error('Welcome email error:', emailErr);
                  });
                  
                  toast.success('Subscription successful.');
                } catch (err) {
                  // In case synchronous error happens
                  toast.success('Subscription successful.');
                }
                
                setEmail('');
              } catch (error: any) {
                console.error('Subscription error:', error);
                toast.error(getErrorMessage(error, 'Failed to subscribe. Please try again later.'));
              } finally {
                setIsSubscribing(false);
              }
            }}>
              <input 
                type="email" 
                placeholder="Enter your email address" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubscribing}
                className="flex-grow bg-white/10 border border-white/20 rounded-xl px-5 py-4 text-white placeholder-primary-200 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-colors"
              />
              <button 
                type="submit"
                disabled={isSubscribing}
                className="bg-gold-500 text-primary-900 font-bold rounded-xl px-8 py-4 hover:bg-gold-400 transition-colors whitespace-nowrap shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubscribing ? 'Subscribing...' : 'Subscribe'}
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
