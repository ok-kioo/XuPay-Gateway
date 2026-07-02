import { PayloadBase } from "../../PayloadBase";

export type LoginPayload = PayloadBase & {
  kind: "LOGIN_PAYLOAD";
  email: string;
  password: string;
};