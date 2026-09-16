import makeWASocket, {
  Browsers,
  DisconnectReason,
  fetchLatestWaWebVersion,
  useMultiFileAuthState,
  type WAMessage
} from "@whiskeysockets/baileys";

import QRCode from "qrcode";
import fs from "node:fs/promises";
import path from "node:path";

import prisma from "../config/database";
import { botService } from "../services/bot.service";
import type { WhatsAppSession } from "./whatsapp.types";

type Socket = ReturnType<typeof makeWASocket>;

const SESSION_DIRECTORY_MODE = 0o700;
const SESSION_FILE_MODE = 0o600;

class WhatsAppService {
  private readonly sessions = new Map<number, WhatsAppSession>();
  private readonly sockets = new Map<number, Socket>();
  private readonly connecting = new Set<number>();
  private readonly reconnectTimers = new Map<number, NodeJS.Timeout>();
  private readonly reconnectAttempts = new Map<number, number>();

  private setSession(session: WhatsAppSession): void {
    this.sessions.set(session.userId, session);

    void prisma.whatsAppSession
      .upsert({
        where: {
          userId: session.userId
        },
        create: {
          userId: session.userId,
          status: session.status,
          phoneNumber: session.phoneNumber,
          lastError: session.lastError,
          connectedAt: session.connectedAt
        },
        update: {
          status: session.status,
          phoneNumber: session.phoneNumber,
          lastError: session.lastError,
          connectedAt: session.connectedAt
        }
      })
      .catch((error: unknown) => {
        console.error(
          `Erro ao salvar sessão WhatsApp do usuário ${session.userId}:`,
          error
        );
      });
  }

  private sessionsRootPath(): string {
    return path.resolve(
      process.cwd(),
      "sessions"
    );
  }

  private sessionPath(userId: number): string {
    if (
      !Number.isInteger(userId) ||
      userId <= 0
    ) {
      throw new Error("userId inválido.");
    }

    return path.join(
      this.sessionsRootPath(),
      String(userId)
    );
  }

  private credentialsPath(userId: number): string {
    return path.join(
      this.sessionPath(userId),
      "creds.json"
    );
  }

  private async safeChmod(
    targetPath: string,
    mode: number
  ): Promise<void> {
    try {
      await fs.chmod(
        targetPath,
        mode
      );
    } catch (error: unknown) {
      // No Windows o chmod possui limitações de ACL.
      // Em produção Linux/Unix, qualquer falha é relevante.
      if (process.platform !== "win32") {
        console.warn(
          `Não foi possível restringir permissões de ${targetPath}:`,
          error
        );
      }
    }
  }

  private async ensureSecureSessionDirectory(
    userId: number
  ): Promise<string> {
    const root =
      this.sessionsRootPath();

    const folder =
      this.sessionPath(userId);

    await fs.mkdir(
      root,
      {
        recursive: true,
        mode: SESSION_DIRECTORY_MODE
      }
    );

    await fs.mkdir(
      folder,
      {
        recursive: true,
        mode: SESSION_DIRECTORY_MODE
      }
    );

    await this.safeChmod(
      root,
      SESSION_DIRECTORY_MODE
    );

    await this.safeChmod(
      folder,
      SESSION_DIRECTORY_MODE
    );

    return folder;
  }

  private async hardenSessionFiles(
    folder: string
  ): Promise<void> {
    try {
      const entries =
        await fs.readdir(
          folder,
          {
            withFileTypes: true,
            encoding: "utf8"
          }
        );

      await this.safeChmod(
        folder,
        SESSION_DIRECTORY_MODE
      );

      for (const entry of entries) {
        const target =
          path.join(
            folder,
            entry.name
          );

        if (entry.isDirectory()) {
          await this.hardenSessionFiles(
            target
          );

          continue;
        }

        if (entry.isFile()) {
          await this.safeChmod(
            target,
            SESSION_FILE_MODE
          );
        }
      }
    } catch {
      return;
    }
  }

