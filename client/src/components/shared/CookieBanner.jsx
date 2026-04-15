import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Cookie } from "lucide-react";
import { Button } from "@/components/ui";
import { supabase } from "@/config/supabase";
import useAuthStore from "@/stores/authStore";

const STORAGE_KEY = "storytub_cookie_consent";

export default function CookieBanner() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) setVisible(true);
  }, []);

  async function handleConsent(accepted) {
    localStorage.setItem(STORAGE_KEY, accepted ? "accepted" : "declined");
    setVisible(false);

    try {
      await supabase.from("cookie_consents").insert({
        user_id: user?.id || null,
        accepted,
        user_agent: navigator.userAgent,
      });
    } catch {
      // non-blocking
    }
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--color-border-default)] bg-[var(--color-bg-card)] px-[var(--space-4)] py-[var(--space-4)] shadow-[var(--shadow-lg)]">
      <div className="mx-auto flex max-w-[800px] flex-col items-start gap-[var(--space-3)] sm:flex-row sm:items-center">
        <Cookie
          size={20}
          strokeWidth={1.5}
          className="shrink-0 text-[var(--color-text-tertiary)]"
        />
        <p className="flex-1 text-[12px] leading-[1.5] text-[var(--color-text-secondary)]">
          {t("cookie.message")}{" "}
          <Link
            to="/privacy"
            className="underline hover:text-[var(--color-brand-blue)]"
          >
            {t("cookie.learnMore")}
          </Link>
        </p>
        <div className="flex gap-[var(--space-2)]">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleConsent(false)}
          >
            {t("cookie.decline")}
          </Button>
          <Button size="sm" onClick={() => handleConsent(true)}>
            {t("cookie.accept")}
          </Button>
        </div>
      </div>
    </div>
  );
}
