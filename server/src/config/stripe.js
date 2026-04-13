import Stripe from "stripe";
import env from "./env.js";

const stripe = new Stripe(env.stripeSecretKey, {
  apiVersion: "2025-03-31.basil",
});

export default stripe;
