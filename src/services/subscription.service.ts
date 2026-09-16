import prisma from "../config/database";

export type SubscriptionPlan =
  | "basic"
  | "premium";

export type SubscriptionFeature =
  | "whatsapp"
  | "bot_config"
  | "human_support"
  | "advanced_automations"
  | "analytics"
  | "contact_tags"
  | "follow_up"
  | "integrations";

export type SubscriptionReason =
  | "active"
  | "user_not_found"
  | "account_disabled"
  | "pending"
  | "past_due"
  | "canceled"
  | "expired"
  | "invalid_plan"
  | "not_started";

export type SubscriptionAccess = {
  allowed: boolean;
  reason: SubscriptionReason;
  plan: string;
  status: string;
  features: SubscriptionFeature[];
  startsAt?: Date;
  endsAt?: Date;
};

export type FeatureAccess = {
  allowed: boolean;
  reason:
    | SubscriptionReason
    | "feature_not_in_plan";
  plan: string;
  feature: SubscriptionFeature;
};

const planFeatures: Record<
  SubscriptionPlan,
  readonly SubscriptionFeature[]
> = {
  basic: [
    "whatsapp",
    "bot_config",
    "human_support"
  ],

  premium: [
    "whatsapp",
    "bot_config",
    "human_support",
    "advanced_automations",
    "analytics",
    "contact_tags",
    "follow_up",
    "integrations"
  ]
};

function normalizePlan(
  value: string
): SubscriptionPlan | undefined {
  const normalized =
    value.trim().toLowerCase();

  if (
    normalized === "basic" ||
    normalized === "premium"
  ) {
    return normalized;
  }

  return undefined;
}

function featuresForPlan(
  plan: SubscriptionPlan
): SubscriptionFeature[] {
  return [
    ...planFeatures[plan]
  ];
}

class SubscriptionService {
  async checkAccess(
    userId: number
  ): Promise<SubscriptionAccess> {
    if (
      !Number.isInteger(userId) ||
      userId <= 0
    ) {
      return {
        allowed: false,
        reason: "user_not_found",
        plan: "none",
        status: "invalid",
        features: []
      };
    }

    const user =
      await prisma.user.findUnique({
        where: {
          id: userId
        },
        select: {
          active: true,
          plan: true,
          subscriptionStatus: true,
          subscriptionStartsAt: true,
          subscriptionEndsAt: true
        }
      });

    if (!user) {
      return {
        allowed: false,
        reason: "user_not_found",
        plan: "none",
        status: "invalid",
        features: []
      };
    }

    const plan =
      normalizePlan(
        user.plan
      );

    const startsAt =
      user.subscriptionStartsAt ??
      undefined;

    const endsAt =
      user.subscriptionEndsAt ??
      undefined;

    if (!user.active) {
      return {
        allowed: false,
        reason: "account_disabled",
        plan: user.plan,
        status:
          user.subscriptionStatus,
        features: [],
        startsAt,
        endsAt
      };
    }

    if (!plan) {
      return {
        allowed: false,
        reason: "invalid_plan",
        plan: user.plan,
        status:
          user.subscriptionStatus,
        features: [],
        startsAt,
        endsAt
      };
    }

    const now =
      new Date();

    if (
      startsAt &&
      startsAt > now
    ) {
      return {
        allowed: false,
        reason: "not_started",
        plan,
        status:
          user.subscriptionStatus,
        features: [],
        startsAt,
        endsAt
      };
    }

    if (
      endsAt &&
      endsAt <= now
    ) {
      return {
        allowed: false,
        reason: "expired",
        plan,
        status: "expired",
        features: [],
        startsAt,
        endsAt
      };
    }

    switch (
      user.subscriptionStatus
    ) {
      case "active":
        return {
          allowed: true,
          reason: "active",
          plan,
          status:
            user.subscriptionStatus,
          features:
            featuresForPlan(plan),
          startsAt,
          endsAt
        };

      case "past_due":
        return {
          allowed: false,
          reason: "past_due",
          plan,
          status:
            user.subscriptionStatus,
          features: [],
          startsAt,
          endsAt
        };

      case "canceled":
        return {
          allowed: false,
          reason: "canceled",
          plan,
          status:
            user.subscriptionStatus,
          features: [],
          startsAt,
          endsAt
        };

      case "expired":
        return {
          allowed: false,
          reason: "expired",
          plan,
          status:
            user.subscriptionStatus,
          features: [],
          startsAt,
          endsAt
        };

      default:
        return {
          allowed: false,
          reason: "pending",
          plan,
          status:
            user.subscriptionStatus,
          features: [],
          startsAt,
          endsAt
        };
    }
  }

  async hasFeature(
    userId: number,
    feature: SubscriptionFeature
  ): Promise<FeatureAccess> {
    const subscription =
      await this.checkAccess(
        userId
      );

    if (
      !subscription.allowed
    ) {
      return {
        allowed: false,
        reason:
          subscription.reason,
        plan:
          subscription.plan,
        feature
      };
    }

    if (
      !subscription.features.includes(
        feature
      )
    ) {
      return {
        allowed: false,
        reason:
          "feature_not_in_plan",
        plan:
          subscription.plan,
        feature
      };
    }

    return {
      allowed: true,
      reason: "active",
      plan:
        subscription.plan,
      feature
    };
  }

  getPlanFeatures(
    plan: string
  ): SubscriptionFeature[] {
    const normalized =
      normalizePlan(plan);

    if (!normalized) {
      return [];
    }

    return featuresForPlan(
      normalized
    );
  }
}

export const subscriptionService =
  new SubscriptionService();
