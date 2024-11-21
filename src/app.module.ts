import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { MultiElasticsearchModule } from "./modules/elasticsearch/multi-elasticsearch.module";

@Module({
  imports: [
    MultiElasticsearchModule.register([
      {
        name: "cluster1",
        options: {
          node: "https://56fbf5b2c6974ef99db60728086cc223.us-central1.gcp.cloud.es.io:443",
          auth: {
            apiKey: `QTFEV1RKTUJ5emxHaXNGN1ZLUzg6V3I5cDhNeGVRdkt3bHQ1MG5aenZSZw==`,
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
  providers: [AppService],
})
export class AppModule {}
