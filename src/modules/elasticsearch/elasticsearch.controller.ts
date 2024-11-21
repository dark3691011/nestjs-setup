import { Controller, Get, Query } from "@nestjs/common";
import { ElasticsearchService } from "./elasticsearch.service";

@Controller("elasticsearch")
export class ElasticsearchController {
  constructor(private readonly elasticService: ElasticsearchService) {}

  @Get("cluster1")
  async searchCluster1(@Query("query") query: string) {
    return this.elasticService.searchCluster1("my-index", {
      query: {
        match: { message: query },
      },
    });
  }

  @Get("cluster2")
  async searchCluster2(@Query("query") query: string) {
    return this.elasticService.searchCluster2("my-index", {
      query: {
        match: { message: query },
      },
    });
  }
}
