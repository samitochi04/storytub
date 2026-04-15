import { api } from "@/config/api";

export function redeemCoupon(code) {
  return api.post("/coupons/redeem", { code });
}
