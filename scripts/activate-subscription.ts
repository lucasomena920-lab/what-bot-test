import prisma from "../src/config/database";

type Plan =
  | "basic"
  | "premium";

function normalizePlan(
  value: string | undefined
): Plan | undefined {
  const plan =
    value
      ?.trim()
      .toLowerCase();

  if (
    plan === "basic" ||
    plan === "premium"
  ) {
    return plan;
  }

  return undefined;
}

async function main(): Promise<void> {
  const email =
    process.argv[2]
      ?.trim()
      .toLowerCase();

  const plan =
    normalizePlan(
      process.argv[3]
    );

  if (
    !email ||
    !plan
  ) {
    console.error(
      "Uso: npx.cmd tsx scripts/activate-subscription.ts email@exemplo.com basic"
    );

    console.error(
      "Planos válidos: basic | premium"
    );

    process.exitCode = 1;
    return;
  }

  const user =
    await prisma.user.findUnique({
      where: {
        email
      },
      select: {
        id: true,
        name: true,
        email: true,
        active: true,
        plan: true,
        subscriptionStatus: true
      }
    });

  if (!user) {
    console.error(
      "Usuário não encontrado."
    );

    process.exitCode = 1;
    return;
  }

  const updatedUser =
    await prisma.user.update({
      where: {
        id: user.id
      },
      data: {
        active: true,
        plan,
        subscriptionStatus:
          "active",
        subscriptionStartsAt:
          new Date(),
        subscriptionEndsAt:
          null
      },
      select: {
        id: true,
        name: true,
        email: true,
        active: true,
        plan: true,
        subscriptionStatus: true,
        subscriptionStartsAt: true,
        subscriptionEndsAt: true
      }
    });

  console.log(
    "Assinatura ativada manualmente:"
  );

  console.table(
    updatedUser
  );
}

main()
  .catch((error: unknown) => {
    console.error(
      "Erro ao ativar assinatura:",
      error
    );

    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
