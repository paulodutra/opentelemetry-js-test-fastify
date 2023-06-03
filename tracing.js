"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configure = void 0;
process.env.OTEL_SERVICE_NAME = "client";
process.env.OTEL_NODE_RESOURCE_DETECTORS = "env,host";
process.env.OTEL_LOG_LEVEL = "all";
const sdk_trace_node_1 = require("@opentelemetry/sdk-trace-node");
const exporter_trace_otlp_http_1 = require("@opentelemetry/exporter-trace-otlp-http");
const exporter_prometheus_1 = require("@opentelemetry/exporter-prometheus");
const instrumentation_1 = require("@opentelemetry/instrumentation");
const instrumentation_http_1 = require("@opentelemetry/instrumentation-http");
const instrumentation_fastify_1 = require("@opentelemetry/instrumentation-fastify");
const resources_1 = require("@opentelemetry/resources");
const semantic_conventions_1 = require("@opentelemetry/semantic-conventions");
const sdk_metrics_base_1 = require("@opentelemetry/sdk-metrics-base");
const auto_instrumentations_node_1 = require("@opentelemetry/auto-instrumentations-node");
const api = require('@opentelemetry/api');
api.diag.setLogger(new api.DiagConsoleLogger(), api.DiagLogLevel.ALL);
const serviceName = 'api-service';
const configure = () => {
    const attrs = {
        [semantic_conventions_1.SemanticResourceAttributes.SERVICE_NAME]: serviceName,
        [semantic_conventions_1.SemanticResourceAttributes.SERVICE_VERSION]: '0.1.0',
        [semantic_conventions_1.SemanticResourceAttributes.CONTAINER_ID]: require('os').hostname()
    };
    const provider = new sdk_trace_node_1.NodeTracerProvider({
        resource: new resources_1.Resource(attrs),
    });
    const jaegerEndpoint = process.env.JAEGER_OTLP_ENDPOINT || 'localhost';
    const exporter = new exporter_trace_otlp_http_1.OTLPTraceExporter({
        url: `http://localhost:4318/v1/traces`,
    });
    provider.addSpanProcessor(new sdk_trace_node_1.BatchSpanProcessor(exporter));
    provider.addSpanProcessor(new sdk_trace_node_1.SimpleSpanProcessor(new sdk_trace_node_1.ConsoleSpanExporter()));
    provider.register();
    (0, instrumentation_1.registerInstrumentations)({
        instrumentations: [
            (0, auto_instrumentations_node_1.getNodeAutoInstrumentations)(),
            // Fastify instrumentation expects HTTP layer to be instrumented
            new instrumentation_http_1.HttpInstrumentation(),
            new instrumentation_fastify_1.FastifyInstrumentation(),
        ],
    });
    const tracer = provider.getTracer(serviceName);
    const meterProvider = new sdk_metrics_base_1.MeterProvider({
        resource: new resources_1.Resource(attrs)
    });
    const prometheusExporter = new exporter_prometheus_1.PrometheusExporter({}, () => {
        const { endpoint, port } = exporter_prometheus_1.PrometheusExporter.DEFAULT_OPTIONS;
        console.log(`prometheus scrape endpoint http://localhost:${port}:${endpoint}`);
    });
    //@ts-ignore
    meterProvider.addMetricReader(prometheusExporter);
    const meter = meterProvider.getMeter(serviceName);
    console.log('aquii');
    return {
        meter,
        metricAttrs: attrs,
        tracer
    };
};
exports.configure = configure;
