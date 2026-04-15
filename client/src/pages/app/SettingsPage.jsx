import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { LogOut, Trash2, Globe, Moon } from "lucide-react";
import SEOHead from "@/components/layout/SEOHead";
import { Button, Select } from "@/components/ui";
import useAuth from "@/hooks/useAuth";
import useAuthStore from "@/stores/authStore";
import { supabase } from "@/config/supabase";
import { SUPPORTED_LANGUAGES } from "@/config/constants";

export default function SettingsPage() {
  const { t, i18n } = useTranslation();
  const { logout } = useAuth();
  const profile = useAuthStore((s) => s.profile);
  const setProfile = useAuthStore((s) => s.setProfile);
  const user = useAuthStore((s) => s.user);

  const [language, setLanguage] = useState(profile?.language || "en");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleLanguageChange = useCallback(
    async (value) => {
      setLanguage(value);
      setSaving(true);
      try {
        i18n.changeLanguage(value);
        const { data } = await supabase
          .from("profiles")
          .update({ language: value })
          .eq("id", user.id)
          .select()
          .single();
        if (data) setProfile(data);
      } catch {
        // silent
      } finally {
        setSaving(false);
      }
    },
    [user?.id, i18n, setProfile],
  );

  async function handleLogout() {
    try {
      await logout();
    } catch {
      // silent
    }
  }

  async function handleDeleteAccount() {
    if (!window.confirm(t("settings.confirmDelete"))) return;
    setDeleting(true);
    try {
      await supabase.rpc("delete_own_account");
      await logout();
    } catch {
      setDeleting(false);
    }
  }

  return (
    <>
      <SEOHead title={t("settings.title")} noindex />
      <div className="mx-auto max-w-[480px] px-[var(--space-4)] py-[var(--space-8)]">
        <h1 className="text-[20px] font-bold text-[var(--color-text-primary)]">
          {t("settings.title")}
        </h1>

        {/* Language preference */}
        <div className="mt-[var(--space-6)] rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-[var(--color-bg-card)] p-[var(--space-4)] shadow-[var(--shadow-sm)]">
          <div className="flex items-center gap-[var(--space-2)]">
            <Globe
              size={16}
              strokeWidth={1.5}
              className="text-[var(--color-text-secondary)]"
            />
            <h2 className="text-[14px] font-bold text-[var(--color-text-primary)]">
              {t("settings.language")}
            </h2>
          </div>
          <div className="mt-[var(--space-3)]">
            <Select
              value={language}
              onChange={handleLanguageChange}
              options={SUPPORTED_LANGUAGES.map((l) => ({
                value: l.value,
                label: l.label,
              }))}
              disabled={saving}
            />
          </div>
        </div>

        {/* Account actions */}
        <div className="mt-[var(--space-4)] rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-[var(--color-bg-card)] p-[var(--space-4)] shadow-[var(--shadow-sm)]">
          <h2 className="text-[14px] font-bold text-[var(--color-text-primary)]">
            {t("settings.account")}
          </h2>
          <div className="mt-[var(--space-3)] flex flex-col gap-[var(--space-2)]">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleLogout}
              className="justify-start"
            >
              <LogOut size={14} strokeWidth={1.5} />
              {t("settings.logout")}
            </Button>
          </div>
        </div>

        {/* Danger zone */}
        <div className="mt-[var(--space-4)] rounded-[var(--radius-lg)] border border-[var(--color-error)]/20 bg-[var(--color-bg-card)] p-[var(--space-4)] shadow-[var(--shadow-sm)]">
          <h2 className="text-[14px] font-bold text-[var(--color-error)]">
            {t("settings.dangerZone")}
          </h2>
          <p className="mt-[var(--space-1)] text-[12px] text-[var(--color-text-secondary)]">
            {t("settings.deleteDescription")}
          </p>
          <Button
            variant="danger"
            size="sm"
            onClick={handleDeleteAccount}
            disabled={deleting}
            className="mt-[var(--space-3)]"
          >
            <Trash2 size={14} strokeWidth={1.5} />
            {t("settings.deleteAccount")}
          </Button>
        </div>
      </div>
    </>
  );
}
