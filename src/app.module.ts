import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { MultiElasticsearchModule } from "./modules/elasticsearch/multi-elasticsearch.module";
import "dotenv/config";
import { WinstonModule } from "nest-winston";
import { WinstonLoggerConfigService } from "./config/logger.config";
import { APP_FILTER, APP_INTERCEPTOR } from "@nestjs/core";
import { LoggingInterceptor } from "./intercepters/logging.interceptor";
import { AllExceptionsFilter } from "./filters/all-exception.filter";

@Module({
  imports: [
    WinstonModule.forRootAsync({
      useClass: WinstonLoggerConfigService,
    }),
    MultiElasticsearchModule.register([
      {
        name: "cluster1",
        options: {
          node: process.env.ES_NODE,
          auth: {
            apiKey: process.env.ES_API_KEY,
          },
        },
      },
      {
        name: "cluster2",
        options: {
          node: "http://remote-es-cluster:9200",
          auth: {
            username: "remote-user",
            password: "remote-password",
          },
        },
      },
    ]),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {}
