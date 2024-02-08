import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from "@nestjs/common";
import { NewsService } from "./news.service";
import { ApiTags } from "@nestjs/swagger";
import { PaginatePostDto } from "src/common/dto/paginate.dto";

@ApiTags("News")
@Controller("news")
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Get("sample")
  getSample() {
    return this.newsService.crawlNews();
  }

  @Get()
  async findAll(@Query() query: PaginatePostDto) {
    let { page } = query;
    if (page === null) {
      page = 1;
    }
    const { news, count } = await this.newsService.findAll(query);
    return {
      success: true,
      message: "okay",
      list: news,
      total: count
    };
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.newsService.remove(+id);
  }
}
