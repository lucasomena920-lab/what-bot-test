import "dotenv/config";

function requireEnv(
  name: string
): string {
  const value =
    process.env[name]?.trim();

  if (!value) {
    throw new Error(
      `Variável de ambiente obrigatória ausente: ${name}`
    );
  }

  return value;
}

function validateJwtSecret(
  value: string
): string {
  if (value.length < 32) {
    throw new Error(
      "JWT_SECRET deve ter pelo menos 32 caracteres."
    );
  }

  const weakValues = new Set([
    "secret",
    "jwtsecret",
    "changeme",
    "change-me",
    "default",
    "password"
  ]);

  if (
    weakValues.has(
      value.toLowerCase()
    )
  ) {
    throw new Error(
      "JWT_SECRET é muito fraco."
    );
  }

  return value;
}

function validatePort(
  value: string | undefined
): number {
  const parsed =
    Number(
      value ?? "3000"
    );

  if (
    !Number.isInteger(parsed) ||
    parsed < 1 ||
    parsed > 65_535
  ) {
    throw new Error(
      "PORT deve ser um número inteiro entre 1 e 65535."
    );
  }

  return parsed;
}

function validateStripeSecretKey(
  value: string
): string {
  if (
    !value.startsWith("sk_test_") &&
    !value.startsWith("sk_live_")
  ) {
    throw new Error(
      "STRIPE_SECRET_KEY inválida."
    );
  }

  return value;
}

function validateStripePriceId(
  name: string,
  value: string
): string {
  if (
    !value.startsWith("price_")
  ) {
    throw new Error(
      `${name} deve começar com price_.`
    );
  }

  return value;
}

function validateStripeWebhookSecret(
  value: string
): string {
  if (
    !value.startsWith("whsec_")
  ) {
    throw new Error(
      "STRIPE_WEBHOOK_SECRET inválida."
    );
  }

  return value;
}

function validateAppUrl(
  value: string
): string {
  let url: URL;

  try {
    url = new URL(value);
  } catch {
    throw new Error(
      "APP_URL inválida."
    );
  }

  if (
    url.protocol !== "http:" &&
    url.protocol !== "https:"
  ) {
    throw new Error(
      "APP_URL deve usar http:// ou https://."
    );
  }

  return value.replace(
    /\/+$/,
    ""
  );
}

const env = {
  port:
    validatePort(
      process.env.PORT
    ),

  appUrl:
    validateAppUrl(
      requireEnv(
        "APP_URL"
      )
    ),

  jwtSecret:
    validateJwtSecret(
      requireEnv(
        "JWT_SECRET"
      )
    ),

  stripeSecretKey:
    validateStripeSecretKey(
      requireEnv(
        "STRIPE_SECRET_KEY"
      )
    ),

  stripeWebhookSecret:
    validateStripeWebhookSecret(
      requireEnv(
        "STRIPE_WEBHOOK_SECRET"
      )
    ),

  stripeBasicPriceId:
    validateStripePriceId(
      "STRIPE_BASIC_PRICE_ID",
      requireEnv(
        "STRIPE_BASIC_PRICE_ID"
      )
    ),

  stripePremiumPriceId:
    validateStripePriceId(
      "STRIPE_PREMIUM_PRICE_ID",
      requireEnv(
        "STRIPE_PREMIUM_PRICE_ID"
      )
    )
} as const;

export default env;
