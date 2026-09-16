import Stripe from "stripe";

import env from "../src/config/env";

const stripe =
  new Stripe(
    env.stripeSecretKey
  );

const eventId =
  `evt_idempotency_test_${Date.now()}`;

const payload =
  JSON.stringify({
    id: eventId,
    object: "event",
    api_version: "2024-06-20",
    created:
      Math.floor(
        Date.now() / 1000
      ),
    data: {
      object: {
        id: "obj_idempotency_test"
      }
    },
    livemode: false,
    pending_webhooks: 1,
    request: {
      id: null,
      idempotency_key: null
    },
    type:
      "wpp_bot.idempotency_test"
  });

async function sendWebhook(
  attempt: number
): Promise<void> {
  const signature =
    stripe.webhooks
      .generateTestHeaderString({
        payload,
        secret:
          env.stripeWebhookSecret
      });

  const response =
    await fetch(
      `${env.appUrl}/stripe/webhook`,
      {
        method: "POST",
        headers: {
          "content-type":
            "application/json",
          "stripe-signature":
            signature
        },
        body: payload
      }
    );

  const text =
    await response.text();

  console.log(
    `Tentativa ${attempt}: HTTP ${response.status}`
  );

  console.log(
    text
  );
}

async function main(): Promise<void> {
  console.log(
    `Testando o mesmo event.id duas vezes: ${eventId}`
  );

  await sendWebhook(1);
  await sendWebhook(2);
}

main().catch(
  (error: unknown) => {
    console.error(
      "Erro no teste de idempotência:",
      error
    );

    process.exitCode = 1;
  }
);
