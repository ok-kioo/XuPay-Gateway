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

const PUBLIC_ROUTES = ["customer/create", "customer/login"];

export function isValidRequest(request: Request, socket: Socket): Request | void {
  request.origin = {
    service: "FRONTEND",
    ip: socket.remoteAddress,
    id: undefined,
  };

  if (PUBLIC_ROUTES.includes(request.path)) {
    return request;
  }

  const tokenApiPayload = authenticateTokenApi(request);

  if (!tokenApiPayload) {
    return ErrorHandler.handle("Token de API inválido ou ausente", socket);
  }

  request.origin.id = tokenApiPayload;

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

export function normalizePath(path: string): string {
  const trimmedPath = path.trim();
  return trimmedPath.startsWith("/") ? trimmedPath.slice(1) : trimmedPath;
}