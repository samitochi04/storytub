import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Mic, Upload, Trash2, Lock, Play, Pause } from "lucide-react";
import SEOHead from "@/components/layout/SEOHead";
import { Button, Badge, Spinner, Card, Input } from "@/components/ui";
import useAuthStore from "@/stores/authStore";
import { listVoices, cloneVoice, deleteVoice } from "@/services/video.service";

export default function VoicesPage() {
  const { t } = useTranslation();
  const profile = useAuthStore((s) => s.profile);
  const isPremium = profile?.subscription_plan === "premium";

  const [voices, setVoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cloneName, setCloneName] = useState("");
  const [cloneFile, setCloneFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const fileRef = useRef(null);

  useEffect(() => {
    listVoices()
      .then(setVoices)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleClone(e) {
    e.preventDefault();
    if (!cloneName.trim() || !cloneFile) return;
    setUploading(true);
    setError(null);
    try {
      const created = await cloneVoice(cloneName.trim(), cloneFile);
      setVoices((prev) => [...prev, created]);
      setCloneName("");
      setCloneFile(null);
      if (fileRef.current) fileRef.current.value = "";
    } catch (err) {
      setError(err.body?.message || err.message);
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(voiceId) {
    if (!window.confirm(t("voices.confirmDelete"))) return;
    try {
      await deleteVoice(voiceId);
      setVoices((prev) => prev.filter((v) => v.id !== voiceId));
    } catch {
      // silent
    }
  }

  const builtIn = voices.filter((v) => !v.is_cloned);
  const cloned = voices.filter((v) => v.is_cloned);

  return (
    <>
      <SEOHead title={t("voices.title")} noindex />
      <div className="mx-auto max-w-[700px] px-[var(--space-4)] py-[var(--space-8)]">
        <h1 className="text-[20px] font-bold text-[var(--color-text-primary)]">
          {t("voices.title")}
        </h1>
        <p className="mt-[var(--space-1)] text-[13px] text-[var(--color-text-secondary)]">
          {t("voices.subtitle")}
        </p>

        {/* Clone section */}
        <div className="mt-[var(--space-6)] rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-[var(--color-bg-card)] p-[var(--space-4)] shadow-[var(--shadow-sm)]">
          <div className="flex items-center gap-[var(--space-2)]">
            <Mic
              size={16}
              strokeWidth={1.5}
              className="text-[var(--color-brand)]"
            />
            <h2 className="text-[14px] font-bold text-[var(--color-text-primary)]">
              {t("voices.cloneTitle")}
            </h2>
            {!isPremium && (
              <Badge variant="warning" size="sm" className="ml-auto">
                <Lock size={10} strokeWidth={1.5} />
                Premium
              </Badge>
            )}
          </div>

          {isPremium ? (
            <form
              onSubmit={handleClone}
              className="mt-[var(--space-3)] flex flex-col gap-[var(--space-3)]"
            >
              <Input
                label={t("voices.cloneNameLabel")}
                value={cloneName}
                onChange={(e) => setCloneName(e.target.value)}
                placeholder={t("voices.cloneNamePlaceholder")}
                maxLength={50}
              />
              <div>
                <label className="text-[12px] font-normal text-[var(--color-text-secondary)]">
                  {t("voices.audioFileLabel")}
                </label>
                <input
                  ref={fileRef}
                  type="file"
                  accept="audio/*"
                  onChange={(e) => setCloneFile(e.target.files?.[0] || null)}
                  className="mt-[var(--space-1)] block w-full text-[13px] text-[var(--color-text-primary)] file:mr-[var(--space-2)] file:rounded-[var(--radius-md)] file:border-0 file:bg-[var(--color-bg-hover)] file:px-[var(--space-3)] file:py-[var(--space-2)] file:text-[12px] file:font-normal file:text-[var(--color-text-secondary)]"
                />
              </div>
              {error && (
                <p className="text-[12px] text-[var(--color-error)]">{error}</p>
              )}
              <Button
                type="submit"
                size="sm"
                disabled={uploading || !cloneName.trim() || !cloneFile}
                className="self-start"
              >
                <Upload size={14} strokeWidth={1.5} />
                {uploading ? t("voices.uploading") : t("voices.cloneButton")}
              </Button>
            </form>
          ) : (
            <p className="mt-[var(--space-2)] text-[12px] text-[var(--color-text-tertiary)]">
              {t("voices.premiumOnly")}
            </p>
          )}
        </div>

        {/* Voice lists */}
        {loading ? (
          <div className="mt-[var(--space-6)] flex justify-center">
            <Spinner size={24} />
          </div>
        ) : (
          <>
            {/* Cloned voices */}
            {cloned.length > 0 && (
              <section className="mt-[var(--space-6)]">
                <h2 className="text-[14px] font-bold text-[var(--color-text-primary)]">
                  {t("voices.myVoices")}
                </h2>
                <div className="mt-[var(--space-3)] grid gap-[var(--space-2)]">
                  {cloned.map((v) => (
                    <VoiceRow
                      key={v.id}
                      voice={v}
                      onDelete={() => handleDelete(v.id)}
                      t={t}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Built-in voices */}
            <section className="mt-[var(--space-6)]">
              <h2 className="text-[14px] font-bold text-[var(--color-text-primary)]">
                {t("voices.builtIn")}
              </h2>
              {builtIn.length === 0 ? (
                <p className="mt-[var(--space-2)] text-[12px] text-[var(--color-text-tertiary)]">
                  {t("voices.noVoices")}
                </p>
              ) : (
                <div className="mt-[var(--space-3)] grid gap-[var(--space-2)]">
                  {builtIn.map((v) => (
                    <VoiceRow key={v.id} voice={v} t={t} />
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </>
  );
}

function VoiceRow({ voice, onDelete, t }) {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef(null);

  function togglePreview() {
    if (!voice.preview_url) return;
    if (playing) {
      audioRef.current?.pause();
      setPlaying(false);
    } else {
      if (!audioRef.current) {
        audioRef.current = new Audio(voice.preview_url);
        audioRef.current.addEventListener("ended", () => setPlaying(false));
      }
      audioRef.current.play();
      setPlaying(true);
    }
  }

  return (
    <div className="flex items-center gap-[var(--space-3)] rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-[var(--color-bg-card)] px-[var(--space-3)] py-[var(--space-2)] shadow-[var(--shadow-sm)]">
      <button
        onClick={togglePreview}
        disabled={!voice.preview_url}
        className="flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-full bg-[var(--color-bg-hover)] text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-brand)] hover:text-white disabled:opacity-40"
      >
        {playing ? (
          <Pause size={12} strokeWidth={1.5} />
        ) : (
          <Play size={12} strokeWidth={1.5} />
        )}
      </button>

      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-bold text-[var(--color-text-primary)]">
          {voice.name}
        </p>
        <p className="text-[11px] text-[var(--color-text-tertiary)]">
          {voice.language?.toUpperCase()}
        </p>
      </div>

      {voice.is_cloned && (
        <Badge variant="info" size="sm">
          {t("voices.cloned")}
        </Badge>
      )}

      {onDelete && (
        <button
          onClick={onDelete}
          className="shrink-0 text-[var(--color-text-tertiary)] transition-colors hover:text-[var(--color-error)]"
        >
          <Trash2 size={14} strokeWidth={1.5} />
        </button>
      )}
    </div>
  );
}
