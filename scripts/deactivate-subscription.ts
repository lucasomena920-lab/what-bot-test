import prisma from "../src/config/database";

async function main(): Promise<void> {
  const email =
    process.argv[2]
      ?.trim()
      .toLowerCase();

  if (!email) {
    console.error(
      "Uso: npx.cmd tsx script/deactivate-subscription.ts email@exemplo.com"
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
        subscriptionStatus:
          "canceled",
        subscriptionEndsAt:
          new Date()
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
    "Assinatura desativada:"
  );

  console.table(
    updatedUser
  );
}

main()
  .catch((error: unknown) => {
    console.error(
      "Erro ao desativar assinatura:",
      error
    );

    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
