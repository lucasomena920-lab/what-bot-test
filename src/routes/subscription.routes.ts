import type {
  FastifyInstance,
  FastifyRequest
} from "fastify";

import Stripe from "stripe";

import env from "../config/env";
import prisma from "../config/database";

import {
  stripeService
} from "../services/stripe.service";

type AvailablePlan =
  | "basic"
  | "premium";

type SelectPlanBody = {
  plan?: unknown;
};

function authenticatedUserId(
  request: FastifyRequest
): number {
  const user =
    request.user as {
      userId?: unknown;
    };

  if (
    typeof user?.userId !== "number" ||
    !Number.isInteger(user.userId) ||
    user.userId <= 0
  ) {
    throw new Error(
      "Token sem userId válido."
    );
  }

  return user.userId;
}

function normalizePlan(
  value: unknown
): AvailablePlan | undefined {
  if (
    typeof value !== "string"
  ) {
    return undefined;
  }

  const plan =
    value
      .trim()
      .toLowerCase();

  if (
    plan === "basic" ||
    plan === "premium"
  ) {
    return plan;
  }

  return undefined;
}

function planLabel(
  plan: AvailablePlan
): string {
  return plan === "premium"
    ? "Premium"
    : "Basic";
}

function isJwtError(
  error: unknown
): boolean {
  const jwtError =
    error as {
      code?: string;
      statusCode?: number;
    };

  return (
    jwtError?.statusCode === 401 ||
    jwtError?.code?.startsWith(
      "FST_JWT"
    ) === true ||
    (
      error instanceof Error &&
      error.message ===
        "Token sem userId válido."
    )
  );
}

