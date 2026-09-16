import { createClient } from "@/utils/supabase/client";

export interface DatabaseUser {
  id: string;
  name: string;
  email: string;
  avatar_url?: string | null;
  bio?: string | null;
  role: "ADMIN" | "EDITOR" | "JOURNALIST";
  active: boolean;
  last_login_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface DatabaseMedia {
  id: string;
  filename: string;
  original_name: string;
  bucket: string;
  path: string;
  mime_type: string;
  size_bytes: number;
  width?: number | null;
  height?: number | null;
  alt_text?: string | null;
  caption?: string | null;
  uploaded_by?: string | null;
  created_at: string;
  updated_at: string;
  public_url?: string;
}

export interface DatabaseCategory {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  sort_order: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DatabaseMuseum {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  address?: string | null;
  website?: string | null;
  featured_image_id?: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
  featured_image?: DatabaseMedia | null;
}

export interface DatabaseTag {
  id: string;
  name: string;
  slug: string;
  created_at: string;
  updated_at: string;
}

export interface DatabasePost {
  id: string;
  title: string;
  subtitle?: string | null;
  slug: string;
  excerpt?: string | null;
  content: any;
  status: "DRAFT" | "REVIEW" | "SCHEDULED" | "PUBLISHED" | "ARCHIVED";
  author_id: string;
  category_id: string;
  museum_id?: string | null;
  featured_image_id?: string | null;
  reading_time_minutes: number;
  views: number;
  featured: boolean;
  featured_position?: number | null;
  seo_title?: string | null;
  seo_description?: string | null;
  canonical_url?: string | null;
  og_image_id?: string | null;
  published_at?: string | null;
  scheduled_at?: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  author?: DatabaseUser | null;
  category?: DatabaseCategory | null;
  museum?: DatabaseMuseum | null;
  featured_image?: DatabaseMedia | null;
  tags?: DatabaseTag[];
}

export class AdminEditorialService {
  /**
   * Helper que tenta primeiro no schema editorial e se der erro PGRST106 faz fallback para public
   */
  private static async getQueryTable(tableName: string) {
    const supabase = createClient();
    return supabase.from(tableName);
  }

  /**
   * Obtém o perfil editorial do usuário autenticado
   */
  static async getCurrentUserProfile(): Promise<DatabaseUser | null> {
    try {
      const supabase = createClient();
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) return null;

      const { data: profile } = await supabase
        
        .from("users")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      return {
        id: user.id,
        name: profile?.name || user.user_metadata?.name || user.email?.split("@")[0] || "Jornalista",
        email: user.email || "",
        avatar_url: profile?.avatar_url || user.user_metadata?.avatar_url || null,
        bio: profile?.bio || null,
        role: profile?.role || (user.user_metadata?.role as any) || "JOURNALIST",
        active: profile?.active !== undefined ? profile.active : true,
        created_at: user.created_at,
        updated_at: user.created_at,
      };
    } catch {
      return null;
    }
  }

  /**
   * Métricas para o Dashboard inicial
   */
  static async getDashboardMetrics() {
    const supabase = createClient();

    try {
      const [postsRes, publishedRes, draftsRes, mediaRes, museumsRes] = await Promise.all([
        supabase.from("posts").select("id", { count: "exact", head: true }),
        supabase.from("posts").select("id", { count: "exact", head: true }).eq("status", "PUBLISHED"),
        supabase.from("posts").select("id", { count: "exact", head: true }).eq("status", "DRAFT"),
        supabase.from("media").select("id", { count: "exact", head: true }),
        supabase.from("museums").select("id", { count: "exact", head: true }),
      ]);

      const { data: recentPosts } = await supabase
        
        .from("posts")
        .select(`
          id,
          title,
          slug,
          status,
          created_at,
          views,
          category:categories!posts_category_id_fkey(id, name)
        `)
        .order("created_at", { ascending: false })
        .limit(5);

      return {
        totalPosts: postsRes.count || 0,
        publishedPosts: publishedRes.count || 0,
        draftPosts: draftsRes.count || 0,
        totalMedia: mediaRes.count || 0,
        totalMuseums: museumsRes.count || 0,
        recentPosts: (recentPosts as any[]) || [],
      };
    } catch {
      return {
        totalPosts: 0,
        publishedPosts: 0,
        draftPosts: 0,
        totalMedia: 0,
        totalMuseums: 0,
        recentPosts: [],
      };
    }
  }

