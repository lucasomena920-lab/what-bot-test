import { FastifyInstance } from "fastify";
import prisma from "../config/database";
import { authenticate } from "../utils/auth";

export async function userRoutes(app: FastifyInstance) {
  app.get(
    "/users/me",
    {
      onRequest: [authenticate]
    },
    async (request, reply) => {
      const { userId } = request.user as {
        userId: number;
      };

      const user = await prisma.user.findUnique({
        where: {
          id: userId
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

      if (!user) {
        return reply.status(404).send({
          success: false,
          message: "Usuário não encontrado."
        });
      }

      return {
        success: true,
        user
      };
    }
  );
}