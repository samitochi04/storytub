import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import SEOHead from "@/components/layout/SEOHead";
import {
  Plus,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  ArrowLeft,
  Eye,
  Save,
  X,
} from "lucide-react";
import {
  getBlogPosts,
  getBlogPost,
  saveBlogPost,
  deleteBlogPost,
  setBlogPostTags,
  getBlogCategories,
  getBlogTags,
} from "@/services/admin.service";

const STATUS_COLORS = {
  draft: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  review:
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400",
  published: "bg-green-100 text-[var(--color-success)] dark:bg-green-950/30",
};

function PostList({
  posts,
  total,
  page,
  setPage,
  limit,
  loading,
  status,
  setStatus,
  onEdit,
  onDelete,
  onCreate,
  t,
}) {
  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-[24px] font-bold text-[var(--color-text-primary)]">
          {t("adminPages.blogTitle")}
        </h1>
        <button
          onClick={onCreate}
          className="flex items-center gap-[var(--space-2)] rounded-[var(--radius-sm)] bg-[var(--color-brand-blue)] px-[var(--space-4)] py-[var(--space-2)] text-[13px] font-medium text-white transition-colors hover:bg-[var(--color-brand-blue-dark)]"
        >
          <Plus size={16} />
          {t("adminPages.newPost")}
        </button>
      </div>

      <div className="mt-[var(--space-6)] flex items-center gap-[var(--space-3)]">
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="rounded-[var(--radius-sm)] border border-[var(--color-border-default)] bg-[var(--color-bg-input)] px-[var(--space-3)] py-[var(--space-2)] text-[13px] text-[var(--color-text-primary)] outline-none"
        >
          <option value="">{t("adminPages.allStatuses")}</option>
          <option value="draft">Draft</option>
          <option value="review">Review</option>
          <option value="published">Published</option>
        </select>
      </div>

      <div className="mt-[var(--space-4)] overflow-x-auto rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-bg-card)] shadow-[var(--shadow-sm)]">
        <table className="w-full text-left text-[13px]">
          <thead>
            <tr className="border-b border-[var(--color-border-default)] text-[12px] font-medium text-[var(--color-text-secondary)]">
              <th className="px-[var(--space-4)] py-[var(--space-3)]">
                {t("adminPages.title")}
              </th>
              <th className="px-[var(--space-4)] py-[var(--space-3)]">
                {t("adminPages.category")}
              </th>
              <th className="px-[var(--space-4)] py-[var(--space-3)]">
                {t("adminPages.status")}
              </th>
              <th className="px-[var(--space-4)] py-[var(--space-3)]">
                {t("adminPages.views")}
              </th>
              <th className="px-[var(--space-4)] py-[var(--space-3)]">
                {t("adminPages.created")}
              </th>
              <th className="px-[var(--space-4)] py-[var(--space-3)]">
                {t("adminPages.actions")}
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="py-[var(--space-8)] text-center">
                  <Loader2
                    size={20}
                    className="mx-auto animate-spin text-[var(--color-text-secondary)]"
                  />
                </td>
              </tr>
            ) : posts.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="py-[var(--space-8)] text-center text-[var(--color-text-secondary)]"
                >
                  {t("adminPages.noResults")}
                </td>
              </tr>
            ) : (
              posts.map((post) => (
                <tr
                  key={post.id}
                  className="border-b border-[var(--color-border-default)] last:border-0 hover:bg-[var(--color-bg-hover)]"
                >
                  <td className="max-w-[250px] truncate px-[var(--space-4)] py-[var(--space-3)] text-[var(--color-text-primary)]">
                    {post.title_en || post.title_fr || "Untitled"}
                  </td>
                  <td className="px-[var(--space-4)] py-[var(--space-3)] text-[var(--color-text-secondary)]">
                    {post.blog_categories?.name_en || "None"}
                  </td>
                  <td className="px-[var(--space-4)] py-[var(--space-3)]">
                    <span
                      className={`inline-flex rounded-full px-[var(--space-2)] py-[2px] text-[11px] font-medium ${STATUS_COLORS[post.status] || ""}`}
                    >
                      {post.status}
                    </span>
                  </td>
                  <td className="px-[var(--space-4)] py-[var(--space-3)] text-[var(--color-text-secondary)]">
                    {post.views_count ?? 0}
                  </td>
                  <td className="px-[var(--space-4)] py-[var(--space-3)] text-[var(--color-text-secondary)]">
                    {new Date(post.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-[var(--space-4)] py-[var(--space-3)]">
                    <div className="flex items-center gap-[var(--space-2)]">
                      <button
                        onClick={() => onEdit(post.id)}
                        className="rounded-[var(--radius-xs)] p-[var(--space-1)] text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)]"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => onDelete(post.id)}
                        className="rounded-[var(--radius-xs)] p-[var(--space-1)] text-[var(--color-error)] transition-colors hover:bg-red-50 dark:hover:bg-red-950/20"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-[var(--space-4)] flex items-center justify-between text-[13px] text-[var(--color-text-secondary)]">
          <span>
            {t("adminPages.showing")} {(page - 1) * limit + 1}
            {" - "}
            {Math.min(page * limit, total)} {t("adminPages.of")} {total}
          </span>
          <div className="flex items-center gap-[var(--space-2)]">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-[var(--radius-xs)] p-[var(--space-1)] hover:bg-[var(--color-bg-hover)] disabled:opacity-30"
            >
              <ChevronLeft size={18} />
            </button>
            <span>
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="rounded-[var(--radius-xs)] p-[var(--space-1)] hover:bg-[var(--color-bg-hover)] disabled:opacity-30"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function FieldGroup({ label, children }) {
  return (
    <div className="mt-[var(--space-4)]">
      <label className="block text-[12px] font-medium text-[var(--color-text-secondary)]">
        {label}
      </label>
      <div className="mt-[var(--space-1)]">{children}</div>
    </div>
  );
}

function TextInput({ value, onChange, placeholder, ...rest }) {
  return (
    <input
      type="text"
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-[var(--radius-sm)] border border-[var(--color-border-default)] bg-[var(--color-bg-input)] px-[var(--space-3)] py-[var(--space-2)] text-[13px] text-[var(--color-text-primary)] outline-none focus:border-[var(--color-border-focus)]"
      {...rest}
    />
  );
}

function TextArea({ value, onChange, rows = 3, placeholder }) {
  return (
    <textarea
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      placeholder={placeholder}
      className="w-full rounded-[var(--radius-sm)] border border-[var(--color-border-default)] bg-[var(--color-bg-input)] px-[var(--space-3)] py-[var(--space-2)] text-[13px] text-[var(--color-text-primary)] outline-none focus:border-[var(--color-border-focus)]"
    />
  );
}

function PostEditor({ postId, onBack, onSaved, categories, allTags, t }) {
  const [form, setForm] = useState({
    slug: "",
    language: "en",
    title_en: "",
    title_fr: "",
    excerpt_en: "",
    excerpt_fr: "",
    content_en: "",
    content_fr: "",
    meta_title_en: "",
    meta_title_fr: "",
    meta_description_en: "",
    meta_description_fr: "",
    canonical_url: "",
    og_image_url: "",
    noindex: false,
    faq_data: "",
    schema_markup: "",
    status: "draft",
    is_featured: false,
    category_id: "",
  });
  const [selectedTags, setSelectedTags] = useState([]);
  const [loading, setLoading] = useState(!!postId);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [previewLang, setPreviewLang] = useState(null);

  useEffect(() => {
    if (!postId) return;
    setLoading(true);
    getBlogPost(postId)
      .then((post) => {
        setForm({
          slug: post.slug || "",
          language: post.language || "en",
          title_en: post.title_en || "",
          title_fr: post.title_fr || "",
          excerpt_en: post.excerpt_en || "",
          excerpt_fr: post.excerpt_fr || "",
          content_en: post.content_en || "",
          content_fr: post.content_fr || "",
          meta_title_en: post.meta_title_en || "",
          meta_title_fr: post.meta_title_fr || "",
          meta_description_en: post.meta_description_en || "",
          meta_description_fr: post.meta_description_fr || "",
          canonical_url: post.canonical_url || "",
          og_image_url: post.og_image_url || "",
          noindex: post.noindex || false,
          faq_data: post.faq_data ? JSON.stringify(post.faq_data, null, 2) : "",
          schema_markup: post.schema_markup
            ? JSON.stringify(post.schema_markup, null, 2)
            : "",
          status: post.status || "draft",
          is_featured: post.is_featured || false,
          category_id: post.category_id || "",
        });
        const tagIds = (post.blog_post_tags || [])
          .map((pt) => pt.blog_tags?.id)
          .filter(Boolean);
        setSelectedTags(tagIds);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [postId]);

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleTag(tagId) {
    setSelectedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId],
    );
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const fields = { ...form };
      if (fields.faq_data) {
        fields.faq_data = JSON.parse(fields.faq_data);
      } else {
        fields.faq_data = null;
      }
      if (fields.schema_markup) {
        fields.schema_markup = JSON.parse(fields.schema_markup);
      } else {
        fields.schema_markup = null;
      }
      if (!fields.category_id) fields.category_id = null;
      if (fields.status === "published" && !fields.published_at) {
        fields.published_at = new Date().toISOString();
      }

      const result = await saveBlogPost(postId || null, fields);
      const savedId = postId || result.id;

      await setBlogPostTags(savedId, selectedTags);
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-[var(--space-16)]">
        <Loader2
          size={24}
          className="animate-spin text-[var(--color-text-secondary)]"
        />
      </div>
    );
  }

  if (previewLang) {
    const title = previewLang === "en" ? form.title_en : form.title_fr;
    const content = previewLang === "en" ? form.content_en : form.content_fr;
    return (
      <div>
        <button
          onClick={() => setPreviewLang(null)}
          className="flex items-center gap-[var(--space-2)] text-[13px] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
        >
          <ArrowLeft size={16} />
          {t("adminPages.backToEditor")}
        </button>
        <div className="mt-[var(--space-6)] rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-bg-card)] p-[var(--space-8)]">
          <h1 className="text-[28px] font-bold text-[var(--color-text-primary)]">
            {title || "Untitled"}
          </h1>
          <div className="mt-[var(--space-6)] whitespace-pre-wrap text-[14px] leading-relaxed text-[var(--color-text-primary)]">
            {content || "No content"}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-[var(--space-2)] text-[13px] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
        >
          <ArrowLeft size={16} />
          {t("adminPages.backToList")}
        </button>
        <div className="flex items-center gap-[var(--space-2)]">
          <button
            onClick={() => setPreviewLang("en")}
            className="flex items-center gap-[var(--space-1)] rounded-[var(--radius-sm)] border border-[var(--color-border-default)] px-[var(--space-3)] py-[var(--space-2)] text-[12px] text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-bg-hover)]"
          >
            <Eye size={14} />
            EN
          </button>
          <button
            onClick={() => setPreviewLang("fr")}
            className="flex items-center gap-[var(--space-1)] rounded-[var(--radius-sm)] border border-[var(--color-border-default)] px-[var(--space-3)] py-[var(--space-2)] text-[12px] text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-bg-hover)]"
          >
            <Eye size={14} />
            FR
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-[var(--space-2)] rounded-[var(--radius-sm)] bg-[var(--color-brand-blue)] px-[var(--space-4)] py-[var(--space-2)] text-[13px] font-medium text-white transition-colors hover:bg-[var(--color-brand-blue-dark)] disabled:opacity-50"
          >
            <Save size={14} />
            {saving ? t("adminPages.saving") : t("adminPages.save")}
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-[var(--space-4)] flex items-center gap-[var(--space-2)] text-[13px] text-[var(--color-error)]">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      <div className="mt-[var(--space-6)] grid grid-cols-1 gap-[var(--space-6)] lg:grid-cols-3">
        {/* Main content area */}
        <div className="lg:col-span-2 space-y-[var(--space-6)]">
          {/* English content */}
          <div className="rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-bg-card)] p-[var(--space-6)]">
            <h2 className="text-[14px] font-bold text-[var(--color-text-primary)]">
              English Content
            </h2>
            <FieldGroup label={t("adminPages.titleEn")}>
              <TextInput
                value={form.title_en}
                onChange={(v) => updateField("title_en", v)}
              />
            </FieldGroup>
            <FieldGroup label={t("adminPages.excerptEn")}>
              <TextArea
                value={form.excerpt_en}
                onChange={(v) => updateField("excerpt_en", v)}
                rows={2}
              />
            </FieldGroup>
            <FieldGroup label={t("adminPages.contentEn")}>
              <TextArea
                value={form.content_en}
                onChange={(v) => updateField("content_en", v)}
                rows={12}
              />
            </FieldGroup>
          </div>

          {/* French content */}
          <div className="rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-bg-card)] p-[var(--space-6)]">
            <h2 className="text-[14px] font-bold text-[var(--color-text-primary)]">
              French Content
            </h2>
            <FieldGroup label={t("adminPages.titleFr")}>
              <TextInput
                value={form.title_fr}
                onChange={(v) => updateField("title_fr", v)}
              />
            </FieldGroup>
            <FieldGroup label={t("adminPages.excerptFr")}>
              <TextArea
                value={form.excerpt_fr}
                onChange={(v) => updateField("excerpt_fr", v)}
                rows={2}
              />
            </FieldGroup>
            <FieldGroup label={t("adminPages.contentFr")}>
              <TextArea
                value={form.content_fr}
                onChange={(v) => updateField("content_fr", v)}
                rows={12}
              />
            </FieldGroup>
          </div>

          {/* SEO Fields */}
          <div className="rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-bg-card)] p-[var(--space-6)]">
            <h2 className="text-[14px] font-bold text-[var(--color-text-primary)]">
              SEO
            </h2>
            <div className="grid grid-cols-1 gap-[var(--space-4)] md:grid-cols-2">
              <FieldGroup label={t("adminPages.metaTitleEn")}>
                <TextInput
                  value={form.meta_title_en}
                  onChange={(v) => updateField("meta_title_en", v)}
                />
              </FieldGroup>
              <FieldGroup label={t("adminPages.metaTitleFr")}>
                <TextInput
                  value={form.meta_title_fr}
                  onChange={(v) => updateField("meta_title_fr", v)}
                />
              </FieldGroup>
              <FieldGroup label={t("adminPages.metaDescEn")}>
                <TextArea
                  value={form.meta_description_en}
                  onChange={(v) => updateField("meta_description_en", v)}
                  rows={2}
                />
              </FieldGroup>
              <FieldGroup label={t("adminPages.metaDescFr")}>
                <TextArea
                  value={form.meta_description_fr}
                  onChange={(v) => updateField("meta_description_fr", v)}
                  rows={2}
                />
              </FieldGroup>
            </div>
            <FieldGroup label={t("adminPages.canonicalUrl")}>
              <TextInput
                value={form.canonical_url}
                onChange={(v) => updateField("canonical_url", v)}
              />
            </FieldGroup>
            <FieldGroup label={t("adminPages.ogImage")}>
              <TextInput
                value={form.og_image_url}
                onChange={(v) => updateField("og_image_url", v)}
              />
            </FieldGroup>
            <FieldGroup label="FAQ Data (JSON)">
              <TextArea
                value={form.faq_data}
                onChange={(v) => updateField("faq_data", v)}
                rows={4}
                placeholder='[{"question":"...","answer":"..."}]'
              />
            </FieldGroup>
            <FieldGroup label="Schema Markup (JSON)">
              <TextArea
                value={form.schema_markup}
                onChange={(v) => updateField("schema_markup", v)}
                rows={4}
              />
            </FieldGroup>
            <div className="mt-[var(--space-4)] flex items-center gap-[var(--space-2)]">
              <input
                type="checkbox"
                checked={form.noindex}
                onChange={(e) => updateField("noindex", e.target.checked)}
                id="noindex"
                className="accent-[var(--color-brand-blue)]"
              />
              <label
                htmlFor="noindex"
                className="text-[13px] text-[var(--color-text-secondary)]"
              >
                {t("adminPages.noindex")}
              </label>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-[var(--space-4)]">
          <div className="rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-bg-card)] p-[var(--space-4)]">
            <FieldGroup label={t("adminPages.slug")}>
              <TextInput
                value={form.slug}
                onChange={(v) => updateField("slug", v)}
              />
            </FieldGroup>
            <FieldGroup label={t("adminPages.status")}>
              <select
                value={form.status}
                onChange={(e) => updateField("status", e.target.value)}
                className="w-full rounded-[var(--radius-sm)] border border-[var(--color-border-default)] bg-[var(--color-bg-input)] px-[var(--space-3)] py-[var(--space-2)] text-[13px] text-[var(--color-text-primary)] outline-none"
              >
                <option value="draft">Draft</option>
                <option value="review">Review</option>
                <option value="published">Published</option>
              </select>
            </FieldGroup>
            <FieldGroup label={t("adminPages.language")}>
              <select
                value={form.language}
                onChange={(e) => updateField("language", e.target.value)}
                className="w-full rounded-[var(--radius-sm)] border border-[var(--color-border-default)] bg-[var(--color-bg-input)] px-[var(--space-3)] py-[var(--space-2)] text-[13px] text-[var(--color-text-primary)] outline-none"
              >
                <option value="en">English</option>
                <option value="fr">French</option>
              </select>
            </FieldGroup>
            <FieldGroup label={t("adminPages.category")}>
              <select
                value={form.category_id}
                onChange={(e) => updateField("category_id", e.target.value)}
                className="w-full rounded-[var(--radius-sm)] border border-[var(--color-border-default)] bg-[var(--color-bg-input)] px-[var(--space-3)] py-[var(--space-2)] text-[13px] text-[var(--color-text-primary)] outline-none"
              >
                <option value="">{t("adminPages.noCategory")}</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name_en}
                  </option>
                ))}
              </select>
            </FieldGroup>
            <div className="mt-[var(--space-4)] flex items-center gap-[var(--space-2)]">
              <input
                type="checkbox"
                checked={form.is_featured}
                onChange={(e) => updateField("is_featured", e.target.checked)}
                id="featured"
                className="accent-[var(--color-brand-blue)]"
              />
              <label
                htmlFor="featured"
                className="text-[13px] text-[var(--color-text-secondary)]"
              >
                {t("adminPages.featured")}
              </label>
            </div>
          </div>

          {/* Tags */}
          <div className="rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-bg-card)] p-[var(--space-4)]">
            <h3 className="text-[12px] font-medium text-[var(--color-text-secondary)]">
              {t("adminPages.tags")}
            </h3>
            <div className="mt-[var(--space-3)] flex flex-wrap gap-[var(--space-2)]">
              {allTags.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => toggleTag(tag.id)}
                  className={`rounded-full px-[var(--space-3)] py-[2px] text-[11px] font-medium transition-colors ${
                    selectedTags.includes(tag.id)
                      ? "bg-[var(--color-brand-blue)] text-white"
                      : "border border-[var(--color-border-default)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]"
                  }`}
                >
                  {tag.name_en}
                </button>
              ))}
              {allTags.length === 0 && (
                <span className="text-[12px] text-[var(--color-text-tertiary)]">
                  {t("adminPages.noTags")}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminBlogPage() {
  const { t } = useTranslation();
  const [view, setView] = useState("list");
  const [editingId, setEditingId] = useState(null);
  const [posts, setPosts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const limit = 25;

  const loadPosts = useCallback(() => {
    setLoading(true);
    setError(null);
    getBlogPosts({ page, limit, status })
      .then(({ posts: p, total: t }) => {
        setPosts(p);
        setTotal(t);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [page, status]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  useEffect(() => {
    Promise.all([getBlogCategories(), getBlogTags()]).then(([cats, tags]) => {
      setCategories(cats);
      setAllTags(tags);
    });
  }, []);

  async function handleDelete(id) {
    if (!window.confirm(t("adminPages.confirmDelete"))) return;
    try {
      await deleteBlogPost(id);
      loadPosts();
    } catch (err) {
      setError(err.message);
    }
  }

  if (view === "editor") {
    return (
      <>
        <SEOHead title="Admin Blog Editor" noindex />
        <PostEditor
          postId={editingId}
          categories={categories}
          allTags={allTags}
          t={t}
          onBack={() => {
            setView("list");
            setEditingId(null);
          }}
          onSaved={() => {
            setView("list");
            setEditingId(null);
            loadPosts();
          }}
        />
      </>
    );
  }

  return (
    <>
      <SEOHead title="Admin Blog" noindex />
      {error && (
        <div className="mb-[var(--space-4)] flex items-center gap-[var(--space-2)] text-[13px] text-[var(--color-error)]">
          <AlertCircle size={16} />
          {error}
        </div>
      )}
      <PostList
        posts={posts}
        total={total}
        page={page}
        setPage={setPage}
        limit={limit}
        loading={loading}
        status={status}
        setStatus={setStatus}
        t={t}
        onEdit={(id) => {
          setEditingId(id);
          setView("editor");
        }}
        onDelete={handleDelete}
        onCreate={() => {
          setEditingId(null);
          setView("editor");
        }}
      />
    </>
  );
}
