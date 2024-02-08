import { Controller, Get, Post, Body, Patch, Param, Delete } from "@nestjs/common";
import { NewsService } from "./news.service";
import { ApiTags } from "@nestjs/swagger";

@ApiTags("News")
@Controller("news")
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Get("sample")
  getSample() {
    return this.newsService.crawlNews();
  }

  @Get()
  findAll() {
    return this.newsService.findAll();
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.newsService.remove(+id);
  }
}
