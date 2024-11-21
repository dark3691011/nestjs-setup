import { Injectable, Inject } from "@nestjs/common";
import { Client } from "@elastic/elasticsearch";

@Injectable()
export class ElasticsearchService {
  constructor(
    @Inject("ES_CLIENT_CLUSTER1") private readonly cluster1Client: Client,
    @Inject("ES_CLIENT_CLUSTER2") private readonly cluster2Client: Client
  ) {}

  async searchCluster1(index: string, query: any) {
    await this.cluster1Client.index({
      index,
      body: {
        name: 123,
        age: 3,
      },
      refresh: true,
      id: `1`,
    });
    return this.cluster1Client.search({
      index,
      body: query,
    });
  }

  async searchCluster2(index: string, query: any) {
    return this.cluster2Client.search({
      index,
      body: query,
    });
  }
}
