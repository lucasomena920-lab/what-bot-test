import type {
  FastifyInstance,
  FastifyRequest
} from "fastify";

import argon2 from "argon2";

import prisma from "../config/database";
import env from "../config/env";

const LOGIN_MAX_ATTEMPTS_PER_ACCOUNT = 7;
const LOGIN_MAX_ATTEMPTS_PER_IP = 30;
const REGISTER_MAX_ATTEMPTS_PER_IP = 10;

const WINDOW_MS = 15 * 60 * 1000;
const MAX_TRACKED_KEYS = 10_000;

const AUTH_COOKIE_NAME =
  "wpp_bot_session";

const AUTH_SESSION_SECONDS =
  8 * 60 * 60;

function useSecureCookie(): boolean {
  return env.appUrl.startsWith(
    "https://"
  );
}

type AttemptEntry = {
  count: number;
  expiresAt: number;
};

const loginAccountAttempts =
  new Map<string, AttemptEntry>();

const loginIpAttempts =
  new Map<string, AttemptEntry>();

const registerIpAttempts =
  new Map<string, AttemptEntry>();

// Usado quando o e-mail não existe para reduzir diferença de tempo
// entre "usuário inexistente" e "senha incorreta".
const dummyPasswordHashPromise = argon2.hash(
  "dummy-password-not-used-920",
  {
    type: argon2.argon2id,
    memoryCost: 19_456,
    timeCost: 2,
    parallelism: 1
  }
);

function normalizeEmail(
  value: unknown
): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const email =
    value.trim().toLowerCase();

  if (!email || email.length > 254) {
    return undefined;
  }

  // Validação simples e suficiente para bloquear formatos obviamente inválidos.
  if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      email
    )
  ) {
    return undefined;
  }

  return email;
}

function validPassword(
  password: string
): boolean {
  return (
    password.length >= 10 &&
    password.length <= 128 &&
    /[a-zA-Z]/.test(password) &&
    /\d/.test(password)
  );
}

function cleanupExpired(
  map: Map<string, AttemptEntry>
): void {
  const now = Date.now();

  for (const [key, entry] of map) {
    if (entry.expiresAt <= now) {
      map.delete(key);
    }
  }

  // Proteção extra para impedir crescimento ilimitado em memória.
  if (map.size > MAX_TRACKED_KEYS) {
    const excess =
      map.size - MAX_TRACKED_KEYS;

    let removed = 0;

    for (const key of map.keys()) {
      map.delete(key);
      removed += 1;

      if (removed >= excess) {
        break;
      }
    }
  }
}

function isRateLimited(
  map: Map<string, AttemptEntry>,
  key: string,
  limit: number
): boolean {
  cleanupExpired(map);

  const entry = map.get(key);

  if (!entry) {
    return false;
  }

  return entry.count >= limit;
}

function registerFailure(
  map: Map<string, AttemptEntry>,
  key: string
): void {
  cleanupExpired(map);

  const now = Date.now();
  const entry = map.get(key);

  if (
    !entry ||
    entry.expiresAt <= now
  ) {
    map.set(key, {
      count: 1,
      expiresAt: now + WINDOW_MS
    });

    return;
  }

  entry.count += 1;
}

function secondsUntilReset(
  map: Map<string, AttemptEntry>,
  key: string
): number {
  const entry = map.get(key);

  if (!entry) {
    return Math.ceil(WINDOW_MS / 1000);
  }

  return Math.max(
    1,
    Math.ceil(
      (entry.expiresAt - Date.now()) / 1000
    )
  );
}

function rateLimitResponse(
  reply: {
    header(
      name: string,
      value: string
    ): unknown;
    status(code: number): {
      send(payload: unknown): unknown;
    };
  },
  seconds: number
) {
  reply.header(
    "Retry-After",
    String(seconds)
  );

  return reply.status(429).send({
    success: false,
    message:
      "Muitas tentativas. Aguarde alguns minutos e tente novamente."
  });
}