  /**
   * Listagem de posts com paginação e filtros
   */
  static async getPosts(params: {
    status?: string;
    categoryId?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const { status, categoryId, search, page = 1, limit = 10 } = params;
    const supabase = createClient();

    try {
      let query = supabase
        
        .from("posts")
        .select(`
          *,
          author:users!posts_author_id_fkey(id, name, email, avatar_url),
          category:categories!posts_category_id_fkey(id, name, slug),
          museum:museums!posts_museum_id_fkey(id, name, slug),
          featured_image:media!posts_featured_image_id_fkey(id, filename, path, bucket)
        `, { count: "exact" });

      if (status && status !== "ALL") {
        query = query.eq("status", status);
      }

      if (categoryId && categoryId !== "ALL") {
        query = query.eq("category_id", categoryId);
      }

      if (search && search.trim()) {
        query = query.ilike("title", `%${search.trim()}%`);
      }

      const from = (page - 1) * limit;
      const to = from + limit - 1;

      const { data, count, error } = await query
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) {
        // Retorna fallback limpo com aviso amigável
        return {
          posts: [],
          total: 0,
          page: 1,
          totalPages: 1,
          error: error.message || "Erro ao consultar o banco de dados.",
        };
      }

      return {
        posts: (data as DatabasePost[]) || [],
        total: count || 0,
        page,
        totalPages: Math.ceil((count || 0) / limit),
      };
    } catch (err: any) {
      return {
        posts: [],
        total: 0,
        page: 1,
        totalPages: 1,
        error: err?.message || "Falha na conexão com o Supabase.",
      };
    }
  }

  /**
   * Obter post único com todas as relações e tags
   */
  static async getPostById(id: string): Promise<DatabasePost | null> {
    try {
      const supabase = createClient();

      const { data: post, error } = await supabase
        
        .from("posts")
        .select(`
          *,
          author:users!posts_author_id_fkey(id, name, email, avatar_url),
          category:categories!posts_category_id_fkey(id, name, slug),
          museum:museums!posts_museum_id_fkey(id, name, slug),
          featured_image:media!posts_featured_image_id_fkey(id, filename, path, bucket)
        `)
        .eq("id", id)
        .maybeSingle();

      if (error || !post) return null;

      // Buscar tags do post
      const { data: postTags } = await supabase
        
        .from("post_tags")
        .select("tag_id, tag:tags(id, name, slug)")
        .eq("post_id", id);

      const tags = postTags?.map((pt: any) => pt.tag).filter(Boolean) || [];

      // Resolver public_url da imagem de capa se existir
      let featured_image = (post as any).featured_image;
      if (featured_image && featured_image.path) {
        const { data: urlData } = supabase.storage
          .from(featured_image.bucket || "olhar-museu")
          .getPublicUrl(featured_image.path);
        featured_image = {
          ...featured_image,
          public_url: urlData?.publicUrl || "",
        };
      }

      return {
        ...(post as DatabasePost),
        featured_image,
        tags,
      };
    } catch {
      return null;
    }
  }

  /**
   * Criar novo post
   */
  static async createPost(postData: {
    title: string;
    subtitle?: string;
    slug: string;
    excerpt?: string;
    content: any;
    status: string;
    category_id: string;
    museum_id?: string | null;
    featured_image_id?: string | null;
    reading_time_minutes?: number;
    featured?: boolean;
    featured_position?: number | null;
    seo_title?: string;
    seo_description?: string;
    canonical_url?: string;
    published_at?: string | null;
    scheduled_at?: string | null;
    tag_ids?: string[];
  }) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Usuário não autenticado.");

