import { isValidRequest } from "@/@types/contracts/Request";
import { Request } from "@/@types/contracts/Request";
import { GatewayService } from "../service/GatewayService";
import type { CreateCustomerPayload } from "@/@types/contracts/payload/customer/CreateCustomerPayload";
import type { DeleteCustomerPayload } from "@/@types/contracts/payload/customer/DeleteCustomerPayload";
import type { GetCustomerPayload } from "@/@types/contracts/payload/customer/GetCustomerPayload";
import type { LoginPayload } from "@/@types/contracts/payload/customer/LoginPayload";
import type { UpdateCustomerPayload } from "@/@types/contracts/payload/customer/UpdateCustomerPayload";
import type { CreateTransactionPayload } from "@/@types/contracts/payload/transaction/CreateTransactionPayload";
import type { DeleteTransactionPayload } from "@/@types/contracts/payload/transaction/DeleteTransactionPayload";
import type { GetTransactionHistoryPayload } from "@/@types/contracts/payload/transaction/GetTransactionHistoryPayload";
import type { GetTransactionPayload } from "@/@types/contracts/payload/transaction/GetTransactionPayload";
import type { UpdateTransactionPayload } from "@/@types/contracts/payload/transaction/UpdateTransactionPayload";

export class GatewayController {
    constructor(
        private gatewayService: GatewayService
    ) {}

    public createCustomer(request: Request, socket: any): void {
        const validRequest = isValidRequest(request, socket);

        if (!validRequest) {
            return;
        }

        const payload = request.body.payload;

        const { name, document, email, password, pixKey, city } = payload as CreateCustomerPayload;

        this.gatewayService.createCustomer(name, document, email, password, pixKey, city, socket);
    }

    public loginCustomer(request: Request, socket: any): void {
        const validRequest = isValidRequest(request, socket);

        if (!validRequest) {
        return;
        }

        const payload = request.body.payload;

        const { email, password } = payload as LoginPayload;

        this.gatewayService.loginCustomer(email, password, socket);
    }    

    public getCustomer(request: Request, socket: any): void {
        const validRequest = isValidRequest(request, socket);

        if (!validRequest) {
            return;
        }

        if (!request.origin?.id) {
            return;
        }

        const payload = request.body.payload;

        const { id } = payload as GetCustomerPayload;

        this.gatewayService.getCustomer(id, request.origin?.id, socket);
    }

    public updateCustomer(request: Request, socket: any): void {
        const validRequest = isValidRequest(request, socket);

        if (!validRequest) {
            return;
        }

        if (!request.origin?.id) {
            return;
        }
        
        const payload = request.body.payload;

        const { id, name, document, email, password, pixKey, city } = payload as UpdateCustomerPayload;

        this.gatewayService.updateCustomer(id, name, document, email, password, pixKey, city, request.origin?.id, socket);
    }

    public deleteCustomer(request: Request, socket: any): void {
        const validRequest = isValidRequest(request, socket);

        if (!validRequest) {
            return;
        }

        if (!request.origin?.id) {
            return;
        }
        
        const payload = request.body.payload;

        const { id } = payload as DeleteCustomerPayload;

        this.gatewayService.deleteCustomer(id, request.origin?.id, socket);
    }

    public createTransaction(request: Request, socket: any): void {
        const validRequest = isValidRequest(request, socket);

        if (!validRequest) {
            return;
        }

        if (!request.origin?.id) {
            return;
        }
        
        const payload = request.body.payload;

        const { amount, pixKey, customerName, customerCity, customerId } = payload as CreateTransactionPayload;

        this.gatewayService.createTransaction(amount, pixKey, customerName, customerCity, customerId, request.origin?.id, socket);
    }

    public getTransaction(request: Request, socket: any): void {
        const validRequest = isValidRequest(request, socket);

        if (!validRequest) {
            return;
        }

        if (!request.origin?.id) {
            return;
        }
        
        const payload = request.body.payload;

        const { id, customerId } = payload as GetTransactionPayload;

        this.gatewayService.getTransaction(id, customerId, request.origin?.id, socket);
    }

    public getTransactionHistory(request: Request, socket: any): void {
        const validRequest = isValidRequest(request, socket);

        if (!validRequest) {
            return;
        }

        if (!request.origin?.id) {
            return;
        }
        
        const payload = request.body.payload;

        const { customerId } = payload as GetTransactionHistoryPayload;

        this.gatewayService.getTransactionHistory(customerId, request.origin?.id, socket);
    }   

    public updateTransaction(request: Request, socket: any): void {
        const validRequest = isValidRequest(request, socket);

        if (!validRequest) {
            return;
        }

        if (!request.origin?.id) {
            return;
        }
        
        const payload = request.body.payload;

        const { id, customerId, payerEmail } = payload as UpdateTransactionPayload;

        this.gatewayService.updateTransaction(id, customerId, payerEmail, request.origin?.id, socket);
    }   

    public deleteTransaction(request: Request, socket: any): void {
        const validRequest = isValidRequest(request, socket);

        if (!validRequest) {
            return;
        }

        if (!request.origin?.id) {
            return;
        }
        
        const payload = request.body.payload;

        const { id, customerId } = payload as DeleteTransactionPayload;

        this.gatewayService.deleteTransaction(id, customerId, request.origin?.id, socket);
    }
}