import { ServiceResponse } from "@/@types/clients/ServiceResponse";
import { JsonValue } from "@/@types/contracts/JsonValue";
import { SocketClient } from "@/infra/client/SocketClient";
import { JsonCodec } from "@/infra/parser/JsonCodec";
import { ResponseParser } from "@/infra/parser/ResponseParser";
import { ServicePayload } from "@/@types/contracts/payload/ServicePayload";

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
    const parsed = ResponseParser.deserializeResponse<ServicePayload>(rawResponse);

    if (!parsed) {
      throw new Error("Resposta inválida do serviço alvo");
    }

    const payload = parsed.body as ServicePayload | '';

    return {
      servicePayload: payload as JsonValue
    };

  }

  private buildSendRequest(event: string, apiPayload: JsonValue): string {
        return ResponseParser.serialize({
          method: "POST",
          path: "redirect",
          service: process.env.XUPAY_SERVICE_NAME || "xupay-gateway",
          secret: process.env.XUPAY_SERVICE_SECRET || "",
          body: {
            event,
            apiPayload: JsonCodec.stringify(apiPayload)
          },
        });
    } 
  }