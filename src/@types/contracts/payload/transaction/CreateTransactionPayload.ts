import { PayloadBase } from "../../PayloadBase";

export type CreateTransactionPayload = PayloadBase & {
  kind: "CREATE_TRANSACTION_PAYLOAD";
  amount: string;
  pixKey: string;
  customerName: string;
  customerCity: string;
  customerId: string;
};