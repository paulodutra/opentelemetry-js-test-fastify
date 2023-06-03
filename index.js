"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const tracing_1 = require("./tracing");
const { meter, metricAttrs } = (0, tracing_1.configure)();
const fastify_1 = __importDefault(require("fastify"));
const server = (0, fastify_1.default)();
async function main() {
    server.addHook('onError', (request, response, error) => {
        console.error(error);
    });
    server.get('/', async (request, response) => {
        response.code(200).send('OK');
    });
    server.listen({ port: 8080 }, (err, address) => {
        if (err) {
            console.error(err);
            process.exit(1);
        }
        console.log(`Server listening at ${address}`);
    });
}
(async () => await main())();
