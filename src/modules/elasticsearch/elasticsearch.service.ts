import { Injectable, Inject } from "@nestjs/common";
import { Client } from "@elastic/elasticsearch";
import { checkIndex } from "src/mapping";

@Injectable()
export class ElasticsearchService {
  constructor(
    @Inject("ES_CLIENT_CLUSTER1") private readonly cluster1Client: Client,
    @Inject("ES_CLIENT_CLUSTER2") private readonly cluster2Client: Client
  ) {}

  async onModuleInit() {
    const indexName = "my_index";

    await checkIndex(this.cluster1Client, indexName);
  }

  async searchCluster1(index: string, query: any) {
    await this.cluster1Client.index({
      index,
      body: {
        name: 123,
        age: 3,
        message1: query,
      },
      refresh: true,
      id: `1`,
    });
    let a = {
      query: {
        match: { message1: query },
      },
    };
    const res = await this.cluster1Client.search({
      index,
      body: a,
    });
    return res;
  }

  async searchCluster2(index: string, query: any) {
    return this.cluster2Client.search({
      index,
      body: query,
    });
  }
}
