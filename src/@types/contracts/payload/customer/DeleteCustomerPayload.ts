import { PayloadBase } from "../../PayloadBase";

export type DeleteCustomerPayload = PayloadBase & {
    kind: "DELETE_CUSTOMER_PAYLOAD";
    id: string;
}