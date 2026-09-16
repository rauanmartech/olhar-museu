import { createClient } from "@supabase/supabase-js";
import {
  Post,
  Author,
  Category,
  Museum,
  Tag,
  Media,
  FilterParams,
  PaginatedPosts,
} from "@/types/editorial";
import {
  mockPosts,
  mockCategories,
  mockMuseums,
  mockTags,
} from "@/data/mockData";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy";

// Instância reutilizada para evitar múltiplos GoTrueClients
let supabaseClientInstance: ReturnType<typeof createClient> | null = null;

function getSupabase() {
  if (!supabaseClientInstance) {
    supabaseClientInstance = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: typeof window !== "undefined",
        autoRefreshToken: typeof window !== "undefined",
      },
    });
  }
  return supabaseClientInstance;
}

// Converte linha crua do banco para o tipo Post do front-end
function mapPost(row: any): Post {
  const supabase = getSupabase();

  const mediaRow = row.featured_image as any;
  const publicUrl = mediaRow
    ? supabase.storage.from(mediaRow.bucket || "olhar-museu").getPublicUrl(mediaRow.path).data.publicUrl
    : "";

  const featured_image: Media = {
    id: mediaRow?.id || "",
    filename: mediaRow?.filename || "",
    original_name: mediaRow?.original_name || mediaRow?.filename || "",
    bucket: mediaRow?.bucket || "olhar-museu",
    path: mediaRow?.path || "",
    url: publicUrl,
    mime_type: mediaRow?.mime_type || "image/jpeg",
    size_bytes: mediaRow?.size_bytes || 0,
    width: mediaRow?.width || undefined,
    height: mediaRow?.height || undefined,
    alt_text: mediaRow?.alt_text || undefined,
    caption: mediaRow?.caption || undefined,
  };

  const authorRow = row.author as any;
  const author: Author = {
    id: authorRow?.id || "",
    name: authorRow?.name || "Redação",
    email: authorRow?.email || "",
    avatar_url: authorRow?.avatar_url || undefined,
    bio: authorRow?.bio || undefined,
    role: authorRow?.role || "JOURNALIST",
  };

  const catRow = row.category as any;
  const category: Category = {
    id: catRow?.id || "",
    name: catRow?.name || "",
    slug: catRow?.slug || "",
    description: catRow?.description || undefined,
    sort_order: catRow?.sort_order || 0,
    active: catRow?.active !== undefined ? catRow.active : true,
  };

  const musRow = row.museum as any;
  const museum: Museum | undefined = musRow
    ? {
        id: musRow.id,
        name: musRow.name,
        slug: musRow.slug,
        description: musRow.description || undefined,
        address: musRow.address || undefined,
        website: musRow.website || undefined,
        image_url: "",
        active: musRow.active !== undefined ? musRow.active : true,
      }
    : undefined;

  const tags: Tag[] = (row.tags || []).map((t: any) => ({
    id: t.id,
    name: t.name,
    slug: t.slug,
  }));

  return {
    id: row.id,
    title: row.title,
    subtitle: row.subtitle || undefined,
    slug: row.slug,
    excerpt: row.excerpt || "",
    content: row.content,
    status: row.status,
    author,
    category,
    museum,
    featured_image,
    tags,
    reading_time_minutes: row.reading_time_minutes || 3,
    views: row.views || 0,
    featured: row.featured || false,
    featured_position: row.featured_position || undefined,
    seo_title: row.seo_title || undefined,
    seo_description: row.seo_description || undefined,
    canonical_url: row.canonical_url || undefined,
    published_at: row.published_at || row.created_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

const POST_SELECT = `
  *,
  author:users!posts_author_id_fkey(id, name, email, avatar_url, bio, role),
  category:categories!posts_category_id_fkey(id, name, slug, description, sort_order, active),
  museum:museums!posts_museum_id_fkey(id, name, slug, description, address, website, active),
  featured_image:media!posts_featured_image_id_fkey(id, filename, path, bucket, mime_type, size_bytes, width, height, alt_text, caption),
  tags:post_tags(tag:tags(id, name, slug))
`;

function flattenTags(raw: any): any {
  return {
    ...raw,
    tags: (raw.tags || []).map((pt: any) => pt.tag).filter(Boolean),
  };
}

export class EditorialService {
  /**
   * Retorna os destaques editoriais da home (Super Manchete + Destaques Secundários)
   */
  static async getFeaturedPosts(): Promise<{ lead: Post | null; secondary: Post[] }> {
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from("posts")
        .select(POST_SELECT)
        .eq("status", "PUBLISHED")
        .eq("featured", true)
        .order("featured_position", { ascending: true })
        .limit(4);

      if (!error && data && data.length > 0) {
        const posts = data.map((r) => mapPost(flattenTags(r)));
        const lead = posts.find((p) => p.featured_position === 1) || posts[0] || null;
        const secondary = posts.filter((p) => p.id !== lead?.id).slice(0, 3);
        return { lead, secondary };
      }
    } catch {
      // Fallback
    }

    // Fallback Mock Data
    const fallbackLead =
      mockPosts.find((p) => p.featured && p.featured_position === 1) || mockPosts[0] || null;
    const fallbackSecondary = mockPosts
      .filter((p) => p.id !== fallbackLead?.id && p.featured)
      .slice(0, 3);

    return {
      lead: fallbackLead,
      secondary: fallbackSecondary.length > 0 ? fallbackSecondary : mockPosts.slice(1, 4),
    };
  }

  /**
   * Retorna as últimas notícias em ordem cronológica
   */
  static async getLatestPosts(limit: number = 6, excludeIds: string[] = []): Promise<Post[]> {
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from("posts")
        .select(POST_SELECT)
        .eq("status", "PUBLISHED")
        .order("published_at", { ascending: false })
        .limit(limit + excludeIds.length);

      if (!error && data && data.length > 0) {
        return data
          .map((r) => mapPost(flattenTags(r)))
          .filter((p) => !excludeIds.includes(p.id))
          .slice(0, limit);
      }
    } catch {
      // Fallback
    }

    // Fallback Mock Data
    return mockPosts
      .filter((p) => !excludeIds.includes(p.id))
      .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime())
      .slice(0, limit);
  }

  /**
   * Retorna uma notícia específica pelo seu slug
   */
  static async getPostBySlug(slug: string): Promise<Post | null> {
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from("posts")
        .select(POST_SELECT)
        .eq("slug", slug)
        .eq("status", "PUBLISHED")
        .maybeSingle();

      if (!error && data) {
        return mapPost(flattenTags(data));
      }
    } catch {
      // Fallback
    }

    // Fallback Mock Data
    return mockPosts.find((p) => p.slug === slug) || null;
  }

  /**
   * Retorna notícias paginadas e filtradas
   */
  static async getFilteredPosts(params: FilterParams = {}): Promise<PaginatedPosts> {
    const {
      categorySlug,
      museumSlug,
      tagSlug,
      searchQuery,
      page = 1,
      limit = 9,
      sortBy = "recent",
    } = params;

    try {
      const supabase = getSupabase();
      let query = supabase
        .from("posts")
        .select(POST_SELECT, { count: "exact" })
        .eq("status", "PUBLISHED");

      if (categorySlug && categorySlug !== "todas") {
        const { data: cat } = (await supabase
          .from("categories")
          .select("id")
          .eq("slug", categorySlug)
          .maybeSingle()) as { data: any; error: any };
        if (cat?.id) query = query.eq("category_id", cat.id);
      }

      if (museumSlug) {
        const { data: mus } = (await supabase
          .from("museums")
          .select("id")
          .eq("slug", museumSlug)
          .maybeSingle()) as { data: any; error: any };
        if (mus?.id) query = query.eq("museum_id", mus.id);
      }

      if (searchQuery && searchQuery.trim()) {
        query = query.ilike("title", `%${searchQuery.trim()}%`);
      }

      if (sortBy === "popular") {
        query = query.order("views", { ascending: false });
      } else {
        query = query.order("published_at", { ascending: false });
      }

      const from = (page - 1) * limit;
      const { data, count, error } = await query.range(from, from + limit - 1);

      if (!error && data && data.length > 0) {
        let posts = data.map((r) => mapPost(flattenTags(r)));

        if (tagSlug) {
          posts = posts.filter((p) => p.tags.some((t) => t.slug === tagSlug));
        }

        const total = count || posts.length;
        const totalPages = Math.ceil(total / limit);

        return {
          posts,
          total,
          currentPage: page,
          totalPages,
          hasMore: page < totalPages,
        };
      }
    } catch {
      // Fallback
    }

    // Fallback Mock Data Filtrado
    let filtered = [...mockPosts];

    if (categorySlug && categorySlug !== "todas") {
      filtered = filtered.filter((p) => p.category.slug === categorySlug);
    }

    if (museumSlug) {
      filtered = filtered.filter((p) => p.museum?.slug === museumSlug);
    }

    if (tagSlug) {
      filtered = filtered.filter((p) => p.tags.some((t) => t.slug === tagSlug));
    }

    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.subtitle?.toLowerCase().includes(q) ||
          p.excerpt.toLowerCase().includes(q)
      );
    }

    if (sortBy === "popular") {
      filtered.sort((a, b) => (b.views || 0) - (a.views || 0));
    } else {
      filtered.sort(
        (a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
      );
    }

    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const offset = (page - 1) * limit;
    const paginatedPosts = filtered.slice(offset, offset + limit);

    return {
      posts: paginatedPosts,
      total,
      currentPage: page,
      totalPages,
      hasMore: page < totalPages,
    };
  }

  /**
   * Retorna notícias relacionadas a uma notícia atual
   */
  static async getRelatedPosts(currentPost: Post, limit: number = 3): Promise<Post[]> {
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from("posts")
        .select(POST_SELECT)
        .eq("status", "PUBLISHED")
        .eq("category_id", currentPost.category.id)
        .neq("id", currentPost.id)
        .order("published_at", { ascending: false })
        .limit(limit);

      if (!error && data && data.length > 0) {
        return data.map((r) => mapPost(flattenTags(r)));
      }
    } catch {
      // Fallback
    }

    // Fallback Mock Data
    return mockPosts
      .filter((p) => p.category.slug === currentPost.category.slug && p.id !== currentPost.id)
      .slice(0, limit);
  }

  /**
   * Retorna todas as categorias ativas ordenadas
   */
  static async getCategories(): Promise<Category[]> {
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("active", true)
        .order("sort_order", { ascending: true });

      if (!error && data && data.length > 0) {
        return data.map((c: any) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          description: c.description || undefined,
          sort_order: c.sort_order,
          active: c.active,
        }));
      }
    } catch {
      // Fallback
    }

    return mockCategories;
  }

  /**
   * Retorna uma categoria por slug
   */
  static async getCategoryBySlug(slug: string): Promise<Category | null> {
    try {
      const supabase = getSupabase();
      const { data, error } = (await supabase
        .from("categories")
        .select("*")
        .eq("slug", slug)
        .eq("active", true)
        .maybeSingle()) as { data: any; error: any };

      if (!error && data) {
        return {
          id: data.id,
          name: data.name,
          slug: data.slug,
          description: data.description || undefined,
          sort_order: data.sort_order,
          active: data.active,
        };
      }
    } catch {
      // Fallback
    }

    return mockCategories.find((c) => c.slug === slug) || null;
  }

  /**
   * Retorna todos os museus cadastrados
   */
  static async getMuseums(): Promise<Museum[]> {
    try {
      const supabase = getSupabase();
      const { data, error } = (await supabase
        .from("museums")
        .select("*, featured_image:media!museums_featured_image_id_fkey(id, path, bucket, alt_text)")
        .eq("active", true)
        .order("name", { ascending: true })) as { data: any[]; error: any };

      if (!error && data && data.length > 0) {
        return data.map((m: any) => {
          const imgRow = m.featured_image as any;
          const imgUrl = imgRow
            ? supabase.storage.from(imgRow.bucket || "olhar-museu").getPublicUrl(imgRow.path).data.publicUrl
            : "";
          return {
            id: m.id,
            name: m.name,
            slug: m.slug,
            description: m.description || undefined,
            address: m.address || undefined,
            website: m.website || undefined,
            image_url: imgUrl,
            active: m.active,
          };
        });
      }
    } catch {
      // Fallback
    }

    return mockMuseums;
  }

  /**
   * Retorna um museu por slug
   */
  static async getMuseumBySlug(slug: string): Promise<Museum | null> {
    try {
      const supabase = getSupabase();
      const { data, error } = (await supabase
        .from("museums")
        .select("*, featured_image:media!museums_featured_image_id_fkey(id, path, bucket, alt_text)")
        .eq("slug", slug)
        .eq("active", true)
        .maybeSingle()) as { data: any; error: any };

      if (!error && data) {
        const imgRow = data.featured_image as any;
        const imgUrl = imgRow
          ? supabase.storage.from(imgRow.bucket || "olhar-museu").getPublicUrl(imgRow.path).data.publicUrl
          : "";
        return {
          id: data.id,
          name: data.name,
          slug: data.slug,
          description: data.description || undefined,
          address: data.address || undefined,
          website: data.website || undefined,
          image_url: imgUrl,
          active: data.active,
        };
      }
    } catch {
      // Fallback
    }

    return mockMuseums.find((m) => m.slug === slug) || null;
  }

  /**
   * Retorna todas as tags disponíveis
   */
  static async getTags(): Promise<Tag[]> {
    try {
      const supabase = getSupabase();
      const { data, error } = (await supabase
        .from("tags")
        .select("*")
        .order("name", { ascending: true })) as { data: any[]; error: any };

      if (!error && data && data.length > 0) {
        return data.map((t: any) => ({ id: t.id, name: t.name, slug: t.slug }));
      }
    } catch {
      // Fallback
    }

    return mockTags;
  }

  /**
   * Retorna uma tag por slug
   */
  static async getTagBySlug(slug: string): Promise<Tag | null> {
    try {
      const supabase = getSupabase();
      const { data, error } = (await supabase
        .from("tags")
        .select("*")
        .eq("slug", slug)
        .maybeSingle()) as { data: any; error: any };

      if (!error && data) {
        return { id: data.id, name: data.name, slug: data.slug };
      }
    } catch {
      // Fallback
    }

    return mockTags.find((t) => t.slug === slug) || null;
  }
}
