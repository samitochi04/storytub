import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams, Link } from "react-router-dom";
import { Clock, ChevronLeft, ChevronRight } from "lucide-react";
import SEOHead from "@/components/layout/SEOHead";
import { Badge, Skeleton } from "@/components/ui";
import { getPosts, getCategories, getTags } from "@/services/blog.service";

const LIMIT = 12;

function PostCard({ post, lang }) {
  const title = post[`title_${lang}`] || post.title_en || post.title_fr;
  const excerpt = post[`excerpt_${lang}`] || post.excerpt_en || post.excerpt_fr;
  const category = post.blog_categories;
  const catName = category
    ? category[`name_${lang}`] || category.name_en
    : null;

  return (
    <Link
      to={`/blog/${post.slug}`}
      className="group flex flex-col overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-[var(--color-bg-card)] shadow-[var(--shadow-sm)] transition-shadow hover:shadow-[var(--shadow-md)]"
    >
      {post.og_image_url && (
        <img
          src={post.og_image_url}
          alt={title}
          className="h-[160px] w-full object-cover"
          loading="lazy"
        />
      )}
      <div className="flex flex-1 flex-col p-[var(--space-4)]">
        {catName && (
          <Badge
            variant="secondary"
            className="mb-[var(--space-2)] w-fit text-[10px]"
          >
            {catName}
          </Badge>
        )}
        <h2 className="text-[14px] font-bold leading-[1.3] text-[var(--color-text-primary)] group-hover:text-[var(--color-brand-blue)]">
          {title}
        </h2>
        {excerpt && (
          <p className="mt-[var(--space-1)] line-clamp-2 text-[12px] text-[var(--color-text-secondary)]">
            {excerpt}
          </p>
        )}
        <div className="mt-auto flex items-center gap-[var(--space-2)] pt-[var(--space-3)] text-[11px] text-[var(--color-text-tertiary)]">
          {post.reading_time_minutes && (
            <span className="flex items-center gap-[2px]">
              <Clock size={11} strokeWidth={1.5} />
              {post.reading_time_minutes} min
            </span>
          )}
          {post.published_at && (
            <span>{new Date(post.published_at).toLocaleDateString()}</span>
          )}
        </div>
      </div>
    </Link>
  );
}

export default function BlogIndexPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language === "fr" ? "fr" : "en";
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get("page")) || 1;
  const categorySlug = searchParams.get("category") || undefined;
  const [posts, setPosts] = useState([]);
  const [total, setTotal] = useState(0);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => {});
    getTags()
      .then(setTags)
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    getPosts({ page, limit: LIMIT, categorySlug })
      .then(({ posts: p, total: t }) => {
        setPosts(p);
        setTotal(t);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, categorySlug]);

  const totalPages = Math.ceil(total / LIMIT);

  function goPage(p) {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(p));
    setSearchParams(params);
  }

  function filterByCategory(slug) {
    const params = new URLSearchParams();
    if (slug) params.set("category", slug);
    setSearchParams(params);
  }

  return (
    <>
      <SEOHead
        title={t("blog.metaTitle")}
        description={t("blog.metaDescription")}
      />
      <div className="mx-auto max-w-[1000px] px-[var(--space-4)] py-[var(--space-12)]">
        <h1 className="text-[28px] font-bold text-[var(--color-text-primary)]">
          {t("blog.title")}
        </h1>

        <div className="mt-[var(--space-6)] flex flex-col gap-[var(--space-8)] lg:flex-row">
          {/* Main grid */}
          <div className="flex-1">
            {loading ? (
              <div className="grid gap-[var(--space-4)] sm:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <Skeleton
                    key={i}
                    className="h-[260px] rounded-[var(--radius-lg)]"
                  />
                ))}
              </div>
            ) : posts.length === 0 ? (
              <p className="text-[13px] text-[var(--color-text-secondary)]">
                {t("blog.noPosts")}
              </p>
            ) : (
              <>
                <div className="grid gap-[var(--space-4)] sm:grid-cols-2 lg:grid-cols-3">
                  {posts.map((post) => (
                    <PostCard key={post.id} post={post} lang={lang} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-[var(--space-6)] flex items-center justify-center gap-[var(--space-2)]">
                    <button
                      onClick={() => goPage(page - 1)}
                      disabled={page <= 1}
                      className="rounded-[var(--radius-md)] p-[var(--space-1)] text-[var(--color-text-secondary)] disabled:opacity-30"
                    >
                      <ChevronLeft size={16} strokeWidth={1.5} />
                    </button>
                    <span className="text-[12px] text-[var(--color-text-secondary)]">
                      {page} / {totalPages}
                    </span>
                    <button
                      onClick={() => goPage(page + 1)}
                      disabled={page >= totalPages}
                      className="rounded-[var(--radius-md)] p-[var(--space-1)] text-[var(--color-text-secondary)] disabled:opacity-30"
                    >
                      <ChevronRight size={16} strokeWidth={1.5} />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Sidebar */}
          <aside className="w-full shrink-0 lg:w-[220px]">
            {/* Categories */}
            {categories.length > 0 && (
              <div>
                <h3 className="text-[13px] font-bold text-[var(--color-text-primary)]">
                  {t("blog.categories")}
                </h3>
                <ul className="mt-[var(--space-2)] flex flex-col gap-[var(--space-1)]">
                  <li>
                    <button
                      onClick={() => filterByCategory(null)}
                      className={`text-[12px] ${!categorySlug ? "font-bold text-[var(--color-brand-blue)]" : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"}`}
                    >
                      {t("blog.allCategories")}
                    </button>
                  </li>
                  {categories.map((cat) => (
                    <li key={cat.id}>
                      <button
                        onClick={() => filterByCategory(cat.slug)}
                        className={`text-[12px] ${categorySlug === cat.slug ? "font-bold text-[var(--color-brand-blue)]" : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"}`}
                      >
                        {cat[`name_${lang}`] || cat.name_en}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Tags */}
            {tags.length > 0 && (
              <div className="mt-[var(--space-6)]">
                <h3 className="text-[13px] font-bold text-[var(--color-text-primary)]">
                  {t("blog.tags")}
                </h3>
                <div className="mt-[var(--space-2)] flex flex-wrap gap-[var(--space-1)]">
                  {tags.map((tag) => (
                    <Badge
                      key={tag.id}
                      variant="outline"
                      className="text-[10px]"
                    >
                      {tag[`name_${lang}`] || tag.name_en}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </>
  );
}
