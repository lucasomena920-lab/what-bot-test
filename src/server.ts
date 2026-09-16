import Fastify from "fastify";
import fastifyJwt from "@fastify/jwt";
import fastifyCookie from "@fastify/cookie";
import fastifyRawBody from "fastify-raw-body";

import env from "./config/env";

import { authRoutes } from "./routes/auth.routes";
import { userRoutes } from "./routes/user.routes";
import { whatsappRoutes } from "./routes/whatsapp.routes";
import { botRoutes } from "./routes/bot.routes";
import { subscriptionRoutes } from "./routes/subscription.routes";
import { stripeRoutes } from "./routes/stripe.routes";

import { whatsappService } from "./whatsapp/whatsapp.service";
import { homePage } from "./web/home";

const app = Fastify({
  logger: true,
  bodyLimit: 10_000,
  trustProxy: false
});

const APP_ORIGIN =
  new URL(
    env.appUrl
  ).origin;

const UNSAFE_METHODS =
  new Set([
    "POST",
    "PUT",
    "PATCH",
    "DELETE"
  ]);

function requestOrigin(
  value:
    | string
    | undefined
): string | undefined {
  if (!value) {
    return undefined;
  }

  try {
    return new URL(
      value
    ).origin;
  } catch {
    return undefined;
  }
}

app.addHook(
  "onRequest",
  async (
    request,
    reply
  ) => {
    if (
      !UNSAFE_METHODS.has(
        request.method
      )
    ) {
      return;
    }

    /*
     * O webhook da Stripe é uma chamada
     * servidor-para-servidor e possui sua
     * própria verificação criptográfica.
     */
    if (
      request.url.startsWith(
        "/stripe/webhook"
      )
    ) {
      return;
    }

    const fetchSite =
      request.headers[
        "sec-fetch-site"
      ];

    if (
      fetchSite ===
      "cross-site"
    ) {
      return reply
        .status(403)
        .send({
          success: false,
          code:
            "CROSS_SITE_REQUEST_BLOCKED",
          message:
            "Origem da requisição não autorizada."
        });
    }

    const origin =
      requestOrigin(
        request.headers.origin
      );

    if (
      origin &&
      origin !== APP_ORIGIN
    ) {
      return reply
        .status(403)
        .send({
          success: false,
          code:
            "INVALID_ORIGIN",
          message:
            "Origem da requisição não autorizada."
        });
    }

    if (!origin) {
      const referer =
        requestOrigin(
          request.headers.referer
        );

      if (
        referer &&
        referer !== APP_ORIGIN
      ) {
        return reply
          .status(403)
          .send({
            success: false,
            code:
              "INVALID_ORIGIN",
            message:
              "Origem da requisição não autorizada."
          });
      }
    }
  }
);

app.addHook(
  "onSend",
  async (_request, reply) => {
    reply.header(
      "X-Content-Type-Options",
      "nosniff"
    );

    reply.header(
      "X-Frame-Options",
      "DENY"
    );

    reply.header(
      "Referrer-Policy",
      "no-referrer"
    );

    reply.header(
      "Permissions-Policy",
      "camera=(), microphone=(), geolocation=()"
    );

    reply.header(
      "Content-Security-Policy",
      "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'"
    );
  }
);

app.addContentTypeParser(
  /^application\/x-www-form-urlencoded(?:;.*)?$/i,
  {
    parseAs: "string"
  },
  (_request, _body, done) =>
    done(null, {})
);

app.get(
  "/",
  (_request, reply) => {
    return reply
      .type(
        "text/html; charset=utf-8"
      )
      .send(homePage);
  }
);

async function start(): Promise<void> {
  await app.register(
    fastifyCookie
  );

  await app.register(
    fastifyJwt,
    {
      secret: env.jwtSecret,
      cookie: {
        cookieName:
          "wpp_bot_session",
        signed:
          false
      }
    }
  );

  await app.register(
    fastifyRawBody,
    {
      field: "rawBody",
      global: false,
      encoding: false,
      runFirst: true
    }
  );

  await app.register(authRoutes);
  await app.register(userRoutes);
  await app.register(whatsappRoutes);
  await app.register(botRoutes);
  await app.register(subscriptionRoutes);
  await app.register(stripeRoutes);

  await app.listen({
    port: env.port,
    host: "0.0.0.0"
  });

  await whatsappService.restoreSessions();
}

start().catch(
  (error: unknown) => {
    app.log.error(error);
    process.exit(1);
  }
);
