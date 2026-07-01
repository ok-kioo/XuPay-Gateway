import crypto from "crypto";
import { Socket } from "net";
import { MessageBody } from "./MessageBody";
import { ErrorHandler } from "../../infra/middleware/Error";
import { decryptApiToken } from "@/infra/provider/encrypt/encrypt";

export type RequestHeaders = Record<string, string>;

export type RequestOrigin = {
  service: string;
  ip?: string;
  id?: string;
};

export type Request = {
  method: string;
  path: string;
  headers: RequestHeaders;
  body: MessageBody;
  rawBody: string;
  origin?: RequestOrigin;
};

export function isValidRequest(request: Request, socket: Socket): Request | void {
  const trustedService = authenticateService(request);

  if (!trustedService) {
    return ErrorHandler.handle("Serviço de origem não autorizado", socket);
  }
  
  request.origin = {
    service: trustedService,
    ip: socket.remoteAddress,
    id: undefined
  };

  if(request.path !== "customer/create"){

    const tokenApiPayload = authenticateTokenApi(request);
  
    if (!tokenApiPayload) {
      return ErrorHandler.handle("Token de API inválido ou ausente", socket);
    }
  
    request.origin.id = tokenApiPayload;
  }

  return request;
}

function authenticateTokenApi(request: Request): string | null {
  const token = request.headers["x-xupay-token-api"];

  if (!token) {
    return null;
  }

  try {
    const decryptedToken = decryptApiToken(token);
    return decryptedToken;
  } catch (error) {
    console.error("Erro ao descriptografar o token de API:", error);
    return null;
  }
}

function authenticateService(request: Request): string | null {
  const service = request.headers["x-xupay-service"];
  const signature = request.headers["x-xupay-signature"];
  const serviceKeys = getTrustedServiceKeys();
  const secret = service ? serviceKeys[service] : undefined;

  if (!service || !signature || !secret) {
    return null;
  }

  const expectedSignature = createRequestSignature(
    request.method,
    request.path,
    request.rawBody,
    secret
  );

  console.log(`Authenticating service: ${service}`);
  console.log(`Received signature: ${signature}`);
  console.log(`Expected signature: ${expectedSignature}`);

  return timingSafeEquals(signature, expectedSignature) ? service : null;
}

function getTrustedServiceKeys(): Record<string, string> {
  const rawConfig = process.env.XUPAY_SERVICE_KEYS || "";
  const services: Record<string, string> = {};

  for (const entry of rawConfig.split(",")) {
    const separatorIndex = entry.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const service = entry.slice(0, separatorIndex).trim();
    const secret = entry.slice(separatorIndex + 1).trim();

    if (service && secret) {
      services[service] = secret;
    }
  }

  return services;
}

export function createRequestSignature(
  method: string,
  path: string,
  rawBody: string,
  secret: string
): string {
  return crypto
    .createHmac("sha256", secret)
    .update(`${method.toUpperCase()}\n${normalizePath(path)}\n${rawBody}`)
    .digest("hex");
}

export function normalizePath(path: string): string {
  const trimmedPath = path.trim();
  return trimmedPath.startsWith("/") ? trimmedPath.slice(1) : trimmedPath;
}

function timingSafeEquals(received: string, expected: string): boolean {
  const receivedBuffer = Buffer.from(received, "hex");
  const expectedBuffer = Buffer.from(expected, "hex");

  if (receivedBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(receivedBuffer, expectedBuffer);
}
