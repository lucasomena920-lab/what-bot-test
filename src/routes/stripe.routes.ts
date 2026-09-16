import type {
  FastifyInstance,
  FastifyRequest
} from "fastify";

import Stripe from "stripe";
import { Prisma } from "@prisma/client";

import env from "../config/env";
import prisma from "../config/database";

type CheckoutPlan =
  | "basic"
  | "premium";

type RequestWithRawBody =
  FastifyRequest & {
    rawBody?: Buffer;
  };

function normalizePlan(
  value: unknown
): CheckoutPlan | undefined {
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

function metadataUserId(
  metadata:
    | Stripe.Metadata
    | null
    | undefined
): number | undefined {
  const value =
    metadata?.userId;

  if (!value) {
    return undefined;
  }

  const userId =
    Number(value);

  if (
    !Number.isInteger(userId) ||
    userId <= 0
  ) {
    return undefined;
  }

  return userId;
}

function stripeObjectId(
  value:
    | string
    | { id: string }
    | null
    | undefined
): string | undefined {
  if (
    typeof value === "string"
  ) {
    return value;
  }

  if (
    value &&
    typeof value.id === "string"
  ) {
    return value.id;
  }

  return undefined;
}

function invoiceSubscriptionId(
  invoice: Stripe.Invoice
): string | undefined {
  const legacyInvoice =
    invoice as Stripe.Invoice & {
      subscription?:
        | string
        | { id: string }
        | null;
      parent?: {
        subscription_details?: {
          subscription?:
            | string
            | { id: string }
            | null;
        } | null;
      } | null;
    };

  return (
    stripeObjectId(
      legacyInvoice.subscription
    ) ??
    stripeObjectId(
      legacyInvoice.parent
        ?.subscription_details
        ?.subscription
    )
  );
}

async function billingUserId(
  tx: Prisma.TransactionClient,
  metadata:
    | Stripe.Metadata
    | null
    | undefined,
  customerId:
    | string
    | undefined,
  subscriptionId:
    | string
    | undefined
): Promise<number | undefined> {
  const metadataId =
    metadataUserId(
      metadata
    );

  if (metadataId) {
    return metadataId;
  }

  const identifiers: Array<{
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
  }> = [];

  if (subscriptionId) {
    identifiers.push({
      stripeSubscriptionId:
        subscriptionId
    });
  }

  if (customerId) {
    identifiers.push({
      stripeCustomerId:
        customerId
    });
  }

  if (
    identifiers.length === 0
  ) {
    return undefined;
  }

  const user =
    await tx.user.findFirst({
      where: {
        OR: identifiers
      },
      select: {
        id: true
      }
    });

  return user?.id;
}

function stripeTimestampDate(
  value: unknown
): Date | undefined {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value) ||
    value <= 0
  ) {
    return undefined;
  }

  return new Date(
    value * 1000
  );
}

function scheduledSubscriptionEnd(
  subscription: Stripe.Subscription
): Date | undefined {
  const value =
    subscription as Stripe.Subscription & {
      cancel_at_period_end?: boolean;
      cancel_at?: number | null;
      current_period_end?: number;
      items?: {
        data?: Array<{
          current_period_end?: number;
        }>;
      };
    };

  if (
    !value.cancel_at_period_end
  ) {
    return undefined;
  }

  return (
    stripeTimestampDate(
      value.cancel_at
    ) ??
    stripeTimestampDate(
      value.current_period_end
    ) ??
    stripeTimestampDate(
      value.items
        ?.data?.[0]
        ?.current_period_end
    )
  );
}

function localSubscriptionStatus(
  status: Stripe.Subscription.Status
):
  | "active"
  | "pending"
  | "past_due"
  | "canceled"
  | "expired" {
  switch (status) {
    case "active":
    case "trialing":
      return "active";

    case "past_due":
    case "unpaid":
    case "paused":
      return "past_due";

    case "canceled":
      return "canceled";

    case "incomplete_expired":
      return "expired";

    default:
      return "pending";
  }
}

type StripeEventClaim =
  | "claimed"
  | "processed"
  | "busy";

function safeErrorMessage(
  error: unknown
): string {
  const message =
    error instanceof Error
      ? error.message
      : "Erro desconhecido.";

  return message.slice(
    0,
    2000
  );
}