    await this.ensureUserRecord(user);

    const { tag_ids, ...rawPost } = postData;

    const newPostPayload = {
      ...rawPost,
      author_id: user.id,
      reading_time_minutes: postData.reading_time_minutes || 3,
      views: 0,
      published_at: postData.status === "PUBLISHED" ? (postData.published_at || new Date().toISOString()) : null,
      updated_at: new Date().toISOString(),
    };

    const { data: insertedPost, error } = await supabase
      
      .from("posts")
      .insert(newPostPayload)
      .select()
      .single();

    if (error) throw error;

    if (tag_ids && tag_ids.length > 0 && insertedPost) {
      const postTagRows = tag_ids.map((tag_id) => ({
        post_id: insertedPost.id,
        tag_id,
      }));

      await supabase.from("post_tags").insert(postTagRows);
    }

    return insertedPost;
  }

  /**
   * Atualizar post existente
   */
  static async updatePost(
    id: string,
    postData: Partial<{
      title: string;
      subtitle: string | null;
      slug: string;
      excerpt: string | null;
      content: any;
      status: string;
      category_id: string;
      museum_id: string | null;
      featured_image_id: string | null;
      reading_time_minutes: number;
      featured: boolean;
      featured_position: number | null;
      seo_title: string | null;
      seo_description: string | null;
      canonical_url: string | null;
      published_at: string | null;
      scheduled_at: string | null;
      tag_ids: string[];
    }>
  ) {
    const supabase = createClient();
    const { tag_ids, ...rawFields } = postData;

    const updatePayload = {
      ...rawFields,
      updated_at: new Date().toISOString(),
    };

    if (rawFields.status === "PUBLISHED" && !rawFields.published_at) {
      updatePayload.published_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      
      .from("posts")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    if (tag_ids !== undefined) {
      await supabase.from("post_tags").delete().eq("post_id", id);

      if (tag_ids.length > 0) {
        const postTagRows = tag_ids.map((tag_id) => ({
          post_id: id,
          tag_id,
        }));
        await supabase.from("post_tags").insert(postTagRows);
      }
    }

    return data;
  }

  /**
   * Deletar post
   */
  static async deletePost(id: string) {
    const supabase = createClient();
    await supabase.from("post_tags").delete().eq("post_id", id);
    const { error } = await supabase.from("posts").delete().eq("id", id);
    if (error) throw error;
    return true;
  }

  /**
   * CATEGORIAS
   */
  static async getCategories(): Promise<DatabaseCategory[]> {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        
        .from("categories")
        .select("*")
        .order("sort_order", { ascending: true });

      if (error) return [];
      return data || [];
    } catch {
      return [];
    }
  }

