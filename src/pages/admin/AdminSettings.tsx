import React, { useState, useEffect } from 'react';
import { Save, Loader2, Image as ImageIcon } from 'lucide-react';
import { apiClient } from '../../lib/apiClient';
import toast from 'react-hot-toast';
import ImageUpload from '../../components/ImageUpload';

interface SiteSettings {
  id: string;
  heroImageHome: string;
  heroImageAbout: string;
  heroImageServices: string;
  heroImageHajjUmrah: string;
  heroImageScholarships: string;
  heroImageNews: string;
  heroImageContact: string;
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
}

const defaultSettings: SiteSettings = {
  id: 'global',
  heroImageHome: 'https://images.unsplash.com/photo-1542314831-c6a4d14fe6a1?w=1200&q=80',
  heroImageAbout: 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=1200&q=80',
  heroImageServices: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&q=80',
  heroImageHajjUmrah: 'https://images.unsplash.com/photo-1565552643952-b4b159f81156?w=1200&q=80',
  heroImageScholarships: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&q=80',
  heroImageNews: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1200&q=80',
  heroImageContact: 'https://images.unsplash.com/photo-1565552643982-2d1bb0e9b9bc?w=1200&q=80',
  contactEmail: 'info@sohibulminsorclassic.com',
  contactPhone: '+1 234 567 8900',
  contactAddress: 'Shop B3, Emirate Plaza, Opposite Abanik Filling Station, Saw Mill Area, Ilorin, Kwara State, Nigeria.'
};

export default function AdminSettings() {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setIsLoading(true);
    const { data, error } = await apiClient.from('settings').select('*').eq('id', 'global').single().execute();
    if (data) {
      setSettings(data as SiteSettings);
    }
    setIsLoading(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    const toastId = toast.loading('Saving settings...');
    
    try {
      // Upsert the settings
      const { data, error } = await apiClient.from('settings').select('*').eq('id', 'global').single().execute();
      
      if (data) {
        await apiClient.from('settings').update(settings).eq('id', 'global').execute();
      } else {
        await apiClient.from('settings').insert({ ...settings, id: 'global' }).execute();
      }
      
      toast.success('Settings saved successfully', { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error('Failed to save settings', { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-gold-500" />
      </div>
    );
  }

  const ImageSetting = ({ label, field }: { label: string, field: keyof SiteSettings }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
      <ImageUpload 
        value={settings[field] as string} 
        onChange={(url) => setSettings({ ...settings, [field]: url })} 
        folder="hero-banners" 
      />
    </div>
  );

  return (
    <div className="space-y-6 pb-12">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-primary-900 dark:text-white">System Settings</h1>
          <p className="text-gray-500 dark:text-gray-400">Configure global website settings and hero banners.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center px-4 py-2 bg-gold-600 text-white rounded-lg hover:bg-gold-700 transition-colors disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
          Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-bold text-primary-900 dark:text-white mb-4 border-b border-gray-100 dark:border-gray-700 pb-4 flex items-center">
              <ImageIcon className="w-5 h-5 mr-2 text-gold-500" />
              Hero Banners (Page Headers)
            </h3>
            <div className="space-y-6">
              <ImageSetting label="Home Page Hero" field="heroImageHome" />
              <ImageSetting label="About Us Hero" field="heroImageAbout" />
              <ImageSetting label="Services Hero" field="heroImageServices" />
              <ImageSetting label="Hajj & Umrah Hero" field="heroImageHajjUmrah" />
              <ImageSetting label="Scholarships Hero" field="heroImageScholarships" />
              <ImageSetting label="News & Updates Hero" field="heroImageNews" />
              <ImageSetting label="Contact Us Hero" field="heroImageContact" />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-bold text-primary-900 dark:text-white mb-4 border-b border-gray-100 dark:border-gray-700 pb-4">
              Contact Information
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Support Email</label>
                <input
                  type="email"
                  value={settings.contactEmail}
                  onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-gold-500 text-primary-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={settings.contactPhone}
                  onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-gold-500 text-primary-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Office Address</label>
                <textarea
                  value={settings.contactAddress}
                  onChange={(e) => setSettings({ ...settings, contactAddress: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-gold-500 text-primary-900 dark:text-white"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
