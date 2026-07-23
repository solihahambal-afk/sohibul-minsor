import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Search, Edit2, Trash2, Eye, FileText, CheckCircle, Clock, Star, StarOff, Copy, Filter, Image as ImageIcon } from 'lucide-react';
import { NewsPost, NewsCategory } from '../../types/news';
import toast from 'react-hot-toast';
import AdminNewsForm from './AdminNewsForm';
import { apiClient, hasApiConfig, getErrorMessage } from '../../lib/apiClient';
import { sendNewsletterIfPublished } from '../../lib/sendNewsletter';

export default function AdminNews() {
  const [view, setView] = useState<'list' | 'form'>('list');
  const [editingPost, setEditingPost] = useState<NewsPost | null>(null);
  
  const [posts, setPosts] = useState<NewsPost[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All Categories');
  const [statusFilter, setStatusFilter] = useState<string>('All Status');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
  const [isLoading, setIsLoading] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = apiClient.from('news').select('*').order('datePublished', { ascending: false })
      .subscribe(({ data, error }) => {
        setIsLoading(false);
        if (error) {
          console.error('Error fetching data:', error);
          // toast.error('Database connection error');
        } else if (data) {
          setPosts(data);
        }
      });
    return () => { if (unsubscribe) unsubscribe(); };
  }, []);

  // Stats
  const totalNews = posts.length;
  const publishedNews = posts.filter(p => p.status === 'Published').length;
  const draftNews = posts.filter(p => p.status === 'Draft').length;
  const featuredNews = posts.filter(p => p.featured).length;

  const StatCard = ({ title, value, icon: Icon, colorClass }: any) => (
    <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center space-x-4">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${colorClass} bg-opacity-10 dark:bg-opacity-20`}>
        <Icon className={`w-6 h-6 ${colorClass.replace('bg-', 'text-').replace('-500', '-600')} dark:text-white`} />
      </div>
      <div>
        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">{title}</p>
        <p className="text-2xl font-bold text-primary-900 dark:text-white">{value}</p>
      </div>
    </div>
  );

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this article? This action cannot be undone.')) {
      if (true) {
        try {
          const { error } = await apiClient.from('news').delete().eq('id', id);
          if (error) throw error;
        } catch (error: any) {
          console.error('Error deleting news:', error);
          toast.error('Failed to delete article from database.');
          return;
        }
      }
      
      toast.success('Article deleted successfully');
      if (view === 'form') setView('list');
    }
  };

  const handleToggleFeatured = async (id: string) => {
    const postToUpdate = posts.find(p => p.id === id);
    if (!postToUpdate) return;
    
    const newFeatured = !postToUpdate.featured;
    
    if (true) {
      try {
        const { error } = await apiClient.from('news').update({ featured: newFeatured }).eq('id', id);
        if (error) throw error;
      } catch (error: any) {
        console.error('Error toggling featured status:', error);
        toast.error('Failed to update article status.');
        return;
      }
    }
    
    setPosts(posts.map(p => {
      if (p.id === id) {
        toast.success(`Article ${newFeatured ? 'featured' : 'unfeatured'} successfully`);
        return { ...p, featured: newFeatured };
      }
      return p;
    }));
  };

  const handleDuplicate = async (post: NewsPost) => {
    const newPost: Partial<NewsPost> = {
      title: `${post.title} (Copy)`,
      slug: `${post.slug}-copy-${Math.floor(Math.random() * 1000)}`,
      category: post.category,
      featuredImage: post.featuredImage,
      shortDescription: post.shortDescription,
      fullContent: post.fullContent,
      author: post.author,
      status: 'Draft',
      featured: false,
      datePublished: new Date().toISOString(),
      gallery: post.gallery || []
    };
    
    if (true) {
      try {
        const { data, error } = await apiClient.from('news').insert([newPost]).select().single();
        if (error) throw error;
        
        toast.success('Article duplicated to Drafts');
      } catch (error: any) {
        console.error('Error duplicating article:', error);
        toast.error('Failed to duplicate article in database.');
      }
    } else {
      const generatedPost = {
        ...newPost,
        id: Math.random().toString(36).substr(2, 9)
      } as NewsPost;
      setPosts([generatedPost, ...posts]);
      toast.success('Article duplicated to Drafts');
    }
  };

  const handleSaveForm = async (data: Partial<NewsPost>) => {
    const dataToSave = {
      ...data,
      title: data.title || 'Untitled Article',
      slug: data.slug || `untitled-article-${Math.floor(Math.random() * 10000)}`
    };
    
    let savedPost = { ...dataToSave } as NewsPost;
    
    if (true) {
      try {
        if (editingPost) {
          const { data: resultData, error } = await apiClient.from('news').update(dataToSave).eq('id', editingPost.id).select().single();
          if (error) throw error;
          savedPost = resultData;
        } else {
          const { data: resultData, error } = await apiClient.from('news').insert([dataToSave]).select().single();
          if (error) {
            if (error.message?.includes('news_slug_key') || error.code === '23505') {
               // Try one more time with random suffix
               dataToSave.slug = `${dataToSave.slug}-${Math.floor(Math.random() * 10000)}`;
               const { data: retryData, error: retryError } = await apiClient.from('news').insert([dataToSave]).select().single();
               if (retryError) throw retryError;
               savedPost = retryData;
            } else {
              throw error;
            }
          } else {
            savedPost = resultData;
          }
        }
      } catch (error: any) {
        console.error('Error saving article:', error);
        toast.error(getErrorMessage(error, 'Database connection error.'));
        return;
      }
    } else {
      if (!editingPost) {
        savedPost.id = Math.random().toString(36).substr(2, 9);
      } else {
        savedPost.id = editingPost.id;
      }
    }

    if (editingPost) {
      
      toast.success('Article updated successfully');
    } else {
      
      toast.success('Article created successfully');
    }
    
    // Send newsletter if published
    if (savedPost) {
      sendNewsletterIfPublished('newsletter', savedPost.title, savedPost.shortDescription || savedPost.title, savedPost.status, editingPost?.status, savedPost?.featuredImage);
    }
    setView('list');
    setEditingPost(null);
  };

  const handleCancelForm = () => {
    setView('list');
    setEditingPost(null);
  };

  // Filter and Sort
  let filteredPosts = posts.filter(p => {
    const matchesSearch = (p.title || '').toLowerCase().includes((searchTerm || '').toLowerCase()) || (p.author || '').toLowerCase().includes((searchTerm || '').toLowerCase());
    const matchesCategory = categoryFilter === 'All Categories' || p.category === categoryFilter;
    const matchesStatus = statusFilter === 'All Status' || p.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  filteredPosts.sort((a, b) => {
    const dateA = new Date(a.datePublished).getTime();
    const dateB = new Date(b.datePublished).getTime();
    return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
  });

  // Pagination
  const totalPages = Math.ceil(filteredPosts.length / itemsPerPage);
  const currentPosts = filteredPosts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (view === 'form') {
    return (
      <AdminNewsForm 
        initialData={editingPost} 
        onSave={handleSaveForm} 
        onCancel={handleCancelForm}
        onDelete={editingPost ? () => handleDelete(editingPost.id) : undefined}
      />
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary-900 dark:text-white mb-2">News & Updates</h1>
          <p className="text-gray-500 dark:text-gray-400">Manage all company news, visa announcements, Hajj & Umrah updates, and promotions.</p>
        </div>
        <button 
          onClick={() => {
            setEditingPost(null);
            setView('form');
          }}
          className="inline-flex items-center justify-center px-6 py-3 bg-gold-500 text-primary-900 font-bold rounded-xl hover:bg-gold-400 transition-colors shadow-sm"
        >
          <Plus size={20} className="mr-2" />
          Add News
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total News" value={totalNews} icon={FileText} colorClass="bg-blue-500" />
        <StatCard title="Published News" value={publishedNews} icon={CheckCircle} colorClass="bg-green-500" />
        <StatCard title="Draft News" value={draftNews} icon={Clock} colorClass="bg-yellow-500" />
        <StatCard title="Featured News" value={featuredNews} icon={Star} colorClass="bg-gold-500" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden"
      >
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div className="relative max-w-md w-full shrink-0">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by title or author..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-primary-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:bg-white dark:focus:bg-gray-600 transition-colors"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter className="h-4 w-4 text-gray-400" />
              </div>
              <select 
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="pl-9 pr-8 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-sm text-primary-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-500 focus:bg-white dark:focus:bg-gray-600 appearance-none"
              >
                <option value="All Categories">All Categories</option>
                <option value="Visa">Visa</option>
                <option value="Hajj & Umrah">Hajj & Umrah</option>
                <option value="Scholarships">Scholarships</option>
                <option value="Promotions">Promotions</option>
                <option value="Announcements">Announcements</option>
                <option value="Success Stories">Success Stories</option>
              </select>
            </div>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-sm text-primary-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-500 focus:bg-white dark:focus:bg-gray-600"
            >
              <option value="All Status">All Status</option>
              <option value="Published">Published</option>
              <option value="Draft">Draft</option>
            </select>
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest')}
              className="px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-sm text-primary-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-500 focus:bg-white dark:focus:bg-gray-600"
            >
              <option value="newest">Sort by Date (Newest)</option>
              <option value="oldest">Sort by Date (Oldest)</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Article</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
              {currentPosts.length > 0 ? currentPosts.map((post) => (
                <tr key={post.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-12 w-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                        {post.featuredImage ? (
                          <img src={post.featuredImage} alt="" className="h-full w-full object-cover" loading="lazy" />
                        ) : (
                          <ImageIcon className="h-6 w-6 text-gray-400" />
                        )}
                      </div>
                      <div className="ml-4 max-w-xs xl:max-w-md">
                        <div className="text-sm font-bold text-primary-900 dark:text-white line-clamp-1 flex items-center">
                          {post.title}
                          {post.featured && <Star size={14} className="ml-2 text-gold-500 fill-gold-500 shrink-0" />}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">By {post.author}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300">
                      {post.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(post.datePublished).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      post.status === 'Published' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                    }`}>
                      {post.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button 
                        onClick={() => handleToggleFeatured(post.id)}
                        className={`p-2 rounded-lg transition-colors ${post.featured ? 'text-gold-500 hover:bg-gold-50 dark:hover:bg-gray-700' : 'text-gray-400 hover:text-gold-500 hover:bg-gray-50 dark:hover:bg-gray-700'}`} 
                        title={post.featured ? 'Unfeature' : 'Feature'}
                      >
                        {post.featured ? <StarOff size={18} /> : <Star size={18} />}
                      </button>
                      <button 
                        onClick={() => handleDuplicate(post)}
                        className="text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-gray-700 p-2 rounded-lg transition-colors" 
                        title="Duplicate"
                      >
                        <Copy size={18} />
                      </button>
                      <button 
                        onClick={() => {
                          setEditingPost(post);
                          setView('form');
                        }}
                        className="text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-gray-700 p-2 rounded-lg transition-colors" 
                        title="Edit"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        className="text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-gray-700 p-2 rounded-lg transition-colors" 
                        title="Delete"
                        onClick={() => handleDelete(post.id)}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <FileText size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                    <p className="text-gray-500 dark:text-gray-400 font-medium">No records found.</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Try adjusting your search or filters.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredPosts.length)} of {filteredPosts.length} entries
            </span>
            <div className="flex space-x-2">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
              >
                Previous
              </button>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
