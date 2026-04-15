import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Send, Mail, MapPin } from "lucide-react";
import SEOHead from "@/components/layout/SEOHead";
import { Button, Input, Textarea } from "@/components/ui";
import { api } from "@/config/api";

export default function ContactPage() {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSending(true);
    setError(null);
    try {
      await api.post("/email/contact", form);
      setSent(true);
    } catch (err) {
      setError(err.body?.message || err.message);
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <SEOHead
        title={t("contact.metaTitle")}
        description={t("contact.metaDescription")}
      />
      <div className="mx-auto max-w-[600px] px-[var(--space-4)] py-[var(--space-16)]">
        <div className="text-center">
          <h1 className="text-[28px] font-bold text-[var(--color-text-primary)]">
            {t("contact.title")}
          </h1>
          <p className="mt-[var(--space-2)] text-[14px] text-[var(--color-text-secondary)]">
            {t("contact.subtitle")}
          </p>
        </div>

        {/* Info */}
        <div className="mt-[var(--space-8)] flex flex-wrap justify-center gap-[var(--space-6)]">
          <div className="flex items-center gap-[var(--space-2)] text-[12px] text-[var(--color-text-secondary)]">
            <Mail size={14} strokeWidth={1.5} />
            support@storytub.com
          </div>
          <div className="flex items-center gap-[var(--space-2)] text-[12px] text-[var(--color-text-secondary)]">
            <MapPin size={14} strokeWidth={1.5} />
            Montreal, Canada
          </div>
        </div>

        {sent ? (
          <div className="mt-[var(--space-8)] rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-[var(--color-bg-card)] p-[var(--space-6)] text-center shadow-[var(--shadow-sm)]">
            <p className="text-[14px] font-bold text-[var(--color-success)]">
              {t("contact.sent")}
            </p>
            <p className="mt-[var(--space-2)] text-[12px] text-[var(--color-text-secondary)]">
              {t("contact.sentDescription")}
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="mt-[var(--space-8)] flex flex-col gap-[var(--space-4)] rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-[var(--color-bg-card)] p-[var(--space-6)] shadow-[var(--shadow-sm)]"
          >
            <Input
              label={t("contact.name")}
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              required
            />
            <Input
              label={t("contact.email")}
              type="email"
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
              required
            />
            <Input
              label={t("contact.subject")}
              value={form.subject}
              onChange={(e) => updateField("subject", e.target.value)}
              required
            />
            <Textarea
              label={t("contact.message")}
              value={form.message}
              onChange={(e) => updateField("message", e.target.value)}
              rows={5}
              required
            />
            {error && (
              <p className="text-[12px] text-[var(--color-error)]">{error}</p>
            )}
            <Button type="submit" disabled={sending}>
              <Send size={14} strokeWidth={1.5} />
              {sending ? t("contact.sending") : t("contact.send")}
            </Button>
          </form>
        )}
      </div>
    </>
  );
}
