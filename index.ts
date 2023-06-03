import { configure } from './tracing'
const { meter, metricAttrs } = configure()
import fastify from 'fastify'
const server = fastify()


async function main() {
    server.addHook('onError', (request, response, error) => {
       console.error(error)
    }) 

    server.get('/', async (request, response) => {
        response.code(200).send('OK');
    })
    
    server.listen({ port: 8080 }, (err, address) => {
        if (err) {
            console.error(err)
            process.exit(1)
        }
        console.log(`Server listening at ${address}`)
    })
}

(async() => await main())()
