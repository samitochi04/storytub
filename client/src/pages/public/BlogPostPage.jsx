import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Clock, User } from "lucide-react";
import SEOHead from "@/components/layout/SEOHead";
import { Badge, Skeleton } from "@/components/ui";
import {
  getPostBySlug,
  getRelatedPosts,
  incrementViews,
} from "@/services/blog.service";

export default function BlogPostPage() {
  const { slug } = useParams();
  const { t, i18n } = useTranslation();
  const lang = i18n.language === "fr" ? "fr" : "en";
  const [post, setPost] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getPostBySlug(slug)
      .then((p) => {
        setPost(p);
        incrementViews(p.id).catch(() => {});
        return getRelatedPosts(p.id);
      })
      .then(setRelated)
      .catch(() => setError(t("blog.postNotFound")))
      .finally(() => setLoading(false));
  }, [slug, t]);

  if (loading) {
    return (
      <div className="mx-auto max-w-[700px] px-[var(--space-4)] py-[var(--space-12)]">
        <Skeleton className="mb-[var(--space-4)] h-[32px] w-3/4" />
        <Skeleton className="mb-[var(--space-2)] h-[14px] w-1/2" />
        <Skeleton className="h-[400px]" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="mx-auto max-w-[700px] px-[var(--space-4)] py-[var(--space-16)] text-center">
        <p className="text-[14px] text-[var(--color-text-secondary)]">
          {error || t("blog.postNotFound")}
        </p>
        <Link
          to="/blog"
          className="mt-[var(--space-4)] inline-flex items-center gap-[var(--space-1)] text-[12px] text-[var(--color-brand-blue)]"
        >
          <ArrowLeft size={14} strokeWidth={1.5} />
          {t("blog.backToBlog")}
        </Link>
      </div>
    );
  }

  const title = post[`title_${lang}`] || post.title_en || post.title_fr;
  const content = post[`content_${lang}`] || post.content_en || post.content_fr;
  const metaTitle = post[`meta_title_${lang}`] || post.meta_title_en || title;
  const metaDesc =
    post[`meta_description_${lang}`] ||
    post.meta_description_en ||
    post[`excerpt_${lang}`] ||
    post.excerpt_en;
  const author = post.blog_authors;
  const category = post.blog_categories;
  const tags = (post.blog_post_tags || []).map((pt) => pt.blog_tags);

  const articleData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    datePublished: post.published_at,
    dateModified: post.updated_content_at || post.published_at,
    ...(author && {
      author: { "@type": "Person", name: author.name },
    }),
    ...(post.og_image_url && { image: post.og_image_url }),
    publisher: {
      "@type": "Organization",
      name: "StoryTub",
      url: "https://storytub.com",
    },
  };

  const faqData =
    post.faq_data && Array.isArray(post.faq_data) && post.faq_data.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: post.faq_data.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: { "@type": "Answer", text: item.answer },
          })),
        }
      : null;

  const structuredData = faqData ? [articleData, faqData] : articleData;

  return (
    <>
      <SEOHead
        title={metaTitle}
        description={metaDesc}
        image={post.og_image_url}
        noindex={post.noindex}
        canonical={post.canonical_url}
        structuredData={structuredData}
      />

      <article className="mx-auto max-w-[700px] px-[var(--space-4)] py-[var(--space-12)]">
        {/* Back link */}
        <Link
          to="/blog"
          className="inline-flex items-center gap-[var(--space-1)] text-[12px] text-[var(--color-text-tertiary)] hover:text-[var(--color-brand-blue)]"
        >
          <ArrowLeft size={14} strokeWidth={1.5} />
          {t("blog.backToBlog")}
        </Link>

        {/* Header */}
        <header className="mt-[var(--space-4)]">
          {category && (
            <Badge
              variant="secondary"
              className="mb-[var(--space-2)] text-[10px]"
            >
              {category[`name_${lang}`] || category.name_en}
            </Badge>
          )}
          <h1 className="text-[28px] font-bold leading-[1.2] text-[var(--color-text-primary)]">
            {title}
          </h1>
          <div className="mt-[var(--space-3)] flex flex-wrap items-center gap-[var(--space-3)] text-[12px] text-[var(--color-text-tertiary)]">
            {author && (
              <span className="flex items-center gap-[4px]">
                <User size={12} strokeWidth={1.5} />
                {author.name}
              </span>
            )}
            {post.published_at && (
              <span>{new Date(post.published_at).toLocaleDateString()}</span>
            )}
            {post.reading_time_minutes && (
              <span className="flex items-center gap-[2px]">
                <Clock size={12} strokeWidth={1.5} />
                {post.reading_time_minutes} min
              </span>
            )}
          </div>
        </header>

        {/* Featured image */}
        {post.og_image_url && (
          <img
            src={post.og_image_url}
            alt={title}
            className="mt-[var(--space-6)] w-full rounded-[var(--radius-lg)] object-cover"
          />
        )}

        {/* Content */}
        <div
          className="prose mt-[var(--space-6)] max-w-none text-[13px] leading-[1.7] text-[var(--color-text-secondary)]"
          dangerouslySetInnerHTML={{ __html: content }}
        />

        {/* Tags */}
        {tags.length > 0 && (
          <div className="mt-[var(--space-6)] flex flex-wrap gap-[var(--space-1)]">
            {tags.map((tag) => (
              <Badge key={tag.id} variant="outline" className="text-[10px]">
                {tag[`name_${lang}`] || tag.name_en}
              </Badge>
            ))}
          </div>
        )}
      </article>

      {/* Related posts */}
      {related.length > 0 && (
        <section className="mx-auto max-w-[700px] px-[var(--space-4)] pb-[var(--space-12)]">
          <h2 className="text-[18px] font-bold text-[var(--color-text-primary)]">
            {t("blog.relatedPosts")}
          </h2>
          <div className="mt-[var(--space-4)] grid gap-[var(--space-4)] sm:grid-cols-3">
            {related.map((r) => (
              <Link
                key={r.id}
                to={`/blog/${r.slug}`}
                className="rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-[var(--color-bg-card)] p-[var(--space-3)] shadow-[var(--shadow-sm)] transition-shadow hover:shadow-[var(--shadow-md)]"
              >
                <h3 className="text-[13px] font-bold text-[var(--color-text-primary)]">
                  {r[`title_${lang}`] || r.title_en || r.title_fr}
                </h3>
                <p className="mt-[var(--space-1)] line-clamp-2 text-[11px] text-[var(--color-text-secondary)]">
                  {r[`excerpt_${lang}`] || r.excerpt_en || r.excerpt_fr}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
