import { Injectable } from "@nestjs/common";
import {
  utilities,
  WinstonModuleOptions,
  WinstonModuleOptionsFactory,
} from "nest-winston";
import { format, transports } from "winston";
import { ElasticsearchTransport } from "winston-elasticsearch";
import * as apm from "elastic-apm-node";

export const LOG_LEVEL = {
  INFO: "info",
  ERROR: "error",
  WARN: "warn",
  DEBUG: "debug",
  VERBOSE: "verbose",
};

const apmAgent =
  process.env.ES_LOG_DISABLED !== "true"
    ? apm.start({
        serverUrl: process.env.ELASTIC_APM_SERVER_URL,
        secretToken: process.env.ELASTIC_APM_SECRET_TOKEN,
        serviceName: process.env.ELASTIC_APM_SERVER_NAME,
        usePathAsTransactionName: true,
        centralConfig: false,
        environment: process.env.ELASTIC_APM_ENV,
      })
    : null;
@Injectable()
export class WinstonLoggerConfigService implements WinstonModuleOptionsFactory {
  async createWinstonModuleOptions(): Promise<WinstonModuleOptions> {
    const transportStreams: any[] = [
      new transports.Console({
        format: format.combine(
          format.timestamp(),
          format.ms(),
          utilities.format.nestLike(process.env.APP_NAME || "nest", {
            prettyPrint: true,
            colors: true,
          })
        ),
      }),
    ];

    if (apmAgent) {
      // config elastic transport
      const esTransportOptions = {
        level: process.env.ES_LOG_LEVEL || LOG_LEVEL.INFO,
        indexPrefix: process.env.ES_LOG_PREFIX,
        indexSuffixPattern: "YYYY-MM-DD",
        clientOpts: {
          nodes: [process.env.ES_NODE],
          auth: {
            apiKey: process.env.ES_API_KEY,
          },
        },
        // Number of retries to connect to ES before giving up
        retryLimit: parseInt(process.env.ES_LOG_RETRY_LIMIT, 10) || 5,
        // Timeout for one health check (health checks will be retried forever).
        healthCheckTimeout: process.env.ES_LOG_HEALTH_CHECK_TIMEOUT || "30s",
        // Time span between bulk writes in ms. Default is 1000ms.
        flushInterval: parseInt(process.env.ES_LOG_FLUSH_INTERVAL, 10) || 1000,
        // Buffering of messages in case of unavailability of ES. The limit is the memory as all unwritten messages are kept in memory.
        buffering: Boolean(process.env.ES_LOG_BUFFERING),
        // Limit for the number of log messages in the buffer.
        bufferLimit: parseInt(process.env.ES_LOG_BUFFER_LIMIT, 10) || 1000,
      };

      transportStreams.push(
        new ElasticsearchTransport({
          apm: apmAgent,
          ...esTransportOptions,
        })
      );
    }

    return {
      level: LOG_LEVEL.INFO,
      transports: transportStreams,
    };
  }
}