  static async createCategory(category: { name: string; slug: string; description?: string; sort_order?: number; active?: boolean }) {
    const supabase = createClient();
    const { data, error } = await supabase
      
      .from("categories")
      .insert({
        ...category,
        sort_order: category.sort_order || 0,
        active: category.active !== undefined ? category.active : true,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updateCategory(id: string, updates: Partial<DatabaseCategory>) {
    const supabase = createClient();
    const { data, error } = await supabase
      
      .from("categories")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async deleteCategory(id: string) {
    const supabase = createClient();
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) throw error;
    return true;
  }

  /**
   * MUSEUS
   */
  static async getMuseums(): Promise<DatabaseMuseum[]> {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        
        .from("museums")
        .select(`
          *,
          featured_image:media(id, filename, path, bucket)
        `)
        .order("name", { ascending: true });

      if (error) return [];
      return data || [];
    } catch {
      return [];
    }
  }

  static async createMuseum(museum: { name: string; slug: string; description?: string; address?: string; website?: string; featured_image_id?: string; active?: boolean }) {
    const supabase = createClient();
    const { data, error } = await supabase
      
      .from("museums")
      .insert({
        ...museum,
        active: museum.active !== undefined ? museum.active : true,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updateMuseum(id: string, updates: Partial<DatabaseMuseum>) {
    const supabase = createClient();
    const { data, error } = await supabase
      
      .from("museums")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async deleteMuseum(id: string) {
    const supabase = createClient();
    const { error } = await supabase.from("museums").delete().eq("id", id);
    if (error) throw error;
    return true;
  }

  /**
   * TAGS
   */
  static async getTags(): Promise<DatabaseTag[]> {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        
        .from("tags")
        .select("*")
        .order("name", { ascending: true });

      if (error) return [];
      return data || [];
    } catch {
      return [];
    }
  }

  static async createTag(tag: { name: string; slug: string }) {
    const supabase = createClient();
    const { data, error } = await supabase
      
      .from("tags")
      .insert(tag)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async deleteTag(id: string) {
    const supabase = createClient();
    const { error } = await supabase.from("tags").delete().eq("id", id);
    if (error) throw error;
    return true;
  }

  /**
   * MÍDIA (Upload & Supabase Storage)
   */
  static async getMediaList(): Promise<DatabaseMedia[]> {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        
        .from("media")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) return [];

      return (data || []).map((m: any) => {
        const { data: urlData } = supabase.storage.from(m.bucket || "olhar-museu").getPublicUrl(m.path);
        return {
          ...m,
          public_url: urlData?.publicUrl || "",
        };
      });
    } catch {
      return [];
    }
  }

  static async uploadMedia(file: File, meta: { alt_text?: string; caption?: string }) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      await this.ensureUserRecord(user);
    }

    const bucket = "olhar-museu";
    const fileExt = file.name.split(".").pop();
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const uniquePath = `uploads/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;

    // Upload para o Storage
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(uniquePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      if (uploadError.message?.toLowerCase().includes("bucket not found")) {
        throw new Error("O bucket 'olhar-museu' não foi encontrado no Supabase Storage. Crie o bucket como público no painel do Supabase.");
      }
      throw new Error(`Falha no upload do arquivo: ${uploadError.message}`);
    }

    // Inserção na tabela editorial.media
    const { data: mediaRecord, error: dbError } = await supabase
      
      .from("media")
      .insert({
        filename: cleanFileName,
        original_name: file.name,
        bucket,
        path: uniquePath,
        mime_type: file.type || "image/jpeg",
        size_bytes: file.size,
        alt_text: meta.alt_text || null,
        caption: meta.caption || null,
        uploaded_by: user?.id || null,
      })
      .select()
      .single();

    if (dbError) {
      throw new Error(`Arquivo enviado ao storage, mas falhou ao salvar registro no banco: ${dbError.message}`);
    }

    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(uniquePath);

    return {
      ...mediaRecord,
      public_url: urlData?.publicUrl || "",
    };
  }

  static async deleteMedia(id: string, path: string, bucket: string = "olhar-museu") {
    const supabase = createClient();
    await supabase.storage.from(bucket).remove([path]);
    const { error } = await supabase.from("media").delete().eq("id", id);
    if (error) throw error;
    return true;
  }

  private static async ensureUserRecord(authUser: any) {
    try {
      const supabase = createClient();
      const { data: existing } = await supabase
        
        .from("users")
        .select("id")
        .eq("id", authUser.id)
        .maybeSingle();

      if (!existing) {
        await supabase.from("users").insert({
          id: authUser.id,
          name: authUser.user_metadata?.name || authUser.email?.split("@")[0] || "Redator",
          email: authUser.email,
          avatar_url: authUser.user_metadata?.avatar_url || null,
          role: "JOURNALIST",
          active: true,
        });
      }
    } catch {
      // Silencioso se der erro de permissão
    }
  }

  static generateSlug(text: string): string {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w\s-]/g, "")
      .trim()
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }
}
