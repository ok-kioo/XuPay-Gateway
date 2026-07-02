import { Socket } from "net";
import { JsonCodec } from "../parser/JsonCodec";

const CORS_HEADERS =
  "Access-Control-Allow-Origin: *\r\n" +
  "Access-Control-Allow-Methods: GET,POST,PUT,DELETE,OPTIONS\r\n" +
  "Access-Control-Allow-Headers: Content-Type, x-xupay-token-api\r\n";


export class ErrorHandler {
    
    public static handle(err: string, socket: Socket): void {
        const body = JsonCodec.stringify({ error: err });
        socket.write(
            `HTTP/1.1 400 Error\r\n${CORS_HEADERS}Content-Type: application/json\r\nContent-Length: ${Buffer.byteLength(body)}\r\n\r\n${body}`
            );
        socket.end();
        return;
    }
}
