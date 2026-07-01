import { PayloadBase } from "../../PayloadBase";

export type GetCustomerPayload = PayloadBase & {
    kind: "GET_CUSTOMER_PAYLOAD";
    id: string;
}