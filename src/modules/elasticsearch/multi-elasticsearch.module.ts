import { Module, DynamicModule } from "@nestjs/common";
import { Client } from "@elastic/elasticsearch";
import { ElasticsearchController } from "./elasticsearch.controller";
import { ElasticsearchService } from "./elasticsearch.service";

@Module({})
export class MultiElasticsearchModule {
  static register(
    clusters: Array<{ name: string; options: any }>
  ): DynamicModule {
    const clusterProviders = clusters.map((cluster) => ({
      provide: `ES_CLIENT_${cluster.name.toUpperCase()}`,
      useFactory: () => new Client(cluster.options), // Tạo Elasticsearch client
    }));

    return {
      module: MultiElasticsearchModule,
      controllers: [ElasticsearchController], // Add the controller here
      providers: [
        ...clusterProviders,
        ElasticsearchService, // Add the service here
      ],
      exports: [...clusterProviders, ElasticsearchService],
    };
  }
}
