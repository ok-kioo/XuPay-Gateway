import {
  createRequestSignature,
  normalizePath,
} from "@/@types/contracts/Request";
import type { Request, RequestHeaders } from "@/@types/contracts/Request";
import type { JsonValue } from "@/@types/contracts/JsonValue";
import { JsonCodec } from "./JsonCodec";
import type { JsonObject } from "./JsonCodec";
import type { CreateCustomerPayload } from "@/@types/contracts/payload/customer/CreateCustomerPayload";
import type { DeleteCustomerPayload } from "@/@types/contracts/payload/customer/DeleteCustomerPayload";
import type { GetCustomerPayload } from "@/@types/contracts/payload/customer/GetCustomerPayload";
import type { UpdateCustomerPayload } from "@/@types/contracts/payload/customer/UpdateCustomerPayload";
import type { CreateTransactionPayload } from "@/@types/contracts/payload/transaction/CreateTransactionPayload";
import type { DeleteTransactionPayload } from "@/@types/contracts/payload/transaction/DeleteTransactionPayload";
import type { GetTransactionHistoryPayload } from "@/@types/contracts/payload/transaction/GetTransactionHistoryPayload";
import type { GetTransactionPayload } from "@/@types/contracts/payload/transaction/GetTransactionPayload";
import type { UpdateTransactionPayload } from "@/@types/contracts/payload/transaction/UpdateTransactionPayload";
import { ServicePayload } from "@/@types/contracts/payload/ServicePayload";

type ParsedPayload = 
  | CreateCustomerPayload
  | DeleteCustomerPayload
  | GetCustomerPayload
  | UpdateCustomerPayload
  | CreateTransactionPayload
  | DeleteTransactionPayload
  | GetTransactionPayload
  | GetTransactionHistoryPayload
  | UpdateTransactionPayload
  | ServicePayload;

type SerializableRequest = {
  method: string;
  path: string;
  headers?: RequestHeaders;
  body: JsonObject;
  service?: string;
  secret?: string;
};

export class ResponseParser {
  public static deserialize(rawRequest: string): Request {
    const request = rawRequest.trim();

    if (!this.isHttpRequest(request)) {
      throw new Error("Protocolo inválido. Esperado HTTP/1.1 ou HTTP/1.0");
    }

    return this.deserializeHttpRequest(request);
  }

  public static serialize(request: SerializableRequest): string {
    const method = request.method.toUpperCase();
    const path = normalizePath(request.path);
    const rawBody = JsonCodec.stringify(request.body);
    const headers: RequestHeaders = {
      host: "xupay-gateway",
      "content-type": "application/json",
      "content-length": Buffer.byteLength(rawBody).toString(),
      ...this.normalizeHeaders(request.headers || {}),
    };

    if (request.service && request.secret) {
      headers["x-xupay-service"] = request.service;
      headers["x-xupay-signature"] = createRequestSignature(
        method,
        path,
        rawBody,
        request.secret
      );
    }

    const headerLines = Object.entries(headers).map(
      ([key, value]) => `${this.toHttpHeaderName(key)}: ${value}`
    );

    return `${method} /${path} HTTP/1.1\r\n${headerLines.join(
      "\r\n"
    )}\r\n\r\n${rawBody}`;
  }

  public static serializeResponse(statusCode: number, body: JsonObject): string {
    const statusText = statusCode >= 400 ? "Error" : "OK";
    const rawBody = JsonCodec.stringify(body);

    return `HTTP/1.1 ${statusCode} ${statusText}\r\nContent-Type: application/json\r\nContent-Length: ${Buffer.byteLength(
      rawBody
    )}\r\n\r\n${rawBody}`;
  }

  private static isHttpRequest(request: string): boolean {
    return /^[A-Z]+ \S+ HTTP\/1\.[01]/.test(request);
  }

  private static deserializeHttpRequest(rawRequest: string): Request {
    const separator = rawRequest.indexOf("\r\n\r\n");

    if (separator === -1) {
      throw new Error("Requisição HTTP sem separador entre headers e body");
    }

    const headerPart = rawRequest.slice(0, separator);
    const rawBody = rawRequest.slice(separator + 4);
    const [requestLine, ...headerLines] = headerPart.split("\r\n");
    const [method, rawPath] = requestLine.split(" ");
    const headers = this.parseHeaders(headerLines);
    const parsedBody = this.parseJsonObject(rawBody);
    const path = normalizePath(rawPath);
    const body = this.parseMessageBody(path, parsedBody);

    return {
      method: method.toUpperCase(),
      path: normalizePath(rawPath),
      headers,
      body,
      rawBody,
    };
  }

  private static parseMessageBody(
    path: string,
    body: JsonObject
  ): Request["body"] {
    return {
      payload: this.parsePayloadByPath(path, body)
    };
  }

  private static parsePayloadByPath(
    path: string,
    body: JsonObject
  ): ParsedPayload {
    const payload = this.extractPayloadObject(body);

    if (path === "customer") {
      return this.parseGetCustomerPayload(payload);
    }

    if (path === "customer/create") {
      return this.parseCreateCustomerPayload(payload);
    }

    if (path === "customer/update") {
      return this.parseUpdateCustomerPayload(payload);
    }

    if (path === "customer/delete") {
      return this.parseDeleteCustomerPayload(payload);
    }

    if (path === "transaction") {
      return this.parseGetTransactionPayload(payload);
    }

    if (path === "transaction/history") {
      return this.parseGetTransactionHistoryPayload(payload);
    }

    if (path === "transaction/create") {
      return this.parseCreateTransactionPayload(payload);
    }

    if (path === "transaction/update") {
      return this.parseUpdateTransactionPayload(payload);
    }

    if (path === "transaction/delete") {
      return this.parseDeleteTransactionPayload(payload);
    }

    if (path === "redirect") {
      return this.parseServicePayload(body);
    }

    throw new Error(`Caminho inválido: ${path}`);
    
  }

