import { Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { Notice } from "src/notice/entities/notice.entity";
import { Post } from "src/post/entities/post.entity";
import { Stock } from "src/stock/entities/stock.entity";

@Injectable()
export class DatabaseService {
  constructor(
    @InjectRepository(Notice)
    private readonly noticeRepository: Repository<Notice>,
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(Stock)
    private readonly stockRepository: Repository<Stock>
  ) {}

  async search(keyword: string) {
    const noticeResults = await this.noticeRepository
      .createQueryBuilder("notice")
      .where("notice.title LIKE :keyword OR notice.contents LIKE :keyword", { keyword: `%${keyword}%` })
      .getMany();

    const postResults = await this.postRepository
      .createQueryBuilder("post")
      .where("post.title LIKE :keyword OR post.contents LIKE :keyword", { keyword: `%${keyword}%` })
      .getMany();

    const stockResults = await this.stockRepository
      .createQueryBuilder("stock")
      .where("stock.itms_nm LIKE :keyword", { keyword: `%${keyword}%` })
      .getMany();

    return { notices: noticeResults, posts: postResults, stocks: stockResults };
  }
}