async function claimStripeEvent(
  event: Stripe.Event
): Promise<StripeEventClaim> {
  try {
    await prisma.stripeWebhookEvent.create({
      data: {
        id: event.id,
        type: event.type,
        status: "processing"
      }
    });

    return "claimed";
  } catch (error) {
    if (
      !(
        error instanceof
        Prisma.PrismaClientKnownRequestError
      ) ||
      error.code !== "P2002"
    ) {
      throw error;
    }
  }

  const existing =
    await prisma.stripeWebhookEvent.findUnique({
      where: {
        id: event.id
      }
    });

  if (!existing) {
    throw new Error(
      "Evento Stripe duplicado não encontrado após conflito de unicidade."
    );
  }

  if (
    existing.status ===
    "processed"
  ) {
    return "processed";
  }

  if (
    existing.status ===
    "failed"
  ) {
    const claimed =
      await prisma.stripeWebhookEvent.updateMany({
        where: {
          id: event.id,
          status: "failed"
        },
        data: {
          type: event.type,
          status: "processing",
          lastError: null,
          processedAt: null
        }
      });

    return claimed.count === 1
      ? "claimed"
      : "busy";
  }

  if (
    existing.status ===
    "processing"
  ) {
    const staleBefore =
      new Date(
        Date.now() -
          10 * 60 * 1000
      );

    const reclaimed =
      await prisma.stripeWebhookEvent.updateMany({
        where: {
          id: event.id,
          status: "processing",
          updatedAt: {
            lt: staleBefore
          }
        },
        data: {
          type: event.type,
          status: "processing",
          lastError: null,
          processedAt: null
        }
      });

    return reclaimed.count === 1
      ? "claimed"
      : "busy";
  }

  return "busy";
}

