import { PayloadBase } from "../../PayloadBase";

export type CreateCustomerPayload = PayloadBase & {
  kind: "CREATE_CUSTOMER_PAYLOAD";
  name: string;
  email: string;
  password: string;
  document: string;
  pixKey: string;
  city: string;
};