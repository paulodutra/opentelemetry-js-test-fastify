## OpenTelemetry Test Fastify

1. To running application, first you need to create the Jaeger container using the docker tools: 
```
docker run -d --name jaeger \
  -e COLLECTOR_ZIPKIN_HOST_PORT=:9411 \
  -e COLLECTOR_OTLP_ENABLED=true \
  -p 6831:6831/udp \
  -p 6832:6832/udp \
  -p 5778:5778 \
  -p 16686:16686 \
  -p 4317:4317 \
  -p 4318:4318 \
  -p 14250:14250 \
  -p 14268:14268 \
  -p 14269:14269 \
  -p 9411:9411 \
  jaegertracing/all-in-one:1.45

```
2. Go to http://localhost:16686/search to use Jaeger

3. You need the prometheus, you can do the tutorial of this repository: https://github.com/paulodutra/opentelemetry-test-prometheus-2.44-linux. After go to http://localhost:9090/

4. After you did the third step, install dependencies of the project:

```
npm i
```
5. Now it's need build the app, for it, using the terminal and execute the command bellow:
```
npm run build
```

6. After you did all steps, you need run the app, for it, using the terminal and execute the command bellow:
```
npm start
```

7. Then visit localhost:8080/
