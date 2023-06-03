process.env.OTEL_SERVICE_NAME="client"
process.env.OTEL_NODE_RESOURCE_DETECTORS="env,host"
process.env.OTEL_LOG_LEVEL="all"
import { NodeTracerProvider, SpanProcessor, BatchSpanProcessor, ConsoleSpanExporter, SimpleSpanProcessor } from '@opentelemetry/sdk-trace-node'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus'
import { registerInstrumentations } from '@opentelemetry/instrumentation'
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http'
import { FastifyInstrumentation } from '@opentelemetry/instrumentation-fastify'
import { Resource } from '@opentelemetry/resources'
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions'
import { ZipkinExporter } from '@opentelemetry/exporter-zipkin'
import { MeterProvider } from '@opentelemetry/sdk-metrics-base'
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node'
const api = require('@opentelemetry/api')
api.diag.setLogger(new api.DiagConsoleLogger(), api.DiagLogLevel.ALL);
const serviceName = 'api-service'
export const configure = () => {
    const attrs = {
        [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
        [SemanticResourceAttributes.SERVICE_VERSION]: '0.1.0',
        [SemanticResourceAttributes.CONTAINER_ID]: require('os').hostname()
    }
    const provider = new NodeTracerProvider({
        resource: new Resource(attrs),
    })
    const jaegerEndpoint = process.env.JAEGER_OTLP_ENDPOINT || 'localhost'
    const exporter = new OTLPTraceExporter({
        url: `http://localhost:4318/v1/traces`,
    })
    provider.addSpanProcessor(new BatchSpanProcessor(exporter))
    provider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()))
    provider.register()
    registerInstrumentations({
        instrumentations: [
            getNodeAutoInstrumentations(),
            // Fastify instrumentation expects HTTP layer to be instrumented
            new HttpInstrumentation(),
            new FastifyInstrumentation(),
        ],
    });
    const tracer = provider.getTracer(serviceName)
    const meterProvider = new MeterProvider({
        resource: new Resource(attrs)
    })
    const prometheusExporter = new PrometheusExporter({}, () => {
        const { endpoint, port } = PrometheusExporter.DEFAULT_OPTIONS
        console.log(
            `prometheus scrape endpoint http://localhost:${port}:${endpoint}`
        )
    })
    //@ts-ignore
    meterProvider.addMetricReader(prometheusExporter)
    const meter = meterProvider.getMeter(serviceName)
    console.log('aquii');
    return {
        meter,
        metricAttrs: attrs,
        tracer
    } 
}



