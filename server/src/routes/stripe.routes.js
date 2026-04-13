import { Errors } from "../lib/errors.js";
import {
  createCheckoutSession,
  createPortalSession,
  handleStripeWebhook,
  verifyStripeWebhook,
} from "../services/stripe.service.js";

const checkoutSchema = {
  body: {
    type: "object",
    required: ["purchase_type"],
    properties: {
      purchase_type: { type: "string", enum: ["subscription", "bundle"] },
      plan_id: { type: "string", enum: ["starter", "premium"] },
      interval: { type: "string", enum: ["monthly", "yearly"] },
      bundle_id: {
        type: "string",
        enum: ["starter_pack", "creator_pack", "pro_pack", "studio_pack"],
      },
    },
  },
};

export default async function stripeRoutes(app) {
  app.post(
    "/checkout",
    { schema: checkoutSchema, preHandler: [app.verifyUser] },
    async (request, reply) => {
      const session = await createCheckoutSession({
        userId: request.user.id,
        purchaseType: request.body.purchase_type,
        planId: request.body.plan_id,
        bundleId: request.body.bundle_id,
        interval: request.body.interval,
      });

      return reply.status(201).send({
        session_id: session.id,
        url: session.url,
      });
    },
  );

  app.post(
    "/portal",
    { preHandler: [app.verifyUser] },
    async (request, reply) => {
      const session = await createPortalSession(request.user.id);

      return reply.status(201).send({
        url: session.url,
      });
    },
  );

  app.post("/webhook", async (request, reply) => {
    const signature = request.headers["stripe-signature"];
    const header = Array.isArray(signature) ? signature[0] : signature;

    let event;
    try {
      event = verifyStripeWebhook(request.rawBody, header);
    } catch (error) {
      request.log.warn(
        { err: error },
        "Stripe webhook signature verification failed",
      );
      throw Errors.badRequest("Invalid Stripe webhook signature");
    }

    await handleStripeWebhook(event);
    return reply.status(200).send({ received: true });
  });
}
