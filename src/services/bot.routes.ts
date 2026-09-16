import type {
  FastifyInstance,
  FastifyRequest
} from "fastify";

import {
  type BotConfigData
} from "../services/bot.config";
import { botService } from "../services/bot.service";

type BotConfigKey = keyof BotConfigData;

const configKeys: BotConfigKey[] = [
  "companyName",
  "greeting",
  "menu",
  "businessHours",
  "services",
  "humanSupport",
  "fallback"
];

const limits: Record<BotConfigKey, number> = {
  companyName: 80,
  greeting: 1200,
  menu: 2000,
  businessHours: 1600,
  services: 2000,
  humanSupport: 1200,
  fallback: 1200
};

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

function validateConfig(
  body: unknown
):
  | {
      ok: true;
      config: BotConfigData;
    }
  | {
      ok: false;
      message: string;
    } {
  if (
    !body ||
    typeof body !== "object" ||
    Array.isArray(body)
  ) {
    return {
      ok: false,
      message: "Configuração inválida."
    };
  }

  const input = body as Partial<
    Record<BotConfigKey, unknown>
  >;

  const config =
    {} as BotConfigData;

  for (const key of configKeys) {
    const value = input[key];

    if (typeof value !== "string") {
      return {
        ok: false,
        message:
          `O campo ${String(key)} é obrigatório.`
      };
    }

    const trimmed =
      value.trim();

    if (!trimmed) {
      return {
        ok: false,
        message:
          `O campo ${String(key)} não pode ficar vazio.`
      };
    }

    if (
      trimmed.length >
      limits[key]
    ) {
      return {
        ok: false,
        message:
          `O campo ${String(key)} excede o limite de ${limits[key]} caracteres.`
      };
    }

    config[key] = trimmed;
  }

  return {
    ok: true,
    config
  };
}

function validateContactId(
  value: unknown
): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const contactId =
    value.trim();

  if (
    !contactId ||
    contactId.length > 200 ||
    /[\u0000-\u001f\u007f]/.test(contactId)
  ) {
    return undefined;
  }

  return contactId;
}

export async function botRoutes(
  app: FastifyInstance
): Promise<void> {
  /*
   * Todas as rotas deste plugin exigem JWT.
   * Como botRoutes é registrado por app.register(),
   * o hook permanece encapsulado nestas rotas.
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

  app.get(
    "/bot/config",
    async (request, reply) => {
      try {
        const userId =
          authenticatedUserId(
            request
          );

        const config =
          await botService.getConfig(
            userId
          );

        reply.header(
          "Cache-Control",
          "no-store"
        );

        return {
          success: true,
          config
        };
      } catch (error: unknown) {
        app.log.error(error);

        return reply.status(500).send({
          success: false,
          message:
            "Não foi possível carregar a configuração do bot."
        });
      }
    }
  );

  app.put(
    "/bot/config",
    async (request, reply) => {
      try {
        const userId =
          authenticatedUserId(
            request
          );

        const validation =
          validateConfig(
            request.body
          );

        if (
          validation.ok === false
        ) {
          return reply.status(400).send({
            success: false,
            message:
              validation.message
          });
        }

        const config =
          await botService.saveConfig(
            userId,
            validation.config
          );

        reply.header(
          "Cache-Control",
          "no-store"
        );

        return {
          success: true,
          message:
            "Configuração do bot salva com sucesso.",
          config
        };
      } catch (error: unknown) {
        app.log.error(error);

        return reply.status(500).send({
          success: false,
          message:
            "Não foi possível salvar a configuração do bot."
        });
      }
    }
  );

  app.get(
    "/bot/human-contacts",
    async (request, reply) => {
      try {
        const userId =
          authenticatedUserId(
            request
          );

        const contacts =
          await botService.getHumanContacts(
            userId
          );

        // IDs de contatos são dados sensíveis.
        reply.header(
          "Cache-Control",
          "no-store, private"
        );

        return {
          success: true,
          contacts
        };
      } catch (error: unknown) {
        app.log.error(error);

        return reply.status(500).send({
          success: false,
          message:
            "Não foi possível carregar os atendimentos humanos."
        });
      }
    }
  );

  app.put(
    "/bot/human-contacts/:contactId/resume",
    async (request, reply) => {
      try {
        const userId =
          authenticatedUserId(
            request
          );

        const params =
          request.params as {
            contactId?: unknown;
          };

        const contactId =
          validateContactId(
            params.contactId
          );

        if (!contactId) {
          return reply.status(400).send({
            success: false,
            message:
              "Contato inválido."
          });
        }

        await botService.resumeContact(
          userId,
          contactId
        );

        return {
          success: true,
          message:
            "Atendimento humano encerrado. O bot foi reativado para este contato."
        };
      } catch (error: unknown) {
        app.log.error(error);

        return reply.status(500).send({
          success: false,
          message:
            "Não foi possível reativar o bot para este contato."
        });
      }
    }
  );
}
