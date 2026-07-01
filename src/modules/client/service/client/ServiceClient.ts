import { ServiceResponse } from "@/@types/clients/ServiceResponse";
import { JsonValue } from "@/@types/contracts/JsonValue";
import { SocketClient } from "@/infra/client/SocketClient";
import { ResponseParser } from "@/infra/parser/ResponseParser";

export class ServiceClient {
  constructor(
    private readonly socketClient: SocketClient,
    private readonly serviceHost: string,
    private readonly servicePort: number
  ) {}

  public async send(event: string, apiPayload: JsonValue): Promise<ServiceResponse> {
    const request = this.buildSendRequest(event, apiPayload);

    const rawResponse = await this.socketClient.send(
      this.serviceHost,
      this.servicePort,
      request
    );

    const parsed = ResponseParser.deserialize(rawResponse);

    if (!parsed) {
      throw new Error("Resposta inválida do serviço alvo");
    }

    const payload = parsed.body.payload;

    if (payload.kind !== "SERVICE_PAYLOAD") {
      throw new Error("Payload inválido retornado pelo serviço alvo");
    }

    return {
      servicePayload: payload.servicePayload
    };

  }

  private buildSendRequest(event: string, apiPayload: JsonValue): string {
        return ResponseParser.serialize({
          method: "POST",
          path: "redirect",
          service: process.env.XUPAY_SERVICE_NAME || "xupay-gateway",
          secret: process.env.XUPAY_SERVICE_SECRET,
          body: {
            event,
            apiPayload
          },
        });
    } 
  }