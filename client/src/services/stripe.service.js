import { api } from "@/config/api";

export function createCheckoutSession({
  purchaseType,
  planId,
  interval,
  bundleId,
}) {
  return api.post("/stripe/checkout", {
    purchase_type: purchaseType,
    plan_id: planId,
    interval,
    bundle_id: bundleId,
  });
}

export function createPortalSession() {
  return api.post("/stripe/portal");
}