  private clearReconnectTimer(userId: number): void {
    const timer = this.reconnectTimers.get(userId);

    if (timer) {
      clearTimeout(timer);
    }

    this.reconnectTimers.delete(userId);
  }

  private scheduleReconnect(
    userId: number,
    maxAttempts = 3
  ): boolean {
    if (this.reconnectTimers.has(userId)) {
      return true;
    }

    const attempts = this.reconnectAttempts.get(userId) ?? 0;

    if (attempts >= maxAttempts) {
      return false;
    }

    const nextAttempt = attempts + 1;
    this.reconnectAttempts.set(userId, nextAttempt);

    console.log(
      `Reconexão do usuário ${userId}: tentativa ${nextAttempt}/${maxAttempts}.`
    );

    const timer = setTimeout(() => {
      this.reconnectTimers.delete(userId);

      void this.connect(userId, true).catch((error: unknown) => {
        console.error(
          `Erro ao reconectar WhatsApp do usuário ${userId}:`,
          error
        );
      });
    }, 3000);

    this.reconnectTimers.set(userId, timer);

    return true;
  }

  private messageText(message: WAMessage): string | undefined {
    const content =
      message.message?.ephemeralMessage?.message ??
      message.message;

    const text =
      content?.conversation ??
      content?.extendedTextMessage?.text ??
      content?.imageMessage?.caption ??
      content?.videoMessage?.caption;

    return text ?? undefined;
  }

  private async answerIncomingMessage(
    userId: number,
    socket: Socket,
    message: WAMessage
  ): Promise<void> {
    const chatId = message.key.remoteJid;

    if (
      !chatId ||
      message.key.fromMe ||
      chatId === "status@broadcast" ||
      chatId.endsWith("@g.us")
    ) {
      return;
    }

    const text = this.messageText(message)?.trim();

    if (!text) {
      return;
    }

    const reply = await botService.getReply(
      userId,
      text,
      chatId
    );

    if (!reply) {
      return;
    }

    await socket.sendMessage(
      chatId,
      {
        text: reply
      },
      {
        quoted: message
      }
    );
  }

