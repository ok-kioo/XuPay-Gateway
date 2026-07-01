import { CreateCustomerPayload } from "./payload/customer/CreateCustomerPayload";
import { DeleteTransactionPayload } from "@/@types/contracts/payload/transaction/DeleteTransactionPayload";
import { CreateTransactionPayload } from "@/@types/contracts/payload/transaction/CreateTransactionPayload";
import { GetTransactionPayload } from "@/@types/contracts/payload/transaction/GetTransactionPayload";
import { UpdateCustomerPayload } from "@/@types/contracts/payload/customer/UpdateCustomerPayload";
import { DeleteCustomerPayload } from "./payload/customer/DeleteCustomerPayload";
import { GetCustomerPayload } from "./payload/customer/GetCustomerPayload";
import { GetTransactionHistoryPayload } from "./payload/transaction/GetTransactionHistoryPayload";
import { UpdateTransactionPayload } from "./payload/transaction/UpdateTransactionPayload";
import { ServicePayload } from "./payload/ServicePayload";


export type Payload = 
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

export type MessageBody = {
    payload: Payload;
};