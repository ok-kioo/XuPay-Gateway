import { JsonValue } from "@/@types/contracts/JsonValue";
import { ServiceClient } from "./client/ServiceClient";
import { SocketClient } from "@/infra/client/SocketClient";
import { ErrorHandler } from "@/infra/middleware/Error";
import { ResponseParser } from "@/infra/parser/ResponseParser";

enum AssyncEvent {
  CREATE_TRANSACTION,
  UPDATE_TRANSACTION,
  DELETE_TRANSACTION,
  GET_TRANSACTION,
  GET_TRANSACTION_HISTORY,
  CREATE_CUSTOMER,
  DELETE_CUSTOMER,
  GET_CUSTOMER,
  UPDATE_CUSTOMER
}

export class GatewayService {
    private serviceClient: ServiceClient;

    constructor() {
        this.serviceClient = new ServiceClient( new SocketClient(), 
            process.env.SERVICE_HOST || " ", 
            parseInt(process.env.SERVICE_PORT || " ")
        );
    }

    public async createCustomer(name: string, document: string, pixKey: string, city: string, socket: any): Promise<void> {
        if (!name || !document || !pixKey || !city) {
            return ErrorHandler.handle("Dados do cliente incompletos", socket);
        }

        

        await this.redirectToService(AssyncEvent.CREATE_CUSTOMER.toString(), { name, document, pixKey, city }, socket);
    }

    public async getCustomer(customerId: string, tokenId:string, socket: any): Promise<void> {
        if (!customerId || !tokenId) {
            return ErrorHandler.handle("Dados do cliente incompletos", socket);
        }

        if (customerId !== tokenId) {
            return ErrorHandler.handle("ID do cliente não corresponde ao token", socket);
        }

        await this.redirectToService(AssyncEvent.GET_CUSTOMER.toString(), { customerId }, socket);
    }

    public async updateCustomer(customerId:string, name: string|undefined, document: string|undefined, pixKey: string|undefined, city: string|undefined, tokenId:string, socket: any): Promise<void> {
        if (!customerId || !tokenId) {
            return ErrorHandler.handle("Dados do cliente incompletos", socket);
        }

        if (customerId !== tokenId) {
            return ErrorHandler.handle("ID do cliente não corresponde ao token", socket);
        }

        const dataToUpdate: Record<string, string> = {};

        if (name) dataToUpdate.name = name;
        if (document) dataToUpdate.document = document;
        if (pixKey) dataToUpdate.pixKey = pixKey;
        if (city) dataToUpdate.city = city;
        
        await this.redirectToService(AssyncEvent.UPDATE_CUSTOMER.toString(), { customerId, dataToUpdate }, socket);
    }

    public async deleteCustomer(customerId: string, tokenId: string, socket: any): Promise<void> {
        if (!customerId || !tokenId) {
            return ErrorHandler.handle("Dados do cliente incompletos", socket);
        }

        if (customerId !== tokenId) {
            return ErrorHandler.handle("ID do cliente não corresponde ao token", socket);
        }

        await this.redirectToService(AssyncEvent.DELETE_CUSTOMER.toString(), { customerId }, socket);
    }

    public async createTransaction(amount: string, pixKey: string, customerName: string, customerCity: string, customerId: string, tokenId: string, socket: any): Promise<void> {
        if (!amount || !pixKey || !customerName || !customerCity || !customerId || !tokenId) {
            return ErrorHandler.handle("Dados da transação incompletos", socket);
        }

        if (customerId !== tokenId) {
            return ErrorHandler.handle("ID do cliente não corresponde ao token", socket);
        }

        await this.redirectToService(AssyncEvent.CREATE_TRANSACTION.toString(), { amount, pixKey, customerName, customerCity, customerId }, socket);
    }

    public async getTransaction(transactionId: string, customerId: string, tokenId: string, socket: any): Promise<void> {
        if (!customerId || !tokenId || !transactionId) {
            return ErrorHandler.handle("Dados da transação incompletos", socket);
        }

        if (customerId !== tokenId) {
            return ErrorHandler.handle("ID do cliente não corresponde ao token", socket);
        }

        await this.redirectToService(AssyncEvent.GET_TRANSACTION.toString(), { transactionId, customerId }, socket);
    }

    public async getTransactionHistory(customerId: string, tokenId: string, socket: any): Promise<void> {
        if (!customerId || !tokenId) {
            return ErrorHandler.handle("Dados do cliente incompletos", socket);
        }

        if (customerId !== tokenId) {
            return ErrorHandler.handle("ID do cliente não corresponde ao token", socket);
        }

        await this.redirectToService(AssyncEvent.GET_TRANSACTION_HISTORY.toString(), { customerId }, socket);
    }

    public async updateTransaction(id: string, customerId: string, payerEmail: string, tokenId: string, socket: any): Promise<void> {
        if (!customerId || !tokenId || !id || !payerEmail) {
            return ErrorHandler.handle("Dados da transação incompletos", socket);
        }

        if (customerId !== tokenId) {
            return ErrorHandler.handle("ID do cliente não corresponde ao token", socket);
        }

        await this.redirectToService(AssyncEvent.UPDATE_TRANSACTION.toString(), { id, customerId, payerEmail }, socket);
    }

    public async deleteTransaction(transactionId: string, customerId: string, tokenId: string, socket: any): Promise<void> {
        if (!transactionId || !customerId || !tokenId) {
            return ErrorHandler.handle("Dados da transação incompletos", socket);
        }

        if (customerId !== tokenId) {
            return ErrorHandler.handle("ID do cliente não corresponde ao token", socket);
        }

        await this.redirectToService(AssyncEvent.DELETE_TRANSACTION.toString(), { transactionId, customerId }, socket);
    }

    private async redirectToService(event:string, apiPayload:JsonValue, socket: any): Promise<void> {
        let serviceResponse = null; 

        try{
            serviceResponse = await this.serviceClient.send(event, apiPayload);
        } catch (error) {
            return ErrorHandler.handle("Falha ao enviar mensagem", socket);
        }

        if(serviceResponse == null){
            return ErrorHandler.handle("Falha ao receber resposta", socket);
        }

        const response = ResponseParser.serializeResponse(200, (serviceResponse.servicePayload ?? {}) as Record<string, any>);

        socket.write(response);
        socket.end();
    }

    
}