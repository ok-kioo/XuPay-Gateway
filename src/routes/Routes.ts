import { Socket } from 'net';
import { Request } from '@/@types/contracts/Request';
import { GatewayController } from '@/modules/client/controller/GatewayController';
import { GatewayService } from '@/modules/client/service/GatewayService';
import { ErrorHandler } from '@/infra/middleware/Error';

export class Routes {
    private gatewayController: GatewayController;
    private gatewayService: GatewayService;

    constructor() {
        this.gatewayService = new GatewayService();
        this.gatewayController = new GatewayController(this.gatewayService);
    }

    public handle(request:Request, socket:Socket) : void  {
        console.log(`recebido: ${request.method} /${request.path}`);
        if (request.method === 'GET' && request.path === 'customer') {
            this.gatewayController.getCustomer(request, socket);
        } 

        else if (request.method === "POST" && request.path === "customer/login") {
            console.log("rota encontrada: loginCustomer");
            this.gatewayController.loginCustomer(request, socket);
        }     

        else if(request.method === 'POST' && request.path === 'customer/create') {
            console.log("rota encontrada: createCustomer");
            this.gatewayController.createCustomer(request, socket);
        }

        else if(request.method === 'PUT' && request.path === 'customer/update') {
            this.gatewayController.updateCustomer(request, socket);
        }

        else if(request.method === 'DELETE' && request.path === 'customer/delete') {
            this.gatewayController.deleteCustomer(request, socket);
        }

        else if(request.method === 'GET' && request.path === 'transaction') {
            this.gatewayController.getTransaction(request, socket);
        }

        else if(request.method === 'GET' && request.path === 'transaction/history') {
            this.gatewayController.getTransactionHistory(request, socket);
        }

        else if(request.method === 'POST' && request.path === 'transaction/create') {
            this.gatewayController.createTransaction(request, socket);
        }

        else if(request.method === 'PUT' && request.path === 'transaction/update') {
            this.gatewayController.updateTransaction(request, socket);
        }

        else if(request.method === 'DELETE' && request.path === 'transaction/delete') {
            this.gatewayController.deleteTransaction(request, socket);
        }

        else {
            console.log(`[Gateway][Routes] Rota não encontrada: ${request.method} /${request.path}`);
            return ErrorHandler.handle("Rota não encontrada", socket);
        }
        
    }
}