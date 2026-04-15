import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Send, ArrowLeft, Clock, AlertCircle } from "lucide-react";
import SEOHead from "@/components/layout/SEOHead";
import { Button, Input, Textarea, Select, Badge } from "@/components/ui";
import { supabase } from "@/config/supabase";
import useAuthStore from "@/stores/authStore";

const CATEGORIES = [
  "billing",
  "technical",
  "account",
  "feature_request",
  "bug_report",
];

const PRIORITIES = ["low", "normal", "high"];

const STATUS_COLORS = {
  open: "secondary",
  in_progress: "default",
  waiting: "warning",
  resolved: "success",
  closed: "outline",
};

function TicketForm({ onCreated, onCancel }) {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const [form, setForm] = useState({
    subject: "",
    category: "technical",
    priority: "normal",
    message: "",
  });
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSending(true);
    setError(null);
    try {
      const { data: ticket, error: ticketErr } = await supabase
        .from("support_tickets")
        .insert({
          user_id: user.id,
          subject: form.subject,
          category: form.category,
          priority: form.priority,
        })
        .select()
        .single();
      if (ticketErr) throw ticketErr;

      const { error: msgErr } = await supabase.from("support_messages").insert({
        ticket_id: ticket.id,
        sender_id: user.id,
        is_staff: false,
        message: form.message,
      });
      if (msgErr) throw msgErr;

      onCreated();
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-[var(--space-4)] rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-[var(--color-bg-card)] p-[var(--space-5)] shadow-[var(--shadow-sm)]"
    >
      <Input
        label={t("support.subject")}
        value={form.subject}
        onChange={(e) => updateField("subject", e.target.value)}
        required
      />
      <div className="grid gap-[var(--space-4)] sm:grid-cols-2">
        <Select
          label={t("support.category")}
          value={form.category}
          onChange={(e) => updateField("category", e.target.value)}
          options={CATEGORIES.map((c) => ({
            value: c,
            label: t(`support.cat_${c}`),
          }))}
        />
        <Select
          label={t("support.priority")}
          value={form.priority}
          onChange={(e) => updateField("priority", e.target.value)}
          options={PRIORITIES.map((p) => ({
            value: p,
            label: t(`support.priority_${p}`),
          }))}
        />
      </div>
      <Textarea
        label={t("support.message")}
        value={form.message}
        onChange={(e) => updateField("message", e.target.value)}
        rows={5}
        required
      />
      {error && (
        <p className="text-[12px] text-[var(--color-error)]">{error}</p>
      )}
      <div className="flex gap-[var(--space-2)]">
        <Button type="submit" disabled={sending}>
          <Send size={14} strokeWidth={1.5} />
          {sending ? t("support.sending") : t("support.send")}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          {t("common.cancel")}
        </Button>
      </div>
    </form>
  );
}

