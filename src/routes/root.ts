import { FastifyPluginAsync } from "fastify";
import { config } from "../utils";
import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
  GlobalSignOutCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { User } from "../models/User";

const client = new CognitoIdentityProviderClient(config());

const root: FastifyPluginAsync = async (fastify, _): Promise<void> => {
  fastify.post("/auth/login", async function (request, reply) {
    const body: User = request.body as User;

    const command = new InitiateAuthCommand({
      AuthFlow: "USER_PASSWORD_AUTH",
      ClientId: process.env.CLIENT_ID!,
      AuthParameters: {
        USERNAME: body.username,
        PASSWORD: body.password,
      },
    });

    try {
      const response = await client.send(command);
      return {
        statusCode: 200,
        body: response,
      };
    } catch (error) {
      console.error("Login error:", error);
      return reply.status(400).send({ error: "Login failed" });
    }
  });

  fastify.post("/auth/logout", async function (request, reply) {
    const body = request.body as { accessToken: string };

    const command = new GlobalSignOutCommand({
      AccessToken: body.accessToken,
    });

    try {
      await client.send(command);
      return {
        statusCode: 200,
        body: JSON.stringify({ message: "User logged out successfully." }),
      };
    } catch (error) {
      console.error("Logout error:", error);
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Logout failed" }),
      };
    }
  });
};

export default root;
