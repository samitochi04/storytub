import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Plus,
  Send,
  ArrowLeft,
  Clock,
  MessageSquare,
  HelpCircle,
  ChevronRight,
} from "lucide-react";
import SEOHead from "@/components/layout/SEOHead";
import { Button, Input, Textarea, Select, Badge } from "@/components/ui";
import { supabase } from "@/config/supabase";
import { api } from "@/config/api";
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
      await api.post("/support/tickets", {
        subject: form.subject,
        category: form.category,
        priority: form.priority,
        message: form.message,
      });
      onCreated();
    } catch (err) {
      setError(err.body?.message || err.message);
    } finally {
      setSending(false);
    }
  }

  return (
    <div>
      <button
        onClick={onCancel}
        className="mb-[var(--space-4)] inline-flex items-center gap-[var(--space-1)] text-[12px] text-[var(--color-text-tertiary)] hover:text-[var(--color-brand-blue)] transition-colors"
      >
        <ArrowLeft size={14} strokeWidth={1.5} />
        {t("support.backToTickets")}
      </button>

      <div className="rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-[var(--color-bg-card)] shadow-[var(--shadow-sm)]">
        <div className="border-b border-[var(--color-border-default)] px-[var(--space-5)] py-[var(--space-4)]">
          <h2 className="text-[14px] font-bold text-[var(--color-text-primary)]">
            {t("support.newTicket")}
          </h2>
          <p className="mt-[var(--space-1)] text-[12px] text-[var(--color-text-tertiary)]">
            {t("support.formDescription")}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-[var(--space-4)] p-[var(--space-5)]"
        >
          <Input
            label={t("support.subject")}
            value={form.subject}
            onChange={(e) => updateField("subject", e.target.value)}
            placeholder={t("support.subjectPlaceholder")}
            required
          />

          <div className="grid gap-[var(--space-4)] sm:grid-cols-2">
            <Select
              label={t("support.category")}
              value={form.category}
              onChange={(value) => updateField("category", value)}
              options={CATEGORIES.map((c) => ({
                value: c,
                label: t(`support.cat_${c}`),
              }))}
            />
            <Select
              label={t("support.priority")}
              value={form.priority}
              onChange={(value) => updateField("priority", value)}
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
            rows={6}
            placeholder={t("support.messagePlaceholder")}
            required
          />

          {error && (
            <p className="text-[12px] text-[var(--color-error)]">{error}</p>
          )}

          <div className="flex items-center justify-end gap-[var(--space-2)] border-t border-[var(--color-border-default)] pt-[var(--space-4)]">
            <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
              {t("common.cancel")}
            </Button>
            <Button type="submit" size="sm" disabled={sending}>
              <Send size={14} strokeWidth={1.5} />
              {sending ? t("support.sending") : t("support.send")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function TicketThread({ ticket, onBack }) {
  const { t } = useTranslation();
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
    try {
      const data = await api.post(`/support/tickets/${ticket.id}/reply`, {
        message: reply.trim(),
      });
      if (data) {
        setMessages((prev) => [...prev, data]);
        setReply("");
      }
    } catch {
      // silent
    }
    setSending(false);
  }

  return (
    <div>
      <button
        onClick={onBack}
        className="mb-[var(--space-4)] inline-flex items-center gap-[var(--space-1)] text-[12px] text-[var(--color-text-tertiary)] hover:text-[var(--color-brand-blue)] transition-colors"
      >
        <ArrowLeft size={14} strokeWidth={1.5} />
        {t("support.backToTickets")}
      </button>

      <div className="rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-[var(--color-bg-card)] shadow-[var(--shadow-sm)]">
        {/* Thread header */}
        <div className="flex items-center justify-between gap-[var(--space-3)] border-b border-[var(--color-border-default)] px-[var(--space-5)] py-[var(--space-4)]">
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-[14px] font-bold text-[var(--color-text-primary)]">
              {ticket.subject}
            </h2>
            <p className="mt-[2px] text-[11px] text-[var(--color-text-tertiary)]">
              {t(`support.cat_${ticket.category}`)} &middot;{" "}
              {new Date(ticket.created_at).toLocaleDateString()}
            </p>
          </div>
          <Badge
            variant={STATUS_COLORS[ticket.status] || "outline"}
            className="shrink-0 text-[10px]"
          >
            {t(`support.status_${ticket.status}`)}
          </Badge>
        </div>

        {/* Messages */}
        <div className="flex flex-col gap-[var(--space-1)] p-[var(--space-4)]">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`rounded-[var(--radius-md)] px-[var(--space-4)] py-[var(--space-3)] ${
                msg.is_staff
                  ? "bg-[var(--color-brand-blue)]/5 border border-[var(--color-brand-blue)]/10"
                  : "bg-[var(--color-bg-page)]"
              }`}
            >
              <div className="mb-[var(--space-1)] flex items-center justify-between">
                <span
                  className={`text-[11px] font-bold ${
                    msg.is_staff
                      ? "text-[var(--color-brand-blue)]"
                      : "text-[var(--color-text-secondary)]"
                  }`}
                >
                  {msg.is_staff ? t("support.staff") : t("support.you")}
                </span>
                <span className="text-[10px] text-[var(--color-text-tertiary)]">
                  {new Date(msg.created_at).toLocaleString()}
                </span>
              </div>
              <p className="whitespace-pre-wrap text-[12px] leading-[1.6] text-[var(--color-text-primary)]">
                {msg.message}
              </p>
            </div>
          ))}
        </div>

        {/* Reply input */}
        {!isClosed ? (
          <form
            onSubmit={handleReply}
            className="flex items-end gap-[var(--space-2)] border-t border-[var(--color-border-default)] p-[var(--space-4)]"
          >
            <Textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              rows={2}
              placeholder={t("support.replyPlaceholder")}
              className="flex-1"
            />
            <Button
              type="submit"
              disabled={sending || !reply.trim()}
              size="sm"
              className="shrink-0 self-end"
            >
              <Send size={14} strokeWidth={1.5} />
            </Button>
          </form>
        ) : (
          <div className="border-t border-[var(--color-border-default)] px-[var(--space-5)] py-[var(--space-3)]">
            <p className="text-center text-[11px] text-[var(--color-text-tertiary)]">
              {t("support.ticketClosed")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SupportPage() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const [view, setView] = useState("list");
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
          <div>
            <h1 className="text-[20px] font-bold text-[var(--color-text-primary)]">
              {t("support.title")}
            </h1>
            <p className="mt-[var(--space-1)] text-[12px] text-[var(--color-text-tertiary)]">
              {t("support.subtitle")}
            </p>
          </div>
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
                <div className="flex flex-col items-center gap-[var(--space-3)] rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-[var(--color-bg-card)] py-[var(--space-12)] text-center shadow-[var(--shadow-sm)]">
                  <div className="flex h-[48px] w-[48px] items-center justify-center rounded-full bg-[var(--color-bg-page)]">
                    <HelpCircle
                      size={22}
                      strokeWidth={1.5}
                      className="text-[var(--color-text-tertiary)]"
                    />
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-[var(--color-text-primary)]">
                      {t("support.noTickets")}
                    </p>
                    <p className="mt-[var(--space-1)] text-[12px] text-[var(--color-text-tertiary)]">
                      {t("support.noTicketsHint")}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setView("new")}
                    className="mt-[var(--space-2)]"
                  >
                    <Plus size={14} strokeWidth={1.5} />
                    {t("support.newTicket")}
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-[var(--space-2)]">
                  {tickets.map((ticket) => (
                    <button
                      key={ticket.id}
                      onClick={() => openTicket(ticket)}
                      className="flex items-center gap-[var(--space-3)] rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-[var(--color-bg-card)] p-[var(--space-4)] text-left shadow-[var(--shadow-sm)] transition-all hover:border-[var(--color-border-hover)] hover:shadow-[var(--shadow-md)]"
                    >
                      <div className="flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-bg-page)]">
                        <MessageSquare
                          size={16}
                          strokeWidth={1.5}
                          className="text-[var(--color-text-tertiary)]"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-bold text-[var(--color-text-primary)]">
                          {ticket.subject}
                        </p>
                        <div className="mt-[2px] flex items-center gap-[var(--space-2)] text-[11px] text-[var(--color-text-tertiary)]">
                          <span>{t(`support.cat_${ticket.category}`)}</span>
                          <span>&middot;</span>
                          <Clock size={10} strokeWidth={1.5} />
                          <span>
                            {new Date(ticket.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-[var(--space-2)]">
                        <Badge
                          variant={STATUS_COLORS[ticket.status] || "outline"}
                          className="text-[9px]"
                        >
                          {t(`support.status_${ticket.status}`)}
                        </Badge>
                        <ChevronRight
                          size={14}
                          strokeWidth={1.5}
                          className="text-[var(--color-text-tertiary)]"
                        />
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
