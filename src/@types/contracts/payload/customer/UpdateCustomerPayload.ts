import { PayloadBase } from "../../PayloadBase";

export type UpdateCustomerPayload = PayloadBase & {
  kind: "UPDATE_CUSTOMER_PAYLOAD";
  id: string;
  name?: string;
  document?: string;
  email?: string;
  password?: string;
  balance?: string;
  pixKey?: string;
  city?: string;
  
};