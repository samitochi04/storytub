import { api } from "@/config/api";
import { supabase } from "@/config/supabase";

// ─── Analytics & Dashboard ───

export function getDashboardAnalytics(days = 30) {
  return api.get(`/admin/analytics?days=${days}`);
}

export function getRevenueBreakdown(days = 30) {
  return api.get(`/admin/analytics/revenue?days=${days}`);
}

// ─── Users ───

export async function getUsers({
  page = 1,
  limit = 25,
  search = "",
  plan = "",
  banned = "",
} = {}) {
  let query = supabase
    .from("profiles")
    .select(
      "id, email, display_name, avatar_url, credits_balance, subscription_plan, subscription_status, is_banned, ban_reason, created_at, last_login_at",
      { count: "exact" },
    )
    .order("created_at", { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  if (search) {
    query = query.or(`email.ilike.%${search}%,display_name.ilike.%${search}%`);
  }
  if (plan) query = query.eq("subscription_plan", plan);
  if (banned === "true") query = query.eq("is_banned", true);
  if (banned === "false") query = query.eq("is_banned", false);

  const { data, count, error } = await query;
  if (error) throw error;
  return { users: data || [], total: count || 0 };
}

export async function banUser(userId, banReason) {
  const { error } = await supabase
    .from("profiles")
    .update({ is_banned: true, ban_reason: banReason })
    .eq("id", userId);
  if (error) throw error;
}

export async function unbanUser(userId) {
  const { error } = await supabase
    .from("profiles")
    .update({ is_banned: false, ban_reason: null })
    .eq("id", userId);
  if (error) throw error;
}

export async function adjustCredits(userId, amount, description) {
  const { data: profile, error: fetchErr } = await supabase
    .from("profiles")
    .select("credits_balance")
    .eq("id", userId)
    .single();
  if (fetchErr) throw fetchErr;

  const newBalance = profile.credits_balance + amount;
  if (newBalance < 0) throw new Error("Balance cannot go below zero");

  const { error: updateErr } = await supabase
    .from("profiles")
    .update({ credits_balance: newBalance })
    .eq("id", userId);
  if (updateErr) throw updateErr;

  const { error: txErr } = await supabase.from("credit_transactions").insert({
    user_id: userId,
    amount,
    type: amount > 0 ? "admin_grant" : "admin_deduct",
    description: description || "Admin adjustment",
    balance_after: newBalance,
  });
  if (txErr) throw txErr;

  return { newBalance };
}

// ─── Videos ───

export async function getVideos({
  page = 1,
  limit = 25,
  status = "",
  search = "",
} = {}) {
  let query = supabase
    .from("videos")
    .select(
      "id, user_id, title, topic, language, status, credits_charged, duration_seconds, error_message, retry_count, created_at, completed_at, profiles!videos_user_id_fkey(email, display_name)",
      { count: "exact" },
    )
    .order("created_at", { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  if (status) query = query.eq("status", status);
  if (search) {
    query = query.or(`title.ilike.%${search}%,topic.ilike.%${search}%`);
  }

  const { data, count, error } = await query;
  if (error) throw error;
  return { videos: data || [], total: count || 0 };
}

export function retryVideo(videoId) {
  return api.post(`/videos/${videoId}/retry`);
}

// ─── Blog ───

const ADMIN_POST_SELECT = `
  id, slug, language, title_en, title_fr, excerpt_en, excerpt_fr,
  content_en, content_fr, meta_title_en, meta_title_fr,
  meta_description_en, meta_description_fr, canonical_url, og_image_url,
  noindex, faq_data, schema_markup, status, published_at,
  updated_content_at, reading_time_minutes, word_count, views_count,
  is_featured, author_id, category_id, created_at,
  blog_authors ( id, name ),
  blog_categories ( id, name_en, name_fr ),
  blog_post_tags ( blog_tags ( id, slug, name_en, name_fr ) )
`;

export async function getBlogPosts({ page = 1, limit = 25, status = "" } = {}) {
  let query = supabase
    .from("blog_posts")
    .select(ADMIN_POST_SELECT, { count: "exact" })
    .order("created_at", { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  if (status) query = query.eq("status", status);

  const { data, count, error } = await query;
  if (error) throw error;
  return { posts: data || [], total: count || 0 };
}

export async function getBlogPost(id) {
  const { data, error } = await supabase
    .from("blog_posts")
    .select(ADMIN_POST_SELECT)
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

export async function saveBlogPost(id, fields) {
  if (id) {
    const { data, error } = await supabase
      .from("blog_posts")
      .update(fields)
      .eq("id", id)
      .select("id")
      .single();
    if (error) throw error;
    return data;
  }
  const { data, error } = await supabase
    .from("blog_posts")
    .insert(fields)
    .select("id")
    .single();
  if (error) throw error;
  return data;
}

export async function deleteBlogPost(id) {
  const { error } = await supabase.from("blog_posts").delete().eq("id", id);
  if (error) throw error;
}

export async function setBlogPostTags(postId, tagIds) {
  await supabase.from("blog_post_tags").delete().eq("post_id", postId);
  if (tagIds.length) {
    const rows = tagIds.map((tag_id) => ({ post_id: postId, tag_id }));
    const { error } = await supabase.from("blog_post_tags").insert(rows);
    if (error) throw error;
  }
}

export async function getBlogCategories() {
  const { data, error } = await supabase
    .from("blog_categories")
    .select("id, slug, name_en, name_fr, sort_order")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function getBlogTags() {
  const { data, error } = await supabase
    .from("blog_tags")
    .select("id, slug, name_en, name_fr")
    .order("name_en", { ascending: true });
  if (error) throw error;
  return data || [];
}

// ─── Coupons ───

export async function getCoupons({ page = 1, limit = 25 } = {}) {
  const { data, count, error } = await supabase
    .from("coupons")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range((page - 1) * limit, page * limit - 1);
  if (error) throw error;
  return { coupons: data || [], total: count || 0 };
}

export async function saveCoupon(id, fields) {
  if (id) {
    const { data, error } = await supabase
      .from("coupons")
      .update(fields)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
  const { data, error } = await supabase
    .from("coupons")
    .insert(fields)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteCoupon(id) {
  const { error } = await supabase.from("coupons").delete().eq("id", id);
  if (error) throw error;
}

// ─── Staff ───

export function getStaff() {
  return api.get("/admin/staff");
}

export function createStaff(data) {
  return api.post("/admin/staff", data);
}

export function updateStaff(id, data) {
  return api.patch(`/admin/staff/${id}`, data);
}

export function deleteStaff(id) {
  return api.delete(`/admin/staff/${id}`);
}

// ─── Billing ───

export function getBillingOverview() {
  return api.get("/admin/billing");
}

// ─── Monitoring ───

export function getMonitoringOverview() {
  return api.get("/admin/monitoring");
}

// ─── Audit Logs ───

export function getAuditLogs() {
  return api.get("/admin/audit-logs");
}

// ─── Email Campaigns ───

export async function getEmailCampaigns({ page = 1, limit = 25 } = {}) {
  const { data, count, error } = await supabase
    .from("email_campaigns")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range((page - 1) * limit, page * limit - 1);
  if (error) throw error;
  return { campaigns: data || [], total: count || 0 };
}

export async function getEmailLogs({ page = 1, limit = 50 } = {}) {
  const { data, count, error } = await supabase
    .from("email_logs")
    .select("*", { count: "exact" })
    .order("sent_at", { ascending: false })
    .range((page - 1) * limit, page * limit - 1);
  if (error) throw error;
  return { logs: data || [], total: count || 0 };
}

export async function saveEmailCampaign(id, fields) {
  if (id) {
    const { data, error } = await supabase
      .from("email_campaigns")
      .update(fields)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
  const { data, error } = await supabase
    .from("email_campaigns")
    .insert(fields)
    .select()
    .single();
  if (error) throw error;
  return data;
}
