import { socket } from "@utils";

process.env.SOCKET_PORT && socket.start(Number(process.env.SOCKET_PORT));