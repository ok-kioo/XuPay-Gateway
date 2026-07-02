import net from 'net';
import { Routes } from './routes/Routes';
import { ResponseParser } from './infra/parser/ResponseParser';
import { ErrorHandler } from './infra/middleware/Error';

const routes = new Routes();

function handleOptionsRequest(socket: net.Socket): void {
  socket.write(
    "HTTP/1.1 204 No Content\r\n" +
      "Access-Control-Allow-Origin: *\r\n" +
      "Access-Control-Allow-Methods: GET,POST,PUT,DELETE,OPTIONS\r\n" +
      "Access-Control-Allow-Headers: Content-Type, x-xupay-token-api\r\n" +
      "\r\n"
  );

  socket.end();
}

const server = net.createServer((socket: net.Socket) => {
    console.log('Cliente conectado');

    socket.on('data', (data: Buffer) => {
        try{
            const rawRequest = data.toString();

            console.log("\n--- requisição bruta recebida");
            console.log(rawRequest);
            console.log("----\n");

            if (rawRequest.startsWith("OPTIONS")) {
                return handleOptionsRequest(socket);
            }

            const request = ResponseParser.deserialize(rawRequest);

            if (!request) {
                throw new Error("Requisição mal formatada " + rawRequest);
            }

            console.log("---- requisição processada");
            console.log(JSON.stringify(request, null, 2));
            console.log("----\n");

            routes.handle(request, socket);
            
        } catch (error) {
            return ErrorHandler.handle("Erro ao processar requisição", socket);
        }
    });

    socket.on('end', () => {
        console.log('Cliente desconectado');
    });
});

server.listen(2000, () => {
    console.log('Servidor de processamento rodando na porta 2000');
});