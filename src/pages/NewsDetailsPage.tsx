import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Calendar, User, Share2, Facebook, Instagram, ChevronLeft, ChevronRight } from 'lucide-react';
import { NewsPost } from '../types/news';
import { apiClient, hasApiConfig } from '../lib/apiClient';

export default function NewsDetailsPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<NewsPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<NewsPost[]>([]);
  const [prevPost, setPrevPost] = useState<NewsPost | null>(null);
  const [nextPost, setNextPost] = useState<NewsPost | null>(null);

  useEffect(() => {
    fetchPostDetails();
  }, [slug, navigate]);

  const fetchPostDetails = async () => {
    

    try {
      // Fetch the specific post by slug
      const { data: postData, error: postError } = await apiClient
        .from('news')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'Published')
        .single();

      if (postError || !postData) {
        navigate('/news');
        return;
      }

      setPost(postData);
      document.title = `${postData.title} | Sohibul Minsor Classic`;

      // Fetch related posts (same category, excluding current)
      const { data: relatedData, error: relatedError } = await apiClient
        .from('news')
        .select('*')
        .eq('category', postData.category)
        .eq('status', 'Published')
        .neq('id', postData.id)
        .limit(3);
        
      if (!relatedError && relatedData) {
        setRelatedPosts(relatedData);
      }

      // We won't strictly implement next/prev posts via DB in this basic setup 
      // without knowing the exact ordering, but typically you'd fetch the chronologically next/prev item.
      // We will skip prevPost/nextPost for now to keep it simple and robust.

    } catch (error) {
      console.error('Error fetching post details:', error);
      navigate('/news');
    }

    window.scrollTo(0, 0);
  };

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-500"></div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const shareUrl = window.location.href;

  return (
    <div className="w-full bg-gray-50 pb-24 pt-32">
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link 
          to="/news" 
          className="inline-flex items-center text-primary-700 hover:text-gold-600 font-medium mb-8 transition-colors"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to News
        </Link>

        {/* Header */}
        <header className="mb-10 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center space-x-4 mb-6 text-sm text-gray-500"
          >
            <span className="bg-primary-50 text-primary-900 px-3 py-1 rounded-full font-semibold">
              {post.category}
            </span>
            <span className="flex items-center">
              <Calendar size={16} className="mr-1.5" />
              {formatDate(post.datePublished)}
            </span>
            <span className="flex items-center hidden sm:flex">
              <User size={16} className="mr-1.5" />
              {post.author}
            </span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-primary-900 leading-tight mb-6"
          >
            {post.title}
          </motion.h1>
        </header>

        {/* Featured Image */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="relative w-full h-[400px] md:h-[500px] rounded-3xl overflow-hidden mb-12 shadow-xl"
        >
          <img 
            src={post.featuredImage || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&q=80&w=800'} 
            alt={post.title} 
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </motion.div>

        {/* Content */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-12 mb-12"
        >
          <div className="prose prose-lg max-w-none text-gray-700">
            {post.fullContent.split('\n\n').map((paragraph, index) => (
              <p key={index} className="mb-6 leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>

          {/* Gallery (if available) */}
          {post.gallery && post.gallery.length > 0 && (
            <div className="mt-12">
              <h3 className="text-2xl font-bold text-primary-900 mb-6">Gallery</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {post.gallery.map((img, idx) => (
                  <div key={idx} className="h-48 rounded-xl overflow-hidden shadow-sm bg-gray-100 dark:bg-gray-800">
                    {img && <img src={img} alt={`Gallery image ${idx + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" loading="lazy" />}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Share Section */}
          <div className="mt-12 pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between">
            <h4 className="text-lg font-bold text-primary-900 mb-4 sm:mb-0 flex items-center">
              <Share2 size={20} className="mr-2" /> Share this article
            </h4>
            <div className="flex space-x-4">
              <a 
                href={`https://wa.me/?text=${encodeURIComponent(post.title + ' ' + shareUrl)}`}
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center hover:bg-green-600 hover:text-white transition-colors"
              >
                <Share2 size={18} />
              </a>
              <a 
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors"
              >
                <Facebook size={18} />
              </a>
              <a 
                href="https://instagram.com/sohibulminsor1"
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center hover:bg-gradient-to-tr hover:from-[#FD1D1D] hover:via-[#E1306C] hover:to-[#833AB4] hover:text-white transition-colors"
              >
                <Instagram size={18} />
              </a>
              <a 
                href="https://www.tiktok.com/@sohibulminsor"
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center hover:bg-black hover:text-white transition-colors"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a5.64 5.64 0 0 1-1.04-.1z" />
                </svg>
              </a>
            </div>
          </div>
        </motion.div>

        {/* Prev / Next Posts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {prevPost ? (
            <Link 
              to={`/news/${prevPost.slug}`}
              className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group flex items-center"
            >
              <div className="mr-4 w-12 h-12 rounded-full bg-primary-50 text-primary-900 flex items-center justify-center group-hover:bg-gold-500 transition-colors">
                <ChevronLeft size={24} />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Previous Article</p>
                <h4 className="text-sm font-bold text-primary-900 line-clamp-2">{prevPost.title}</h4>
              </div>
            </Link>
          ) : <div></div>}
          
          {nextPost ? (
            <Link 
              to={`/news/${nextPost.slug}`}
              className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group flex items-center justify-end text-right"
            >
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Next Article</p>
                <h4 className="text-sm font-bold text-primary-900 line-clamp-2">{nextPost.title}</h4>
              </div>
              <div className="ml-4 w-12 h-12 rounded-full bg-primary-50 text-primary-900 flex items-center justify-center group-hover:bg-gold-500 transition-colors">
                <ChevronRight size={24} />
              </div>
            </Link>
          ) : <div></div>}
        </div>
      </article>

      {/* Related News */}
      {relatedPosts.length > 0 && (
        <section className="bg-white py-16 border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-3xl font-bold text-primary-900">Related News</h2>
              <Link to="/news" className="hidden sm:flex items-center text-primary-700 hover:text-gold-600 font-bold">
                View All <ArrowLeft className="ml-2 rotate-180" size={20} />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedPosts.map((related) => (
                <Link 
                  to={`/news/${related.slug}`} 
                  key={related.id}
                  className="bg-gray-50 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col h-full"
                >
                  <div className="h-48 overflow-hidden relative">
                    <img 
                      src={related.featuredImage || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&q=80&w=800'} 
                      alt={related.title} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      loading="lazy"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="bg-white/90 backdrop-blur-sm text-primary-900 text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                        {related.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex items-center text-xs text-gray-500 mb-3">
                      <Calendar size={14} className="mr-1.5" />
                      {formatDate(related.datePublished)}
                    </div>
                    <h3 className="text-lg font-bold text-primary-900 mb-3 leading-snug group-hover:text-gold-600 transition-colors line-clamp-2">
                      {related.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
            <div className="mt-8 text-center sm:hidden">
              <Link to="/news" className="inline-flex items-center text-primary-700 hover:text-gold-600 font-bold">
                View All <ArrowLeft className="ml-2 rotate-180" size={20} />
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
