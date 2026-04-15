import { supabase } from "@/config/supabase";

const POST_SELECT = `
  id, slug, language, title_en, title_fr, excerpt_en, excerpt_fr,
  content_en, content_fr, meta_title_en, meta_title_fr,
  meta_description_en, meta_description_fr, canonical_url, og_image_url,
  noindex, faq_data, schema_markup, status, published_at,
  updated_content_at, reading_time_minutes, word_count, views_count,
  is_featured,
  blog_authors ( id, name, slug, avatar_url, bio_en, bio_fr ),
  blog_categories ( id, slug, name_en, name_fr ),
  blog_post_tags ( blog_tags ( id, slug, name_en, name_fr ) )
`;

/**
 * Fetch published posts with pagination.
 */
export async function getPosts({
  page = 1,
  limit = 12,
  categorySlug,
  tagSlug,
} = {}) {
  let query = supabase
    .from("blog_posts")
    .select(POST_SELECT, { count: "exact" })
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  if (categorySlug) {
    query = query.eq("blog_categories.slug", categorySlug);
  }

  const { data, count, error } = await query;
  if (error) throw error;
  return { posts: data || [], total: count || 0 };
}

/**
 * Fetch a single post by slug.
 */
export async function getPostBySlug(slug) {
  const { data, error } = await supabase
    .from("blog_posts")
    .select(POST_SELECT)
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (error) throw error;
  return data;
}

/**
 * Fetch related posts for a given post id.
 */
export async function getRelatedPosts(postId) {
  const { data, error } = await supabase
    .from("blog_related_posts")
    .select(
      "related_post_id, sort_order, blog_posts:related_post_id ( id, slug, title_en, title_fr, excerpt_en, excerpt_fr, og_image_url, published_at, reading_time_minutes )",
    )
    .eq("post_id", postId)
    .order("sort_order", { ascending: true })
    .limit(3);

  if (error) throw error;
  return (data || []).map((r) => r.blog_posts);
}

/**
 * Fetch all active categories.
 */
export async function getCategories() {
  const { data, error } = await supabase
    .from("blog_categories")
    .select("id, slug, name_en, name_fr, parent_id, sort_order")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return data || [];
}

/**
 * Fetch all tags.
 */
export async function getTags() {
  const { data, error } = await supabase
    .from("blog_tags")
    .select("id, slug, name_en, name_fr")
    .order("name_en", { ascending: true });

  if (error) throw error;
  return data || [];
}

/**
 * Increment post view count.
 */
export async function incrementViews(postId) {
  await supabase.rpc("increment_blog_views", { post_id: postId });
}
