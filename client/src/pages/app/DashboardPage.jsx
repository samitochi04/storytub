import { useState } from "react";
import SEOHead from "@/components/layout/SEOHead";
import GreetingBlock from "@/components/dashboard/GreetingBlock";
import PromptCards from "@/components/dashboard/PromptCards";
import PromptInput from "@/components/dashboard/PromptInput";

export default function DashboardPage() {
  const [promptValue, setPromptValue] = useState("");

  return (
    <>
      <SEOHead title="Dashboard" noindex />
      <div className="mx-auto flex min-h-[calc(100vh-72px)] max-w-[600px] flex-col justify-center px-[var(--space-8)] py-[var(--space-8)]">
        <GreetingBlock />
        <PromptCards onSelect={setPromptValue} />
        <PromptInput initialValue={promptValue} />
      </div>
    </>
  );
}
