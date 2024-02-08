import { Injectable } from "@nestjs/common";
import { launch } from "puppeteer";
import { InjectRepository } from "@nestjs/typeorm";
import { News } from "./entities/news.entity";
import { Repository } from "typeorm";
import { load } from "cheerio";
import { Cron } from "@nestjs/schedule";
import { PaginatePostDto } from "src/common/dto/paginate.dto";

@Injectable()
export class NewsService {
  private readonly newsUrl: string = "https://www.google.com/finance/?hl=ko&gl=KR&source=news";
  private readonly newsSelector: string = "div[data-tab-id = localMarketNews]";
  private readonly newsLimit = 50; // Adjust the threshold as needed
  constructor(
    @InjectRepository(News)
    private readonly newsRepository: Repository<News>
  ) {}

  async crawlNews() {
    try {
      // 브라우저 열기
      const browser = await launch({ headless: "new" });

      // 새 페이지 생성
      const page = await browser.newPage();

      // 페이지 이동 후 원하는 기사 출력
      await page.goto(this.newsUrl);
      await page.waitForSelector(this.newsSelector);
      await page.click(this.newsSelector);
      await page.waitForSelector("div[class = Yfwt5]");
      const content = await page.content();

      // 브라우저 닫기
      await page.close();
      await browser.close();

      const $ = load(content);
      const news = $(".yY3Lee");
      const result = [];
      news.each((i, element) => {
        const $data = load(element);
        const newspaper = $(element).attr("data-article-source-name");
        const link = $data("a").attr("href");
        const title = $data(".Yfwt5").text();
        result.push({
          newspaper,
          title,
          link
        });
      });
      for (const newsItem of result) {
        await this.newsRepository
          .createQueryBuilder()
          .insert()
          .into(News)
          .values(newsItem)
          .orUpdate(["title", "link"], "title", {
            skipUpdateIfNoValuesChanged: true,
            upsertType: "on-conflict-do-update"
          })
          .updateEntity(false)
          .execute();
      }
    } catch (error) {
      console.error("Error in crawl:", error.message);
    }
  }

  async deleteNews() {
    try {
      const count = await this.newsRepository.count();

      if (count > this.newsLimit) {
        const oldRecords = await this.newsRepository.find({
          order: {
            createdAt: "ASC"
          },
          take: count - this.newsLimit
        });

        await Promise.all(oldRecords.map((record) => this.newsRepository.delete(record.id)));

        console.log(`Deleted ${oldRecords.length} records.`);
      }
    } catch (error) {
      console.error("Error in delete:", error.message);
    }
  }

  async findAll(query: PaginatePostDto) {
    const [news, count]: [News[], number] = await this.newsRepository
      .createQueryBuilder("p")
      .select(["p.newspaper", "p.title", "p.link"])
      .skip(query.take * (query.page - 1))
      .take(query.take)
      .orderBy("p.createdAt", query.order__createdAt)
      .getManyAndCount();

    return { news, count };
  }

  remove(id: number) {
    return `This action removes a #${id} news`;
  }

  @Cron("0 */30 * * * *") // 30분마다 갱신
  async saveCrawledNews() {
    console.log("뉴스 크롤링 시작");
    let start = new Date();
    await this.crawlNews();
    console.log("뉴스 크롤링 완료");
    console.log("뉴스 삭제 시작");
    await this.deleteNews();
    let end = new Date();
    console.log("뉴스 삭제 완료");
    const time = end.getTime() - start.getTime();
    console.log("걸린 시간 : ", time);
  }
}