function TicketThread({ ticket, onBack }) {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const [messages, setMessages] = useState([]);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const isClosed = ticket.status === "closed" || ticket.status === "resolved";

  useEffect(() => {
    supabase
      .from("support_messages")
      .select("*")
      .eq("ticket_id", ticket.id)
      .order("created_at", { ascending: true })
      .then(({ data }) => setMessages(data || []));
  }, [ticket.id]);

  async function handleReply(e) {
    e.preventDefault();
    if (!reply.trim()) return;
    setSending(true);
    const { data, error } = await supabase
      .from("support_messages")
      .insert({
        ticket_id: ticket.id,
        sender_id: user.id,
        is_staff: false,
        message: reply.trim(),
      })
      .select()
      .single();
    if (!error && data) {
      setMessages((prev) => [...prev, data]);
      setReply("");
    }
    setSending(false);
  }

  return (
    <div>
      <button
        onClick={onBack}
        className="mb-[var(--space-4)] inline-flex items-center gap-[var(--space-1)] text-[12px] text-[var(--color-text-tertiary)] hover:text-[var(--color-brand-blue)]"
      >
        <ArrowLeft size={14} strokeWidth={1.5} />
        {t("support.backToTickets")}
      </button>

      <div className="rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-[var(--color-bg-card)] p-[var(--space-5)] shadow-[var(--shadow-sm)]">
        <div className="flex items-start justify-between gap-[var(--space-2)]">
          <h2 className="text-[16px] font-bold text-[var(--color-text-primary)]">
            {ticket.subject}
          </h2>
          <Badge
            variant={STATUS_COLORS[ticket.status] || "outline"}
            className="text-[10px]"
          >
            {t(`support.status_${ticket.status}`)}
          </Badge>
        </div>

        <div className="mt-[var(--space-4)] flex flex-col gap-[var(--space-3)]">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`rounded-[var(--radius-md)] p-[var(--space-3)] text-[12px] ${
                msg.is_staff
                  ? "bg-[var(--color-brand-blue)]/5 border-l-2 border-[var(--color-brand-blue)]"
                  : "bg-[var(--color-bg-page)]"
              }`}
            >
              <div className="mb-[var(--space-1)] flex items-center gap-[var(--space-2)] text-[11px] text-[var(--color-text-tertiary)]">
                <span className="font-bold">
                  {msg.is_staff ? t("support.staff") : t("support.you")}
                </span>
                <span>{new Date(msg.created_at).toLocaleString()}</span>
              </div>
              <p className="whitespace-pre-wrap text-[var(--color-text-secondary)]">
                {msg.message}
              </p>
            </div>
          ))}
        </div>

        {!isClosed && (
          <form
            onSubmit={handleReply}
            className="mt-[var(--space-4)] flex gap-[var(--space-2)]"
          >
            <Textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              rows={2}
              placeholder={t("support.replyPlaceholder")}
              className="flex-1"
            />
            <Button type="submit" disabled={sending || !reply.trim()} size="sm">
              <Send size={14} strokeWidth={1.5} />
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function SupportPage() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const [view, setView] = useState("list"); // "list" | "new" | "thread"
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [loading, setLoading] = useState(true);

  function fetchTickets() {
    setLoading(true);
    supabase
      .from("support_tickets")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setTickets(data || []);
        setLoading(false);
      });
  }

  useEffect(() => {
    fetchTickets();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function openTicket(ticket) {
    setSelectedTicket(ticket);
    setView("thread");
  }

  return (
    <>
      <SEOHead title={t("support.title")} noindex />
      <div className="mx-auto max-w-[700px] px-[var(--space-4)] py-[var(--space-8)]">
        <div className="flex items-center justify-between">
          <h1 className="text-[20px] font-bold text-[var(--color-text-primary)]">
            {t("support.title")}
          </h1>
          {view === "list" && (
            <Button size="sm" onClick={() => setView("new")}>
              <Plus size={14} strokeWidth={1.5} />
              {t("support.newTicket")}
            </Button>
          )}
        </div>

        <div className="mt-[var(--space-6)]">
          {view === "new" && (
            <TicketForm
              onCreated={() => {
                setView("list");
                fetchTickets();
              }}
              onCancel={() => setView("list")}
            />
          )}

          {view === "thread" && selectedTicket && (
            <TicketThread
              ticket={selectedTicket}
              onBack={() => {
                setView("list");
                fetchTickets();
              }}
            />
          )}

          {view === "list" && (
            <>
              {loading ? (
                <p className="text-[12px] text-[var(--color-text-tertiary)]">
                  {t("common.loading")}
                </p>
              ) : tickets.length === 0 ? (
                <div className="flex flex-col items-center gap-[var(--space-2)] py-[var(--space-12)] text-center">
                  <AlertCircle
                    size={24}
                    strokeWidth={1.5}
                    className="text-[var(--color-text-tertiary)]"
                  />
                  <p className="text-[13px] text-[var(--color-text-secondary)]">
                    {t("support.noTickets")}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-[var(--space-2)]">
                  {tickets.map((ticket) => (
                    <button
                      key={ticket.id}
                      onClick={() => openTicket(ticket)}
                      className="flex items-center justify-between rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-[var(--color-bg-card)] p-[var(--space-3)] text-left shadow-[var(--shadow-sm)] transition-shadow hover:shadow-[var(--shadow-md)]"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-bold text-[var(--color-text-primary)]">
                          {ticket.subject}
                        </p>
                        <div className="mt-[var(--space-1)] flex items-center gap-[var(--space-2)] text-[11px] text-[var(--color-text-tertiary)]">
                          <Clock size={11} strokeWidth={1.5} />
                          {new Date(ticket.created_at).toLocaleDateString()}
                          <Badge
                            variant={STATUS_COLORS[ticket.status] || "outline"}
                            className="text-[9px]"
                          >
                            {t(`support.status_${ticket.status}`)}
                          </Badge>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