export async function subscriptionRoutes(
  app: FastifyInstance
): Promise<void> {
  const stripe =
    new Stripe(
      env.stripeSecretKey
    );

  app.post(
    "/subscription/select-plan",
    async (
      request,
      reply
    ) => {
      try {
        await request.jwtVerify();

        const userId =
          authenticatedUserId(
            request
          );

        const body =
          request.body as
            | SelectPlanBody
            | undefined;

        const plan =
          normalizePlan(
            body?.plan
          );

        if (!plan) {
          return reply
            .status(400)
            .send({
              success: false,
              code:
                "INVALID_PLAN",
              message:
                "Plano inválido."
            });
        }

        const user =
          await prisma.user.findUnique({
            where: {
              id: userId
            },
            select: {
              id: true,
              active: true,
              plan: true,
              subscriptionStatus: true
            }
          });

        if (!user) {
          return reply
            .status(401)
            .send({
              success: false,
              message:
                "Não autorizado."
            });
        }

        if (!user.active) {
          return reply
            .status(403)
            .send({
              success: false,
              code:
                "ACCOUNT_DISABLED",
              message:
                "Esta conta está desativada."
            });
        }

        /*
         * Nunca alteramos diretamente o plano de uma
         * assinatura ativa nesta rota.
         *
         * Upgrade/downgrade de assinaturas ativas será
         * confirmado futuramente pelo fluxo de pagamento.
         */
        if (
          user.subscriptionStatus ===
          "active"
        ) {
          return reply
            .status(409)
            .send({
              success: false,
              code:
                "ACTIVE_SUBSCRIPTION",
              message:
                "Alterações em uma assinatura ativa precisam ser confirmadas pelo pagamento."
            });
        }

        const updatedUser =
          await prisma.user.update({
            where: {
              id: userId
            },
            data: {
              plan,
              subscriptionStatus:
                "pending",
              subscriptionStartsAt:
                null,
              subscriptionEndsAt:
                null
            },
            select: {
              plan: true,
              subscriptionStatus: true
            }
          });

        reply.header(
          "Cache-Control",
          "no-store"
        );

        return {
          success: true,
          message:
            `Plano ${planLabel(plan)} selecionado. A assinatura será ativada após a confirmação do pagamento.`,
          subscription: {
            plan:
              updatedUser.plan,
            status:
              updatedUser.subscriptionStatus,
            allowed: false
          }
        };
      } catch (error: unknown) {
        if (
          isJwtError(
            error
          )
        ) {
          return reply
            .status(401)
            .send({
              success: false,
              message:
                "Não autorizado."
            });
        }

        app.log.error(error);

        return reply
          .status(500)
          .send({
            success: false,
            message:
              "Não foi possível selecionar o plano."
          });
      }
    }
  );

  app.post(
    "/subscription/checkout",
    async (
      request,
      reply
    ) => {
      try {
        await request.jwtVerify();

        const userId =
          authenticatedUserId(
            request
          );

        const body =
          request.body as
            | SelectPlanBody
            | undefined;

        const plan =
          normalizePlan(
            body?.plan
          );

        if (!plan) {
          return reply
            .status(400)
            .send({
              success: false,
              code:
                "INVALID_PLAN",
              message:
                "Plano inválido."
            });
        }

        const session =
          await stripeService
            .createCheckoutSession(
              userId,
              plan
            );

        if (!session.url) {
          app.log.error(
            {
              sessionId:
                session.id,
              userId,
              plan
            },
            "Stripe Checkout sem URL."
          );

          return reply
            .status(502)
            .send({
              success: false,
              code:
                "CHECKOUT_URL_MISSING",
              message:
                "A Stripe não retornou a página de pagamento."
            });
        }

        await prisma.user.update({
          where: {
            id: userId
          },
          data: {
            plan,
            subscriptionStatus:
              "pending",
            subscriptionStartsAt:
              null,
            subscriptionEndsAt:
              null
          }
        });

        reply.header(
          "Cache-Control",
          "no-store"
        );

        return {
          success: true,
          checkoutUrl:
            session.url
        };
      } catch (error: unknown) {
        if (
          isJwtError(
            error
          )
        ) {
          return reply
            .status(401)
            .send({
              success: false,
              message:
                "Não autorizado."
            });
        }

        if (
          error instanceof Error &&
          error.message ===
            "USER_NOT_FOUND"
        ) {
          return reply
            .status(401)
            .send({
              success: false,
              message:
                "Não autorizado."
            });
        }

        if (
          error instanceof Error &&
          error.message ===
            "ACCOUNT_DISABLED"
        ) {
          return reply
            .status(403)
            .send({
              success: false,
              code:
                "ACCOUNT_DISABLED",
              message:
                "Esta conta está desativada."
            });
        }

        if (
          error instanceof Error &&
          error.message ===
            "ACTIVE_SUBSCRIPTION"
        ) {
          return reply
            .status(409)
            .send({
              success: false,
              code:
                "ACTIVE_SUBSCRIPTION",
              message:
                "Esta conta já possui uma assinatura ativa."
            });
        }

        app.log.error(error);

        return reply
          .status(500)
          .send({
            success: false,
            message:
              "Não foi possível iniciar o pagamento."
          });
      }
    }
  );

  app.post(
    "/subscription/portal",
    async (
      request,
      reply
    ) => {
      try {
        await request.jwtVerify();

        const userId =
          authenticatedUserId(
            request
          );

        const user =
          await prisma.user.findUnique({
            where: {
              id: userId
            },
            select: {
              id: true,
              active: true,
              stripeCustomerId: true
            }
          });

        if (!user) {
          return reply
            .status(401)
            .send({
              success: false,
              message:
                "Não autorizado."
            });
        }

        if (!user.active) {
          return reply
            .status(403)
            .send({
              success: false,
              code:
                "ACCOUNT_DISABLED",
              message:
                "Esta conta está desativada."
            });
        }

        /*
         * Contas ativadas manualmente podem não ter
         * cliente correspondente na Stripe. Nesse caso,
         * não existe Portal de Cobrança para abrir.
         */
        if (
          !user.stripeCustomerId
        ) {
          return reply
            .status(409)
            .send({
              success: false,
              code:
                "STRIPE_CUSTOMER_MISSING",
              message:
                "Esta assinatura não possui dados de cobrança gerenciados pela Stripe."
            });
        }

        const portalSession =
          await stripe.billingPortal
            .sessions.create({
              customer:
                user.stripeCustomerId,
              return_url:
                `${env.appUrl}/?billing=return`
            });

        reply.header(
          "Cache-Control",
          "no-store"
        );

        return {
          success: true,
          portalUrl:
            portalSession.url
        };
      } catch (error: unknown) {
        if (
          isJwtError(
            error
          )
        ) {
          return reply
            .status(401)
            .send({
              success: false,
              message:
                "Não autorizado."
            });
        }

        app.log.error(
          {
            error
          },
          "Não foi possível criar sessão do Portal de Cobrança Stripe."
        );

        return reply
          .status(500)
          .send({
            success: false,
            message:
              "Não foi possível abrir o gerenciamento da assinatura."
          });
      }
    }
  );
}
