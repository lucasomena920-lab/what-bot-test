import prisma from "../config/database";
import {
  defaultBotConfig,
  type BotConfigData
} from "./bot.config";

class BotService {
  private normalize(text: string): string {
    return text
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  }

  private render(
    text: string,
    config: BotConfigData
  ): string {
    return text.replace(
      /\{empresa\}/gi,
      config.companyName
    );
  }

  private async isHumanMode(
    userId: number,
    contactId: string
  ): Promise<boolean> {
    try {
      const state =
        await prisma.botContactState.findUnique({
          where: {
            userId_contactId: {
              userId,
              contactId
            }
          },
          select: {
            humanMode: true
          }
        });

      return state?.humanMode ?? false;
    } catch (error: unknown) {
      console.error(
        `Erro ao consultar modo humano do contato ${contactId}:`,
        error
      );

      return false;
    }
  }

  private async setHumanMode(
    userId: number,
    contactId: string,
    enabled: boolean
  ): Promise<void> {
    await prisma.botContactState.upsert({
      where: {
        userId_contactId: {
          userId,
          contactId
        }
      },
      create: {
        userId,
        contactId,
        humanMode: enabled
      },
      update: {
        humanMode: enabled
      }
    });
  }

  async getConfig(
    userId: number
  ): Promise<BotConfigData> {
    try {
      const saved =
        await prisma.botConfig.findUnique({
          where: {
            userId
          },
          select: {
            companyName: true,
            greeting: true,
            menu: true,
            businessHours: true,
            services: true,
            humanSupport: true,
            fallback: true
          }
        });

      if (!saved) {
        return {
          ...defaultBotConfig
        };
      }

      return saved;
    } catch (error: unknown) {
      console.error(
        `Erro ao carregar configuração do bot do usuário ${userId}:`,
        error
      );

      return {
        ...defaultBotConfig
      };
    }
  }

  async saveConfig(
    userId: number,
    config: BotConfigData
  ): Promise<BotConfigData> {
    return prisma.botConfig.upsert({
      where: {
        userId
      },
      create: {
        userId,
        ...config
      },
      update: {
        ...config
      },
      select: {
        companyName: true,
        greeting: true,
        menu: true,
        businessHours: true,
        services: true,
        humanSupport: true,
        fallback: true
      }
    });
  }

  async getHumanContacts(
    userId: number
  ): Promise<
    Array<{
      contactId: string;
      humanMode: boolean;
      updatedAt: Date;
    }>
  > {
    return prisma.botContactState.findMany({
      where: {
        userId,
        humanMode: true
      },
      select: {
        contactId: true,
        humanMode: true,
        updatedAt: true
      },
      orderBy: {
        updatedAt: "desc"
      }
    });
  }

  async resumeContact(
    userId: number,
    contactId: string
  ): Promise<void> {
    const state =
      await prisma.botContactState.findUnique({
        where: {
          userId_contactId: {
            userId,
            contactId
          }
        },
        select: {
          id: true
        }
      });

    if (!state) {
      return;
    }

    await this.setHumanMode(
      userId,
      contactId,
      false
    );
  }

  async getReply(
    userId: number,
    text: string,
    contactId?: string
  ): Promise<string | undefined> {
    const command = this.normalize(text);
    const config =
      await this.getConfig(userId);

    if (contactId) {
      const resumeCommands = [
        "voltar ao bot",
        "voltar",
        "bot",
        "menu bot",
        "encerrar atendimento",
        "finalizar atendimento"
      ];

      const humanMode =
        await this.isHumanMode(
          userId,
          contactId
        );

      if (humanMode) {
        if (resumeCommands.includes(command)) {
          await this.setHumanMode(
            userId,
            contactId,
            false
          );

          return (
            "🤖 Atendimento automático reativado.\n\n" +
            this.render(
              config.menu,
              config
            )
          );
        }

        return undefined;
      }
    }

    if (
      [
        "oi",
        "ola",
        "bom dia",
        "boa tarde",
        "boa noite"
      ].includes(command)
    ) {
      return this.render(
        config.greeting,
        config
      );
    }

    if (
      command === "menu" ||
      command === "ajuda" ||
      command === "inicio"
    ) {
      return this.render(
        config.menu,
        config
      );
    }

    if (
      command === "1" ||
      command === "horario" ||
      command === "horarios"
    ) {
      return this.render(
        config.businessHours,
        config
      );
    }

    if (
      command === "2" ||
      command === "servico" ||
      command === "servicos"
    ) {
      return this.render(
        config.services,
        config
      );
    }

    if (
      command === "3" ||
      command === "atendente" ||
      command === "humano"
    ) {
      if (contactId) {
        await this.setHumanMode(
          userId,
          contactId,
          true
        );
      }

      return this.render(
        config.humanSupport,
        config
      );
    }

    return this.render(
      config.fallback,
      config
    );
  }
}

export const botService =
  new BotService();
