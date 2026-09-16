import "@fastify/jwt";
import type { FastifyRequest } from "fastify";

declare module "fastify" {
  interface FastifyInstance {
    jwt: {
      sign(
        payload: Record<string, unknown>,
        options?: { expiresIn: string }
      ): Promise<string>;

      verify<T = Record<string, unknown>>(
        request: FastifyRequest
      ): Promise<T>;
    };
  }
}
