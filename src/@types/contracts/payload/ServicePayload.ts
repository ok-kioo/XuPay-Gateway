import { JsonValue } from "../JsonValue";
import { PayloadBase } from "../PayloadBase";

export type ServicePayload = PayloadBase & {
  servicePayload: JsonValue;
};