export async function stripeRoutes(
  app: FastifyInstance
): Promise<void> {
  const stripe =
    new Stripe(
      env.stripeSecretKey
    );

  app.post(
    "/stripe/webhook",
    {
      config: {
        rawBody: true
      }
    },
    async (
      request,
      reply
    ) => {
      const rawBody =
        (
          request as RequestWithRawBody
        ).rawBody;

      const signatureHeader =
        request.headers[
          "stripe-signature"
        ];

      const signature =
        Array.isArray(
          signatureHeader
        )
          ? signatureHeader[0]
          : signatureHeader;

      if (
        !rawBody ||
        !signature
      ) {
        return reply
          .status(400)
          .send({
            success: false,
            message:
              "Webhook sem assinatura válida."
          });
      }

      let event:
        Stripe.Event;

      try {
        event =
          stripe.webhooks
            .constructEvent(
              rawBody,
              signature,
              env.stripeWebhookSecret
            );
      } catch (error) {
        app.log.warn(
          {
            error
          },
          "Assinatura do webhook Stripe inválida."
        );

        return reply
          .status(400)
          .send({
            success: false,
            message:
              "Webhook inválido."
          });
      }

      let claim:
        StripeEventClaim;

      try {
        claim =
          await claimStripeEvent(
            event
          );
      } catch (error) {
        app.log.error(
          {
            error,
            stripeEventId:
              event.id,
            stripeEventType:
              event.type
          },
          "Não foi possível reservar o evento Stripe para processamento."
        );

        return reply
          .status(500)
          .send({
            success: false,
            message:
              "Não foi possível registrar o webhook."
          });
      }

      if (
        claim ===
        "processed"
      ) {
        return reply.send({
          received: true,
          duplicate: true
        });
      }

      if (
        claim ===
        "busy"
      ) {
        return reply
          .status(409)
          .send({
            received: false,
            retry: true,
            message:
              "Evento Stripe já está em processamento."
          });
      }

      try {
        await prisma.$transaction(
          async (tx) => {
            switch (event.type) {
          case "checkout.session.completed":
          case "checkout.session.async_payment_succeeded": {
            const session =
              event.data
                .object as
                Stripe.Checkout.Session;

            if (
              session.mode !==
              "subscription"
            ) {
              break;
            }

            if (
              event.type ===
                "checkout.session.completed" &&
              session.payment_status !==
                "paid" &&
              session.payment_status !==
                "no_payment_required"
            ) {
              break;
            }

            const userId =
              metadataUserId(
                session.metadata
              );

            const plan =
              normalizePlan(
                session.metadata?.plan
              );

            const stripeCustomerId =
              stripeObjectId(
                session.customer
              );

            const stripeSubscriptionId =
              stripeObjectId(
                session.subscription
              );

            if (
              !userId ||
              !plan
            ) {
              app.log.warn(
                {
                  eventId:
                    event.id
                },
                "Checkout Stripe sem userId ou plano válido."
              );

              break;
            }

            await tx.user.updateMany({
              where: {
                id: userId
              },
              data: {
                plan,
                subscriptionStatus:
                  "active",
                subscriptionStartsAt:
                  new Date(),
                subscriptionEndsAt:
                  null,
                ...(stripeCustomerId
                  ? {
                      stripeCustomerId
                    }
                  : {}),
                ...(stripeSubscriptionId
                  ? {
                      stripeSubscriptionId
                    }
                  : {})
              }
            });

            break;
          }

          case "checkout.session.async_payment_failed": {
            const session =
              event.data
                .object as
                Stripe.Checkout.Session;

            const userId =
              metadataUserId(
                session.metadata
              );

            const plan =
              normalizePlan(
                session.metadata?.plan
              );

            if (!userId) {
              break;
            }

            await tx.user.updateMany({
              where: {
                id: userId
              },
              data: {
                ...(plan
                  ? {
                      plan
                    }
                  : {}),
                subscriptionStatus:
                  "past_due"
              }
            });

            break;
          }

          case "invoice.paid":
          case "invoice.payment_succeeded": {
            const invoice =
              event.data
                .object as
                Stripe.Invoice;

            const stripeCustomerId =
              stripeObjectId(
                invoice.customer
              );

            const stripeSubscriptionId =
              invoiceSubscriptionId(
                invoice
              );

            const userId =
              await billingUserId(
                tx,
                invoice.metadata,
                stripeCustomerId,
                stripeSubscriptionId
              );

            if (!userId) {
              app.log.info(
                {
                  eventId:
                    event.id,
                  stripeCustomerId,
                  stripeSubscriptionId
                },
                "Fatura Stripe paga sem usuário local correspondente."
              );

              break;
            }

            await tx.user.update({
              where: {
                id: userId
              },
              data: {
                subscriptionStatus:
                  "active",
                subscriptionEndsAt:
                  null,
                ...(stripeCustomerId
                  ? {
                      stripeCustomerId
                    }
                  : {}),
                ...(stripeSubscriptionId
                  ? {
                      stripeSubscriptionId
                    }
                  : {})
              }
            });

            break;
          }

          case "invoice.payment_failed": {
            const invoice =
              event.data
                .object as
                Stripe.Invoice;

            const stripeCustomerId =
              stripeObjectId(
                invoice.customer
              );

            const stripeSubscriptionId =
              invoiceSubscriptionId(
                invoice
              );

            const userId =
              await billingUserId(
                tx,
                invoice.metadata,
                stripeCustomerId,
                stripeSubscriptionId
              );

            if (!userId) {
              app.log.info(
                {
                  eventId:
                    event.id,
                  stripeCustomerId,
                  stripeSubscriptionId
                },
                "Falha de pagamento Stripe sem usuário local correspondente."
              );

              break;
            }

            await tx.user.update({
              where: {
                id: userId
              },
              data: {
                subscriptionStatus:
                  "past_due",
                ...(stripeCustomerId
                  ? {
                      stripeCustomerId
                    }
                  : {}),
                ...(stripeSubscriptionId
                  ? {
                      stripeSubscriptionId
                    }
                  : {})
              }
            });

            break;
          }

          case "customer.subscription.updated": {
            const subscription =
              event.data
                .object as
                Stripe.Subscription;

            const stripeCustomerId =
              stripeObjectId(
                subscription.customer
              );

            const stripeSubscriptionId =
              subscription.id;

            const userId =
              await billingUserId(
                tx,
                subscription.metadata,
                stripeCustomerId,
                stripeSubscriptionId
              );

            const plan =
              normalizePlan(
                subscription.metadata
                  ?.plan
              );

            if (!userId) {
              break;
            }

            const localStatus =
              localSubscriptionStatus(
                subscription.status
              );

            const scheduledEnd =
              scheduledSubscriptionEnd(
                subscription
              );

            await tx.user.updateMany({
              where: {
                id: userId
              },
              data: {
                ...(plan
                  ? {
                      plan
                    }
                  : {}),
                subscriptionStatus:
                  localStatus,
                subscriptionEndsAt:
                  localStatus === "active"
                    ? (
                        scheduledEnd ??
                        null
                      )
                    : undefined,
                ...(stripeCustomerId
                  ? {
                      stripeCustomerId
                    }
                  : {}),
                stripeSubscriptionId
              }
            });

            break;
          }

          case "customer.subscription.deleted": {
            const subscription =
              event.data
                .object as
                Stripe.Subscription;

            const stripeCustomerId =
              stripeObjectId(
                subscription.customer
              );

            const stripeSubscriptionId =
              subscription.id;

            const userId =
              await billingUserId(
                tx,
                subscription.metadata,
                stripeCustomerId,
                stripeSubscriptionId
              );

            if (!userId) {
              break;
            }

            await tx.user.updateMany({
              where: {
                id: userId
              },
              data: {
                subscriptionStatus:
                  "canceled",
                subscriptionEndsAt:
                  new Date(),
                ...(stripeCustomerId
                  ? {
                      stripeCustomerId
                    }
                  : {}),
                stripeSubscriptionId
              }
            });

            break;
          }

          default:
            break;
            }

            await tx.stripeWebhookEvent.update({
              where: {
                id: event.id
              },
              data: {
                status: "processed",
                processedAt:
                  new Date(),
                lastError: null
              }
            });
          }
        );
      } catch (error) {
        const lastError =
          safeErrorMessage(
            error
          );

        try {
          await prisma.stripeWebhookEvent.update({
            where: {
              id: event.id
            },
            data: {
              status: "failed",
              lastError,
              processedAt: null
            }
          });
        } catch (statusError) {
          app.log.error(
            {
              error:
                statusError,
              stripeEventId:
                event.id
            },
            "Não foi possível registrar a falha do webhook Stripe."
          );
        }

        app.log.error(
          {
            error,
            stripeEventId:
              event.id,
            stripeEventType:
              event.type
          },
          "Erro ao processar webhook Stripe."
        );

        return reply
          .status(500)
          .send({
            success: false,
            message:
              "Erro ao processar webhook."
          });
      }

      return reply.send({
        received: true
      });
    }
  );
}
