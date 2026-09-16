import type {
  FastifyInstance,
  FastifyRequest
} from "fastify";

import {
  subscriptionService
} from "../services/subscription.service";
import { whatsappService } from "../whatsapp/whatsapp.service";

function authenticatedUserId(
  request: FastifyRequest
): number {
  const user = request.user as {
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

async function hasSubscriptionAccess(
  userId: number
): Promise<
  | {
      allowed: true;
    }
  | {
      allowed: false;
      reason: string;
    }
> {
  const subscription =
    await subscriptionService.checkAccess(
      userId
    );

  if (subscription.allowed) {
    return {
      allowed: true
    };
  }

  return {
    allowed: false,
    reason: subscription.reason
  };
}

function subscriptionMessage(
  reason: string
): string {
  switch (reason) {
    case "account_disabled":
      return "Esta conta está desativada.";

    case "past_due":
      return "Existe uma pendência na assinatura.";

    case "canceled":
      return "A assinatura foi cancelada.";

    case "expired":
      return "A assinatura expirou.";

    case "not_started":
      return "A assinatura ainda não está ativa.";

    default:
      return "É necessária uma assinatura ativa para utilizar este recurso.";
  }
}

export async function whatsappRoutes(
  app: FastifyInstance
): Promise<void> {
  /*
   * Todas as rotas deste plugin exigem JWT.
   *
   * A verificação da assinatura é feita apenas nas
   * operações que iniciam ou utilizam o serviço pago.
   *
   * Status e desconexão continuam disponíveis para
   * que o usuário possa administrar a própria conta
   * mesmo sem uma assinatura ativa.
   */
  app.addHook(
    "preHandler",
    async (request, reply) => {
      try {
        await request.jwtVerify();

        authenticatedUserId(
          request
        );
      } catch {
        return reply.status(401).send({
          success: false,
          message: "Não autorizado."
        });
      }
    }
  );

  // =========================
  // INICIAR CONEXÃO DO WHATSAPP
  // =========================

  app.post(
    "/whatsapp/connect",
    async (request, reply) => {
      try {
        const userId =
          authenticatedUserId(
            request
          );

        const access =
          await hasSubscriptionAccess(
            userId
          );

        if (!access.allowed) {
          return reply.status(403).send({
            success: false,
            code: "SUBSCRIPTION_REQUIRED",
            message:
              subscriptionMessage(
                access.reason
              )
          });
        }

        await whatsappService.connect(
          userId
        );

        return {
          success: true,
          message:
            "Conexão do WhatsApp iniciada."
        };
      } catch (error: unknown) {
        app.log.error(error);

        return reply.status(500).send({
          success: false,
          message:
            "Não foi possível iniciar o WhatsApp."
        });
      }
    }
  );

  // =========================
  // CONSULTAR ESTADO DA SESSÃO
  // =========================

  app.get(
    "/whatsapp/status",
    async (request, reply) => {
      try {
        const userId =
          authenticatedUserId(
            request
          );

        const session =
          await whatsappService.getSession(
            userId
          );

        const subscription =
          await subscriptionService.checkAccess(
            userId
          );

        reply.header(
          "Cache-Control",
          "no-store"
        );

        return {
          success: true,
          subscription: {
            allowed:
              subscription.allowed,
            plan:
              subscription.plan,
            status:
              subscription.status,
            reason:
              subscription.reason
          },
          session: session ?? null
        };
      } catch (error: unknown) {
        app.log.error(error);

        return reply.status(500).send({
          success: false,
          message:
            "Não foi possível consultar o estado do WhatsApp."
        });
      }
    }
  );

  // =========================
  // OBTER QR CODE
  // =========================

  app.get(
    "/whatsapp/qr",
    async (request, reply) => {
      try {
        const userId =
          authenticatedUserId(
            request
          );

        const access =
          await hasSubscriptionAccess(
            userId
          );

        if (!access.allowed) {
          return reply.status(403).send({
            success: false,
            code: "SUBSCRIPTION_REQUIRED",
            message:
              subscriptionMessage(
                access.reason
              )
          });
        }

        const qrCode =
          whatsappService.getQRCode(
            userId
          );

        reply.header(
          "Cache-Control",
          "no-store, no-cache, must-revalidate, private"
        );

        reply.header(
          "Pragma",
          "no-cache"
        );

        return {
          success: true,
          qrCode: qrCode ?? null
        };
      } catch (error: unknown) {
        app.log.error(error);

        return reply.status(500).send({
          success: false,
          message:
            "Não foi possível obter o QR Code."
        });
      }
    }
  );

  // =========================
  // DESCONECTAR WHATSAPP
  // =========================

  app.post(
    "/whatsapp/disconnect",
    async (request, reply) => {
      try {
        const userId =
          authenticatedUserId(
            request
          );

        await whatsappService.removeSession(
          userId
        );

        return {
          success: true,
          message:
            "Sessão removida."
        };
      } catch (error: unknown) {
        app.log.error(error);

        return reply.status(500).send({
          success: false,
          message:
            "Não foi possível desconectar o WhatsApp."
        });
      }
    }
  );
}
