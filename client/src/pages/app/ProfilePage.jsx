import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Camera } from "lucide-react";
import SEOHead from "@/components/layout/SEOHead";
import { Button, Input, Avatar, Spinner } from "@/components/ui";
import useAuthStore from "@/stores/authStore";
import { supabase } from "@/config/supabase";

export default function ProfilePage() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const profile = useAuthStore((s) => s.profile);
  const setProfile = useAuthStore((s) => s.setProfile);

  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || "");
      setAvatarUrl(profile.avatar_url || "");
    }
  }, [profile]);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const { data, error: err } = await supabase
        .from("profiles")
        .update({
          display_name: displayName.trim(),
          avatar_url: avatarUrl.trim() || null,
        })
        .eq("id", user.id)
        .select()
        .single();
      if (err) throw err;
      setProfile(data);
      setSaved(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (!profile) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner size={28} />
      </div>
    );
  }

  return (
    <>
      <SEOHead title={t("profile.title")} noindex />
      <div className="mx-auto max-w-[480px] px-[var(--space-4)] py-[var(--space-8)]">
        <h1 className="text-[20px] font-bold text-[var(--color-text-primary)]">
          {t("profile.title")}
        </h1>

        {/* Avatar preview */}
        <div className="mt-[var(--space-6)] flex items-center gap-[var(--space-4)]">
          <div className="relative">
            <Avatar
              src={avatarUrl || undefined}
              name={displayName || user.email}
              size={56}
            />
            <div className="absolute -bottom-1 -right-1 flex h-[20px] w-[20px] items-center justify-center rounded-full bg-[var(--color-bg-card)] border border-[var(--color-border-default)]">
              <Camera
                size={10}
                strokeWidth={1.5}
                className="text-[var(--color-text-tertiary)]"
              />
            </div>
          </div>
          <div>
            <p className="text-[13px] font-bold text-[var(--color-text-primary)]">
              {displayName || user.email}
            </p>
            <p className="text-[11px] text-[var(--color-text-tertiary)]">
              {user.email}
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSave}
          className="mt-[var(--space-6)] flex flex-col gap-[var(--space-4)]"
        >
          <Input
            label={t("profile.displayName")}
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder={t("profile.displayNamePlaceholder")}
            maxLength={100}
          />
          <Input
            label={t("profile.avatarUrl")}
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            placeholder="https://..."
          />
          <Input label={t("profile.email")} value={user.email} disabled />
          <Input
            label={t("profile.plan")}
            value={
              (profile.subscription_plan || "free").charAt(0).toUpperCase() +
              (profile.subscription_plan || "free").slice(1)
            }
            disabled
          />

          {error && (
            <p className="text-[11px] text-[var(--color-error)]">{error}</p>
          )}
          {saved && (
            <p className="text-[11px] text-[var(--color-success)]">
              {t("profile.saved")}
            </p>
          )}

          <Button
            type="submit"
            size="md"
            disabled={saving}
            className="self-start"
          >
            {saving ? t("profile.saving") : t("profile.save")}
          </Button>
        </form>
      </div>
    </>
  );
}