  async connect(
    userId: number,
    isReconnect = false
  ): Promise<void> {
    if (!Number.isInteger(userId) || userId <= 0) {
      throw new Error("userId inválido.");
    }

    if (this.connecting.has(userId) || this.sockets.has(userId)) {
      return;
    }

    this.clearReconnectTimer(userId);

    if (!isReconnect) {
      this.reconnectAttempts.delete(userId);
    }

    this.connecting.add(userId);

    try {
      const authFolder =
        await this.ensureSecureSessionDirectory(
          userId
        );

      const { state, saveCreds } =
        await useMultiFileAuthState(
          authFolder
        );

      await this.hardenSessionFiles(
        authFolder
      );

      this.setSession({
        userId,
        status: "connecting"
      });

      let version: [number, number, number] | undefined;

      try {
        const latest = await fetchLatestWaWebVersion({});
        version = latest.version;

        console.log(
          `WhatsApp Web ${version.join(".")} para usuário ${userId}.`
        );
      } catch (error: unknown) {
        console.warn(
          "Não foi possível consultar a versão do WhatsApp Web:",
          error
        );
      }

      const socket = makeWASocket({
        auth: state,
        ...(version ? { version } : {}),
        browser: Browsers.windows("Chrome"),
        printQRInTerminal: false,
        markOnlineOnConnect: false,
        syncFullHistory: false
      });

      this.sockets.set(userId, socket);

      socket.ev.on(
        "creds.update",
        async () => {
          try {
            await saveCreds();

            await this.hardenSessionFiles(
              authFolder
            );
          } catch (error: unknown) {
            console.error(
              `Erro ao salvar credenciais do WhatsApp do usuário ${userId}:`,
              error
            );
          }
        }
      );

      socket.ev.on(
        "messages.upsert",
        async ({ messages, type }) => {
          if (type !== "notify") {
            return;
          }

          for (const message of messages) {
            try {
              await this.answerIncomingMessage(
                userId,
                socket,
                message
              );
            } catch (error: unknown) {
              console.error(
                `Erro ao responder mensagem do usuário ${userId}:`,
                error
              );
            }
          }
        }
      );

      socket.ev.on(
        "connection.update",
        async ({ connection, lastDisconnect, qr }) => {
          if (qr) {
            try {
              const qrCode = await QRCode.toDataURL(qr, {
                width: 400,
                margin: 2
              });

              this.setSession({
                userId,
                status: "qr",
                qrCode
              });

              console.log(
                `QR Code gerado para usuário ${userId}.`
              );
            } catch (error: unknown) {
              console.error(
                `Erro ao gerar QR do usuário ${userId}:`,
                error
              );

              this.setSession({
                userId,
                status: "error",
                lastError: "Erro ao gerar o QR Code."
              });
            }
          }

          if (connection === "open") {
            this.connecting.delete(userId);
            this.reconnectAttempts.delete(userId);
            this.clearReconnectTimer(userId);

            const phoneNumber =
              socket.user?.id?.split(":")[0] ?? undefined;

            this.setSession({
              userId,
              status: "open",
              phoneNumber,
              connectedAt: new Date(),
              lastError: undefined
            });

            console.log(
              `WhatsApp conectado para usuário ${userId}.`
            );

            return;
          }

          if (connection !== "close") {
            return;
          }

          this.connecting.delete(userId);

          if (this.sockets.get(userId) === socket) {
            this.sockets.delete(userId);
          }

          const statusCode =
            (
              lastDisconnect?.error as
                | {
                    output?: {
                      statusCode?: number;
                    };
                  }
                | undefined
            )?.output?.statusCode;

          console.log(
            `WhatsApp desconectado para usuário ${userId}. Código: ${
              statusCode ?? "desconhecido"
            }`
          );

          if (
            statusCode ===
            DisconnectReason.restartRequired
          ) {
            console.log(
              `Reinício solicitado pelo WhatsApp para usuário ${userId} (515).`
            );

            this.setSession({
              userId,
              status: "connecting",
              lastError: undefined
            });

            const scheduled =
              this.scheduleReconnect(userId, 10);

            if (!scheduled) {
              this.setSession({
                userId,
                status: "error",
                lastError:
                  "O WhatsApp solicitou várias reinicializações e não foi possível concluir a conexão."
              });
            }

            return;
          }

          if (
            statusCode ===
            DisconnectReason.loggedOut
          ) {
            this.reconnectAttempts.delete(userId);

            this.setSession({
              userId,
              status: "close",
              lastError:
                "Sessão encerrada pelo WhatsApp. Conecte novamente para obter outro QR Code."
            });

            return;
          }

          if (statusCode === 405) {
            this.setSession({
              userId,
              status: "error",
              lastError:
                "WhatsApp recusou a conexão (405). Tente novamente mais tarde."
            });

            return;
          }

          if (!state.creds.registered) {
            this.setSession({
              userId,
              status: "close",
              lastError:
                `WhatsApp ainda não foi autenticado (código ${
                  statusCode ?? "desconhecido"
                }).`
            });

            const scheduled =
              this.scheduleReconnect(userId, 3);

            if (scheduled) {
              return;
            }

            this.setSession({
              userId,
              status: "error",
              lastError:
                "Não foi possível obter um QR Code após 3 tentativas. Clique em Conectar WhatsApp para tentar novamente."
            });

            return;
          }

          this.setSession({
            userId,
            status: "close",
            lastError:
              `Conexão encerrada (código ${
                statusCode ?? "desconhecido"
              }). Reconectando...`
          });

          const scheduled =
            this.scheduleReconnect(userId, 10);

          if (!scheduled) {
            this.setSession({
              userId,
              status: "error",
              lastError:
                "Não foi possível reconectar o WhatsApp."
            });
          }
        }
      );
    } catch (error: unknown) {
      this.connecting.delete(userId);
      this.sockets.delete(userId);

      this.setSession({
        userId,
        status: "error",
        lastError:
          error instanceof Error
            ? error.message
            : "Erro desconhecido."
      });

      throw error;
    }
  }

