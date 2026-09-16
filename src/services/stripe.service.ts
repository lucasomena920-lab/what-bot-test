import Stripe from "stripe";

import env from "../config/env";
import prisma from "../config/database";

export type CheckoutPlan =
  | "basic"
  | "premium";

const stripe =
  new Stripe(
    env.stripeSecretKey
  );

function priceIdForPlan(
  plan: CheckoutPlan
): string {
  return plan === "premium"
    ? env.stripePremiumPriceId
    : env.stripeBasicPriceId;
}

class StripeService {
  async createCheckoutSession(
    userId: number,
    plan: CheckoutPlan
  ): Promise<Stripe.Checkout.Session> {
    const user =
      await prisma.user.findUnique({
        where: {
          id: userId
        },
        select: {
          id: true,
          email: true,
          active: true,
          plan: true,
          subscriptionStatus: true
        }
      });

    if (!user) {
      throw new Error(
        "USER_NOT_FOUND"
      );
    }

    if (!user.active) {
      throw new Error(
        "ACCOUNT_DISABLED"
      );
    }

    if (
      user.subscriptionStatus ===
      "active"
    ) {
      throw new Error(
        "ACTIVE_SUBSCRIPTION"
      );
    }

    const priceId =
      priceIdForPlan(plan);

    const session =
      await stripe.checkout.sessions.create({
        mode:
          "subscription",

        customer_email:
          user.email,

        client_reference_id:
          String(user.id),

        line_items: [
          {
            price:
              priceId,
            quantity:
              1
          }
        ],

        metadata: {
          userId:
            String(user.id),
          plan
        },

        subscription_data: {
          metadata: {
            userId:
              String(user.id),
            plan
          }
        },

        success_url:
          `${env.appUrl}/?checkout=success`,

        cancel_url:
          `${env.appUrl}/?checkout=cancel`,

        allow_promotion_codes:
          false
      });

    return session;
  }
}

export const stripeService =
  new StripeService();
