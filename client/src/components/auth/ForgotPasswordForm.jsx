import { useState } from "react";
import { Link } from "react-router-dom";
import { Button, Input } from "@/components/ui";
import useAuth from "@/hooks/useAuth";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { forgotPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Please enter your email.");
      return;
    }

    setLoading(true);
    try {
      await forgotPassword(email);
      setSuccess(true);
    } catch (err) {
      setError(err.message || "Failed to send reset email.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center gap-[var(--space-4)] text-center">
        <div className="w-[48px] h-[48px] rounded-full bg-[var(--color-brand-blue)] flex items-center justify-center">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
          </svg>
        </div>
        <h2 className="text-[18px] font-bold text-[var(--color-text-primary)]">
          Check your email
        </h2>
        <p className="text-[13px] text-[var(--color-text-secondary)] max-w-[300px]">
          We sent a password reset link to{" "}
          <strong className="text-[var(--color-text-primary)]">{email}</strong>.
        </p>
        <Link
          to="/login"
          className="text-[12px] text-[var(--color-brand-blue)] hover:underline mt-[var(--space-4)]"
        >
          Back to login
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-[var(--space-6)]">
      <p className="text-[13px] text-[var(--color-text-secondary)] text-center">
        Enter your email and we will send you a link to reset your password.
      </p>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-[var(--space-4)]"
      >
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
        />

        {error && (
          <p className="text-[12px] text-[var(--color-error)]">{error}</p>
        )}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Sending..." : "Send reset link"}
        </Button>
      </form>

      <Link
        to="/login"
        className="text-[12px] text-[var(--color-text-secondary)] hover:text-[var(--color-brand-blue)] transition-colors duration-150 text-center"
      >
        Back to login
      </Link>
    </div>
  );
}
