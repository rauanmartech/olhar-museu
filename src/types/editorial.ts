export type UserRole = 'ADMIN' | 'EDITOR' | 'JOURNALIST';

export type PostStatus = 'DRAFT' | 'REVIEW' | 'SCHEDULED' | 'PUBLISHED' | 'ARCHIVED';

export interface Author {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  bio?: string;
  role: UserRole;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  sort_order: number;
  active: boolean;
}

export interface Museum {
  id: string;
  name: string;
  slug: string;
  description?: string;
  address?: string;
  website?: string;
  image_url: string;
  active: boolean;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
}

export interface Media {
  id: string;
  filename: string;
  original_name: string;
  bucket: string;
  path: string;
  url: string;
  mime_type: string;
  size_bytes: number;
  width?: number;
  height?: number;
  alt_text?: string;
  caption?: string;
}

export interface ArticleBlock {
  type: 'paragraph' | 'heading' | 'quote' | 'image' | 'list';
  level?: 2 | 3 | 4;
  content?: string;
  items?: string[];
  src?: string;
  alt?: string;
  caption?: string;
  author?: string;
}

export interface Post {
  id: string;
  title: string;
  subtitle?: string;
  slug: string;
  excerpt: string;
  content: {
    blocks: ArticleBlock[];
  } | string;
  status: PostStatus;
  
  author: Author;
  category: Category;
  museum?: Museum;
  featured_image: Media;
  tags: Tag[];
  
  reading_time_minutes: number;
  views: number;
  featured: boolean;
  featured_position?: number; // 1 = Super Manchete, 2, 3, 4 = Destaques secundários
  
  seo_title?: string;
  seo_description?: string;
  canonical_url?: string;
  
  published_at: string;
  created_at: string;
  updated_at: string;
}

export interface FilterParams {
  categorySlug?: string;
  museumSlug?: string;
  tagSlug?: string;
  searchQuery?: string;
  page?: number;
  limit?: number;
  sortBy?: 'recent' | 'popular';
}

export interface PaginatedPosts {
  posts: Post[];
  total: number;
  currentPage: number;
  totalPages: number;
  hasMore: boolean;
}