  async restoreSessions(): Promise<void> {
    let savedSessions: Array<{
      userId: number;
      status: string;
    }>;

    try {
      savedSessions = await prisma.whatsAppSession.findMany({
        select: {
          userId: true,
          status: true
        }
      });
    } catch (error: unknown) {
      console.error(
        "Erro ao consultar sessões do WhatsApp para restauração:",
        error
      );
      return;
    }

    const restorableSessions = savedSessions.filter(
      (session) => session.status === "open"
    );

    if (restorableSessions.length === 0) {
      console.log(
        "Nenhuma sessão WhatsApp autenticada para restaurar."
      );
      return;
    }

    console.log(
      `Restaurando ${restorableSessions.length} sessão(ões) do WhatsApp...`
    );

    for (const session of restorableSessions) {
      try {
        await fs.access(
          this.credentialsPath(session.userId)
        );

        await this.hardenSessionFiles(
          this.sessionPath(
            session.userId
          )
        );
      } catch {
        console.warn(
          `Credenciais locais não encontradas para o usuário ${session.userId}. A sessão não será restaurada automaticamente.`
        );

        this.setSession({
          userId: session.userId,
          status: "close",
          lastError:
            "As credenciais locais do WhatsApp não foram encontradas. Conecte novamente pelo QR Code."
        });

        continue;
      }

      try {
        console.log(
          `Restaurando WhatsApp do usuário ${session.userId}...`
        );

        await this.connect(
          session.userId,
          true
        );
      } catch (error: unknown) {
        console.error(
          `Erro ao restaurar WhatsApp do usuário ${session.userId}:`,
          error
        );
      }
    }
  }

  async getSession(
    userId: number
  ): Promise<WhatsAppSession | undefined> {
    const inMemorySession =
      this.sessions.get(userId);

    if (inMemorySession) {
      return inMemorySession;
    }

    const savedSession =
      await prisma.whatsAppSession.findUnique({
        where: {
          userId
        }
      });

    if (!savedSession) {
      return undefined;
    }

    const session: WhatsAppSession = {
      userId: savedSession.userId,
      status:
        savedSession.status as WhatsAppSession["status"],
      phoneNumber:
        savedSession.phoneNumber ?? undefined,
      connectedAt:
        savedSession.connectedAt ?? undefined,
      lastError:
        savedSession.lastError ?? undefined
    };

    this.sessions.set(userId, session);

    return session;
  }

  getAllSessions(): WhatsAppSession[] {
    return [...this.sessions.values()].map(
      ({ qrCode: _qrCode, ...session }) =>
        session
    );
  }

  getQRCode(
    userId: number
  ): string | undefined {
    return this.sessions.get(userId)?.qrCode;
  }

  async removeSession(
    userId: number
  ): Promise<void> {
    this.clearReconnectTimer(userId);
    this.reconnectAttempts.delete(userId);
    this.connecting.delete(userId);

    const socket =
      this.sockets.get(userId);

    this.sockets.delete(userId);

    if (socket) {
      try {
        await socket.logout();
      } catch (error: unknown) {
        console.warn(
          `Não foi possível fazer logout do usuário ${userId}:`,
          error
        );
      }
    }

    await fs.rm(
      this.sessionPath(userId),
      {
        recursive: true,
        force: true
      }
    );

    this.sessions.delete(userId);

    await prisma.whatsAppSession.deleteMany({
      where: {
        userId
      }
    });
  }
}

export const whatsappService =
  new WhatsAppService();