  private static parseServicePayload(body: JsonObject): ServicePayload {
    return {
      kind: "SERVICE_PAYLOAD",
      servicePayload: body.servicePayload,
    };
  }

  private static parseGetCustomerPayload(
    payload: JsonObject
  ): GetCustomerPayload {
    return {
      kind: "GET_CUSTOMER_PAYLOAD",
      id: this.requiredString(payload.id, "id"),
    };
  }

  private static parseCreateCustomerPayload(
    payload: JsonObject
  ): CreateCustomerPayload {
    return {
      kind: "CREATE_CUSTOMER_PAYLOAD",
      name: this.requiredString(payload.name, "name"),
      document: this.requiredString(payload.document, "document"),
      pixKey: this.requiredString(payload.pixKey, "pixKey"),
      city: this.requiredString(payload.city, "city"),
    };
  }

  private static parseUpdateCustomerPayload(
    payload: JsonObject
  ): UpdateCustomerPayload {
    return {
      kind: "UPDATE_CUSTOMER_PAYLOAD",
      id: this.requiredString(payload.id, "id"),
      name: this.optionalString(payload.name),
      document: this.optionalString(payload.document),
      balance: this.optionalString(payload.balance),
      pixKey: this.optionalString(payload.pixKey),
      city: this.optionalString(payload.city),
    };
  }

  private static parseDeleteCustomerPayload(
    payload: JsonObject
  ): DeleteCustomerPayload {
    return {
      kind: "DELETE_CUSTOMER_PAYLOAD",
      id: this.requiredString(payload.id, "id"),
    };
  }

  private static parseGetTransactionPayload(
    payload: JsonObject
  ): GetTransactionPayload {
    return {
      kind: "GET_TRANSACTION_PAYLOAD",
      id: this.requiredString(payload.id, "id"),
      customerId: this.requiredString(payload.customerId, "customerId"),
    };
  }

  private static parseGetTransactionHistoryPayload(
    payload: JsonObject
  ): GetTransactionHistoryPayload {
    return {
      kind: "GET_TRANSACTION_HISTORY_PAYLOAD",
      customerId: this.requiredString(payload.customerId, "customerId"),
    };
  }

  private static parseCreateTransactionPayload(
    payload: JsonObject
  ): CreateTransactionPayload {
    return {
      kind: "CREATE_TRANSACTION_PAYLOAD",
      amount: this.requiredString(payload.amount, "amount"),
      pixKey: this.requiredString(payload.pixKey, "pixKey"),
      customerName: this.requiredString(payload.customerName, "customerName"),
      customerCity: this.requiredString(payload.customerCity, "customerCity"),
      customerId: this.requiredString(payload.customerId, "customerId"),
    };
  }

  private static parseUpdateTransactionPayload(
    payload: JsonObject
  ): UpdateTransactionPayload {
    return {
      kind: "UPDATE_TRANSACTION_PAYLOAD",
      id: this.requiredString(payload.id, "id"),
      customerId: this.requiredString(payload.customerId, "customerId"),
      payerEmail: this.requiredString(payload.payerEmail, "payerEmail"),
    };
  }

  private static parseDeleteTransactionPayload(
    payload: JsonObject
  ): DeleteTransactionPayload {
    return {
      kind: "DELETE_TRANSACTION_PAYLOAD",
      customerId: this.requiredString(payload.customerId, "customerId"),
      id: this.requiredString(payload.id, "id"),
    };
  }

  private static optionalString(value: JsonValue | undefined): string | undefined {
    return typeof value === "string" ? value : undefined;
  }

  private static requiredString(
    value: JsonValue | undefined,
    fieldName: string
  ): string {
    if (typeof value !== "string" || !value.trim()) {
      throw new Error(`Payload inválido. Campo ${fieldName} ausente.`);
    }

    return value.trim();
  }

  private static extractPayloadObject(body: JsonObject): JsonObject {
    const candidate = body.payload;

    if (JsonCodec.isJsonObject(candidate)) {
      return candidate;
    }

    return body;
  }

  private static parseHeaders(headerLines: string[]): RequestHeaders {
    const headers: RequestHeaders = {};

    for (const line of headerLines) {
      const separatorIndex = line.indexOf(":");

      if (separatorIndex === -1) {
        continue;
      }

      const key = line.slice(0, separatorIndex).trim().toLowerCase();
      const value = line.slice(separatorIndex + 1).trim();

      if (key) {
        headers[key] = value;
      }
    }

    return headers;
  }

  private static parseJsonObject(rawBody: string): JsonObject {
    return JsonCodec.parseObject(rawBody);
  }

  private static normalizeHeaders(headers: RequestHeaders): RequestHeaders {
    const normalizedHeaders: RequestHeaders = {};

    for (const [key, value] of Object.entries(headers)) {
      normalizedHeaders[key.toLowerCase()] = value;
    }

    return normalizedHeaders;
  }

  private static toHttpHeaderName(header: string): string {
    return header
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join("-");
  }
}
