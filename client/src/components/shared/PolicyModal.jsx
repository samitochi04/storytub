import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Modal, Button } from "@/components/ui";
import { supabase } from "@/config/supabase";
import useAuthStore from "@/stores/authStore";

export default function PolicyModal({ open, onClose }) {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const [accepting, setAccepting] = useState(false);

  async function handleAccept() {
    setAccepting(true);
    try {
      await supabase.from("policy_acceptances").insert({
        user_id: user.id,
        policy_type: "terms_and_privacy",
        policy_version: "1.0",
      });
      onClose();
    } catch {
      // non-blocking, close anyway
      onClose();
    } finally {
      setAccepting(false);
    }
  }

  return (
    <Modal open={open} onClose={() => {}} title={t("policy.title")}>
      <div className="flex flex-col gap-[var(--space-4)]">
        <p className="text-[13px] leading-[1.6] text-[var(--color-text-secondary)]">
          {t("policy.description")}
        </p>
        <div className="flex gap-[var(--space-3)] text-[12px]">
          <Link
            to="/terms"
            target="_blank"
            className="text-[var(--color-brand-blue)] underline"
          >
            {t("policy.viewTerms")}
          </Link>
          <Link
            to="/privacy"
            target="_blank"
            className="text-[var(--color-brand-blue)] underline"
          >
            {t("policy.viewPrivacy")}
          </Link>
        </div>
        <Button onClick={handleAccept} disabled={accepting}>
          {accepting ? t("policy.accepting") : t("policy.accept")}
        </Button>
      </div>
    </Modal>
  );
}
