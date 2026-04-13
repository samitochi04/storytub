import supabase from "../config/supabase.js";
import { Errors } from "../lib/errors.js";

const redeemSchema = {
  body: {
    type: "object",
    required: ["code"],
    properties: {
      code: { type: "string", minLength: 1, maxLength: 64 },
    },
  },
};

export default async function couponRoutes(app) {
  app.post(
    "/redeem",
    { schema: redeemSchema, preHandler: [app.verifyUser] },
    async (request, reply) => {
      const { data, error } = await supabase.rpc("redeem_coupon", {
        p_user_id: request.user.id,
        p_coupon_code: request.body.code,
      });

      if (error) {
        request.log.error(
          { error, userId: request.user.id },
          "Coupon redemption RPC failed",
        );
        throw Errors.badRequest("Coupon redemption failed");
      }

      if (!data?.success) {
        throw Errors.badRequest(data?.error || "Coupon redemption failed");
      }

      return reply.status(200).send({
        success: true,
        discount_percent: data.discount_percent,
        discount_amount: data.discount_amount,
        credits_bonus: data.credits_bonus,
      });
    },
  );
}
