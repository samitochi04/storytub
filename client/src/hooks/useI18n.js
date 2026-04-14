import { useTranslation } from "react-i18next";
import { supabase } from "@/config/supabase";
import useAuthStore from "@/stores/authStore";

export default function useI18n() {
  const { i18n } = useTranslation();
  const user = useAuthStore((s) => s.user);

  const changeLanguage = async (lng) => {
    await i18n.changeLanguage(lng);

    // Persist language preference in profile if logged in
    if (user) {
      supabase
        .from("profiles")
        .update({ language: lng })
        .eq("id", user.id)
        .then(() => {});
    }
  };

  return {
    language: i18n.language,
    changeLanguage,
    languages: [
      { value: "en", label: "English" },
      { value: "fr", label: "Francais" },
    ],
  };
}