function loginAccountKey(
  request: FastifyRequest,
  email: string
): string {
  return `${request.ip}:${email}`;
}

function loginIpKey(
  request: FastifyRequest
): string {
  return request.ip;
}

function registerIpKey(
  request: FastifyRequest
): string {
  return request.ip;
}

export async function authRoutes(
  app: FastifyInstance
): Promise<void> {
  app.post(
    "/auth/register",
    async (request, reply) => {
      const ipKey =
        registerIpKey(request);

      if (
        isRateLimited(
          registerIpAttempts,
          ipKey,
          REGISTER_MAX_ATTEMPTS_PER_IP
        )
      ) {
        return rateLimitResponse(
          reply,
          secondsUntilReset(
            registerIpAttempts,
            ipKey
          )
        );
      }

      if (
        !request.body ||
        typeof request.body !== "object" ||
        Array.isArray(request.body)
      ) {
        registerFailure(
          registerIpAttempts,
          ipKey
        );

        return reply.status(400).send({
          success: false,
          message:
            "Preencha nome, e-mail e senha corretamente."
        });
      }

      const body = request.body as {
        name?: unknown;
        email?: unknown;
        password?: unknown;
      };

      const name =
        typeof body.name === "string"
          ? body.name.trim()
          : "";

      const email =
        normalizeEmail(body.email);

      const password =
        typeof body.password === "string"
          ? body.password
          : "";

      if (
        !name ||
        name.length > 80 ||
        !email ||
        !password
      ) {
        registerFailure(
          registerIpAttempts,
          ipKey
        );

        return reply.status(400).send({
          success: false,
          message:
            "Preencha nome, e-mail e senha corretamente."
        });
      }

      if (!validPassword(password)) {
        registerFailure(
          registerIpAttempts,
          ipKey
        );

        return reply.status(400).send({
          success: false,
          message:
            "A senha deve ter entre 10 e 128 caracteres, incluindo pelo menos uma letra e um número."
        });
      }

      try {
        const existingUser =
          await prisma.user.findUnique({
            where: {
              email
            },
            select: {
              id: true
            }
          });

        if (existingUser) {
          registerFailure(
            registerIpAttempts,
            ipKey
          );

          return reply.status(409).send({
            success: false,
            message:
              "Não foi possível concluir o cadastro com estes dados."
          });
        }

        const passwordHash =
          await argon2.hash(
            password,
            {
              type: argon2.argon2id,
              memoryCost: 19_456,
              timeCost: 2,
              parallelism: 1
            }
          );

        const user =
          await prisma.user.create({
            data: {
              name,
              email,
              password: passwordHash
            },
            select: {
              id: true,
              name: true,
              email: true,
              plan: true,
              active: true,
              createdAt: true
            }
          });

        registerIpAttempts.delete(
          ipKey
        );

        return reply.status(201).send({
          success: true,
          message:
            "Conta criada com sucesso.",
          user
        });
      } catch (error: unknown) {
        app.log.error(error);

        return reply.status(500).send({
          success: false,
          message:
            "Erro interno do servidor."
        });
      }
    }
  );

  app.post(
    "/auth/login",
    async (request, reply) => {
      const ipKey =
        loginIpKey(request);

      if (
        isRateLimited(
          loginIpAttempts,
          ipKey,
          LOGIN_MAX_ATTEMPTS_PER_IP
        )
      ) {
        return rateLimitResponse(
          reply,
          secondsUntilReset(
            loginIpAttempts,
            ipKey
          )
        );
      }

      if (
        !request.body ||
        typeof request.body !== "object" ||
        Array.isArray(request.body)
      ) {
        registerFailure(
          loginIpAttempts,
          ipKey
        );

        return reply.status(400).send({
          success: false,
          message:
            "E-mail e senha são obrigatórios."
        });
      }

      const body = request.body as {
        email?: unknown;
        password?: unknown;
      };

      const email =
        normalizeEmail(body.email);

      const password =
        typeof body.password === "string"
          ? body.password
          : "";

      if (
        !email ||
        !password ||
        password.length > 128
      ) {
        registerFailure(
          loginIpAttempts,
          ipKey
        );

        return reply.status(400).send({
          success: false,
          message:
            "E-mail e senha são obrigatórios."
        });
      }

      const accountKey =
        loginAccountKey(
          request,
          email
        );

      if (
        isRateLimited(
          loginAccountAttempts,
          accountKey,
          LOGIN_MAX_ATTEMPTS_PER_ACCOUNT
        )
      ) {
        return rateLimitResponse(
          reply,
          secondsUntilReset(
            loginAccountAttempts,
            accountKey
          )
        );
      }

      try {
        const user =
          await prisma.user.findUnique({
            where: {
              email
            }
          });

        const hashToVerify =
          user?.password ??
          await dummyPasswordHashPromise;

        let passwordValid = false;

        try {
          passwordValid =
            await argon2.verify(
              hashToVerify,
              password
            );
        } catch {
          passwordValid = false;
        }

        if (
          !user ||
          !passwordValid ||
          !user.active
        ) {
          registerFailure(
            loginAccountAttempts,
            accountKey
          );

          registerFailure(
            loginIpAttempts,
            ipKey
          );

          return reply.status(401).send({
            success: false,
            message:
              "E-mail ou senha inválidos."
          });
        }

        loginAccountAttempts.delete(
          accountKey
        );

        const token =
          await app.jwt.sign(
            {
              userId: user.id
            },
            {
              expiresIn: "8h"
            }
          );

        reply.setCookie(
          AUTH_COOKIE_NAME,
          token,
          {
            path: "/",
            httpOnly: true,
            secure:
              useSecureCookie(),
            sameSite: "lax",
            maxAge:
              AUTH_SESSION_SECONDS
          }
        );

        reply.header(
          "Cache-Control",
          "no-store"
        );

        return reply.send({
          success: true,
          message:
            "Login realizado com sucesso.",
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            plan: user.plan
          }
        });
      } catch (error: unknown) {
        app.log.error(error);

        return reply.status(500).send({
          success: false,
          message:
            "Erro interno do servidor."
        });
      }
    }
  );

  app.get(
    "/auth/me",
    async (
      request,
      reply
    ) => {
      try {
        await request.jwtVerify({
          onlyCookie: true
        });

        const authUser =
          request.user as {
            userId?: unknown;
          };

        if (
          typeof authUser?.userId !==
            "number" ||
          !Number.isInteger(
            authUser.userId
          ) ||
          authUser.userId <= 0
        ) {
          return reply
            .status(401)
            .send({
              success: false,
              message:
                "Não autorizado."
            });
        }

        const user =
          await prisma.user.findUnique({
            where: {
              id: authUser.userId
            },
            select: {
              id: true,
              name: true,
              email: true,
              plan: true,
              active: true
            }
          });

        if (
          !user ||
          !user.active
        ) {
          reply.clearCookie(
            AUTH_COOKIE_NAME,
            {
              path: "/"
            }
          );

          return reply
            .status(401)
            .send({
              success: false,
              message:
                "Não autorizado."
            });
        }

        reply.header(
          "Cache-Control",
          "no-store"
        );

        return reply.send({
          success: true,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            plan: user.plan
          }
        });
      } catch {
        return reply
          .status(401)
          .send({
            success: false,
            message:
              "Não autorizado."
          });
      }
    }
  );

  app.post(
    "/auth/logout",
    async (
      _request,
      reply
    ) => {
      reply.clearCookie(
        AUTH_COOKIE_NAME,
        {
          path: "/"
        }
      );

      reply.header(
        "Cache-Control",
        "no-store"
      );

      return reply.send({
        success: true,
        message:
          "Sessão encerrada."
      });
    }
  );

}
