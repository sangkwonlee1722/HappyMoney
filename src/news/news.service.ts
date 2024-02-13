import { Injectable } from "@nestjs/common";
import { launch } from "puppeteer";
import { InjectRepository } from "@nestjs/typeorm";
import { News } from "./entities/news.entity";
import { Repository } from "typeorm";
import { load } from "cheerio";
import { Cron, CronExpression } from "@nestjs/schedule";
import { PaginatePostDto } from "src/common/dto/paginate.dto";

@Injectable()
export class NewsService {
  private readonly newsUrl: string = "https://www.google.com/finance/?hl=ko&gl=KR&source=news";
  private readonly newsSelector: string = "div[data-tab-id = localMarketNews]";
  constructor(
    @InjectRepository(News)
    private readonly newsRepository: Repository<News>
  ) {}

  //뉴스 크롤링
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

  // 뉴스 조회
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

  @Cron("20 29 20 * * 1-5") // 30분마다 뉴스 크롤링
  async saveCrawledNews() {
    console.log("뉴스 크롤링 시작");
    let start = new Date();
    await this.crawlNews();
    console.log("뉴스 크롤링 완료");
    let end = new Date();
    const time = end.getTime() - start.getTime();
    console.log("걸린 시간 : ", time);
  }

  // 매일 자정에 뉴스중 크롤링 후 7일이 지난 뉴스 삭제
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async deleteOldNews() {
    const time = new Date();
    time.setDate(time.getDate() - 7);
    console.log("time: ", time);

    await this.newsRepository.createQueryBuilder().delete().from(News).where("createdAt <= :time", { time }).execute();
  }
}
