export type NewsCategory = 
  | 'All' 
  | 'Visa' 
  | 'Services'
  | 'Hajj & Umrah' 
  | 'Scholarships' 
  | 'Promotions' 
  | 'Announcements' 
  | 'Success Stories';

export interface NewsPost {
  id: string;
  title: string;
  slug: string;
  category: NewsCategory;
  featuredImage: string;
  shortDescription: string;
  fullContent: string;
  author: string;
  datePublished: string;
  featured: boolean;
  status: 'Draft' | 'Published';
  gallery?: string[];
}
