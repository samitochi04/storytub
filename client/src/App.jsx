import { Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import { Spinner } from "@/components/ui";
import { PublicLayout, AppShell, AdminLayout } from "@/components/layout";
import { ProtectedRoute, StaffRoute } from "@/components/auth";

// ---- Public pages ----
import HomePage from "@/pages/public/HomePage";
import FeaturesPage from "@/pages/public/FeaturesPage";
import PricingPage from "@/pages/public/PricingPage";
import AboutPage from "@/pages/public/AboutPage";
import BlogIndexPage from "@/pages/public/BlogIndexPage";
import BlogPostPage from "@/pages/public/BlogPostPage";
import ContactPage from "@/pages/public/ContactPage";
import LoginPage from "@/pages/public/LoginPage";
import SignupPage from "@/pages/public/SignupPage";
import ForgotPasswordPage from "@/pages/public/ForgotPasswordPage";
import ResetPasswordPage from "@/pages/public/ResetPasswordPage";
import TermsPage from "@/pages/public/TermsPage";
import PrivacyPage from "@/pages/public/PrivacyPage";
import NotFoundPage from "@/pages/public/NotFoundPage";
import AuthCallbackPage from "@/pages/public/AuthCallbackPage";

// ---- App pages (lazy loaded) ----
const DashboardPage = lazy(() => import("@/pages/app/DashboardPage"));
const GeneratePage = lazy(() => import("@/pages/app/GeneratePage"));
const VideosPage = lazy(() => import("@/pages/app/VideosPage"));
const VideoDetailPage = lazy(() => import("@/pages/app/VideoDetailPage"));
const ProfilePage = lazy(() => import("@/pages/app/ProfilePage"));
const SettingsPage = lazy(() => import("@/pages/app/SettingsPage"));
const BillingPage = lazy(() => import("@/pages/app/BillingPage"));
const VoicesPage = lazy(() => import("@/pages/app/VoicesPage"));
const NotificationsPage = lazy(() => import("@/pages/app/NotificationsPage"));
const SupportPage = lazy(() => import("@/pages/app/SupportPage"));

// ---- Admin pages (lazy loaded) ----
const AdminDashboardPage = lazy(
  () => import("@/pages/admin/AdminDashboardPage"),
);
const AdminUsersPage = lazy(() => import("@/pages/admin/AdminUsersPage"));
const AdminVideosPage = lazy(() => import("@/pages/admin/AdminVideosPage"));
const AdminBlogPage = lazy(() => import("@/pages/admin/AdminBlogPage"));
const AdminCouponsPage = lazy(() => import("@/pages/admin/AdminCouponsPage"));
const AdminStaffPage = lazy(() => import("@/pages/admin/AdminStaffPage"));
const AdminBillingPage = lazy(() => import("@/pages/admin/AdminBillingPage"));
const AdminEmailPage = lazy(() => import("@/pages/admin/AdminEmailPage"));
const AdminAnalyticsPage = lazy(
  () => import("@/pages/admin/AdminAnalyticsPage"),
);
const AdminMonitoringPage = lazy(
  () => import("@/pages/admin/AdminMonitoringPage"),
);

function LazyFallback() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <Spinner size={28} />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      {/* ========== Public routes (SEO indexed) ========== */}
      <Route element={<PublicLayout />}>
        <Route index element={<HomePage />} />
        <Route path="features" element={<FeaturesPage />} />
        <Route path="pricing" element={<PricingPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="blog" element={<BlogIndexPage />} />
        <Route path="blog/:slug" element={<BlogPostPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="signup" element={<SignupPage />} />
        <Route path="forgot-password" element={<ForgotPasswordPage />} />
        <Route path="reset-password" element={<ResetPasswordPage />} />
        <Route path="terms" element={<TermsPage />} />
        <Route path="privacy" element={<PrivacyPage />} />
      </Route>

      {/* ========== Auth callback (OAuth + email confirm) ========== */}
      <Route path="auth/callback" element={<AuthCallbackPage />} />

      {/* ========== App routes (authenticated, noindex) ========== */}
      <Route
        element={
          <ProtectedRoute>
            <Suspense fallback={<LazyFallback />}>
              <AppShell />
            </Suspense>
          </ProtectedRoute>
        }
      >
        <Route
          path="dashboard"
          element={
            <Suspense fallback={<LazyFallback />}>
              <DashboardPage />
            </Suspense>
          }
        />
        <Route
          path="generate"
          element={
            <Suspense fallback={<LazyFallback />}>
              <GeneratePage />
            </Suspense>
          }
        />
        <Route
          path="videos"
          element={
            <Suspense fallback={<LazyFallback />}>
              <VideosPage />
            </Suspense>
          }
        />
        <Route
          path="videos/:id"
          element={
            <Suspense fallback={<LazyFallback />}>
              <VideoDetailPage />
            </Suspense>
          }
        />
        <Route
          path="profile"
          element={
            <Suspense fallback={<LazyFallback />}>
              <ProfilePage />
            </Suspense>
          }
        />
        <Route
          path="settings"
          element={
            <Suspense fallback={<LazyFallback />}>
              <SettingsPage />
            </Suspense>
          }
        />
        <Route
          path="billing"
          element={
            <Suspense fallback={<LazyFallback />}>
              <BillingPage />
            </Suspense>
          }
        />
        <Route
          path="billing/success"
          element={<Navigate to="/billing?checkout=success" replace />}
        />
        <Route
          path="billing/cancel"
          element={<Navigate to="/billing?checkout=cancel" replace />}
        />
        <Route
          path="voices"
          element={
            <Suspense fallback={<LazyFallback />}>
              <VoicesPage />
            </Suspense>
          }
        />
        <Route
          path="notifications"
          element={
            <Suspense fallback={<LazyFallback />}>
              <NotificationsPage />
            </Suspense>
          }
        />
        <Route
          path="support"
          element={
            <Suspense fallback={<LazyFallback />}>
              <SupportPage />
            </Suspense>
          }
        />
      </Route>

      {/* ========== Admin routes (staff only, noindex) ========== */}
      <Route
        element={
          <StaffRoute>
            <Suspense fallback={<LazyFallback />}>
              <AdminLayout />
            </Suspense>
          </StaffRoute>
        }
      >
        <Route
          path="admin"
          element={
            <Suspense fallback={<LazyFallback />}>
              <AdminDashboardPage />
            </Suspense>
          }
        />
        <Route
          path="admin/users"
          element={
            <Suspense fallback={<LazyFallback />}>
              <AdminUsersPage />
            </Suspense>
          }
        />
        <Route
          path="admin/videos"
          element={
            <Suspense fallback={<LazyFallback />}>
              <AdminVideosPage />
            </Suspense>
          }
        />
        <Route
          path="admin/blog"
          element={
            <Suspense fallback={<LazyFallback />}>
              <AdminBlogPage />
            </Suspense>
          }
        />
        <Route
          path="admin/coupons"
          element={
            <Suspense fallback={<LazyFallback />}>
              <AdminCouponsPage />
            </Suspense>
          }
        />
        <Route
          path="admin/staff"
          element={
            <Suspense fallback={<LazyFallback />}>
              <AdminStaffPage />
            </Suspense>
          }
        />
        <Route
          path="admin/billing"
          element={
            <Suspense fallback={<LazyFallback />}>
              <AdminBillingPage />
            </Suspense>
          }
        />
        <Route
          path="admin/emails"
          element={
            <Suspense fallback={<LazyFallback />}>
              <AdminEmailPage />
            </Suspense>
          }
        />
        <Route
          path="admin/analytics"
          element={
            <Suspense fallback={<LazyFallback />}>
              <AdminAnalyticsPage />
            </Suspense>
          }
        />
        <Route
          path="admin/monitoring"
          element={
            <Suspense fallback={<LazyFallback />}>
              <AdminMonitoringPage />
            </Suspense>
          }
        />
      </Route>

      {/* ========== 404 ========== */}
      <Route path="*" element={<PublicLayout />}>
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
