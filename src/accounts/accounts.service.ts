import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Account } from "./entities/account.entity";
import { Repository } from "typeorm";
import { Cron } from "@nestjs/schedule";
import { ConfigService } from "@nestjs/config";
import { SlackMessage, slackLineColor } from "src/common/slack/slack.config";
import { SlackService } from "src/common/slack/slack.service";

@Injectable()
export class AccountsService {
  constructor(
    private readonly configService: ConfigService,
    private readonly slackService: SlackService,
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>
  ) {}

  async createNewAccount(name: string, userId: number): Promise<void> {
    const myAccountsNumbers = await this.countMyAllAcounts(userId);

    if (myAccountsNumbers >= 1) {
      throw new ForbiddenException("계좌는 계정 당 1개만 개설이 가능합니다.");
    }

    const accountNumber: string = await this.generateUniqueAccountNumber();

    await this.accountRepository.save({
      name,
      userId,
      accountNumber
    });
  }

  /* 계정 당 3개까지 계좌 개설 제한 */
  async countMyAllAcounts(userId: number): Promise<number> {
    return await this.accountRepository.count({ where: { userId } });
  }

  /* 랜덤으로 계좌 번호 생성 */
  async generateAccountNumber(): Promise<string> {
    const min = 1000000000;
    const max = 9999999999;
    const randomNum: number = Math.floor(Math.random() * (max - min)) + min;

    const formattedAccountNum: string = randomNum.toString().replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3");
    return formattedAccountNum;
  }

  /* 생성된 계좌번호가 DB에 있는지 확인 */
  async findAccountByAccountNumber(accountNumber: string): Promise<Account> {
    const account = await this.accountRepository.findOne({ where: { accountNumber } });

    return account;
  }

  /* 생성된 계좌번호가 DB에 있을 경우 다시 생성하는 함수 */
  async generateUniqueAccountNumber(): Promise<string> {
    const accountNumber: string = await this.generateAccountNumber();
    const existAccount: Account = await this.findAccountByAccountNumber(accountNumber);

    if (existAccount) {
      return this.generateUniqueAccountNumber(); // 재귀 호출로 다시 계좌번호 생성
    }

    return accountNumber;
  }

  async getMyAccountValue(userId: number): Promise<Account> {
    const account: Account = await this.accountRepository
      .createQueryBuilder()
      .select([
        "id",
        "account_number AS accountNumber",
        "point",
        "total_value AS totalValue",
        "profit",
        "profit_percentage AS profitPercentage",
        "name"
      ])
      .where("user_id=:userId", { userId })
      .getRawOne();

    return account;
  }

  async getMyAccountDetailInfo(userId: number): Promise<Account> {
    const account = await this.accountRepository
      .createQueryBuilder("a")
      .select(["id", "name", "point", "a.accountNumber AS accountNumber"])
      .addSelect((subQuery) => {
        return subQuery
          .select("SUM(sh.numbers * s.clpr)", "totalStockValue")
          .from("stock_holdings", "sh")
          .leftJoin("sh.stock", "s")
          .where("sh.accountId = a.id");
      }, "totalStockValue")
      .addSelect((subQuery) => {
        return subQuery
          .select(
            "SUM(CASE WHEN ao.status = 'order' AND ao.buySell='1' THEN ao.ttlPrice ELSE 0 END)",
            "totalOrderPrice"
          )
          .from("orders", "ao")
          .where("ao.accountId = a.id");
      }, "totalOrderPrice")
      .where("a.userId=:userId", { userId })
      .getRawOne();

    account.totalOrderPrice = Number(account.totalOrderPrice);

    return account;
  }

  // 계좌 찾기
  async findOneAccount(userId: number) {
    const account = await this.accountRepository.findOne({ where: { userId }, relations: ["orders", "stockHoldings"] });

    if (!account) {
      throw new NotFoundException({ success: false, message: "해당하는 계좌를 찾을 수 없습니다." });
    }

    return account;
  }

  async updateMyAccount(accountId: number, userId: number, name: string): Promise<void> {
    await this.findOneAccount(userId);

    await this.accountRepository.update({ id: accountId }, { name });
  }

  async removeMyAccountById(userId: number): Promise<void> {
    const account: Account = await this.findOneAccount(userId);

    await this.accountRepository.softRemove(account);
  }

  /* 계좌 가치로 랭킹 구현하기 */
  async updateAccountValue() {
    let start = new Date();
    const calculateAccountValue = await this.calculateAccountValue();

    this.accountRepository
      .createQueryBuilder()
      .insert()
      .into(Account)
      .values(calculateAccountValue)
      .orUpdate(["total_value", "profit", "profit_percentage", "updated_at"], "id", {
        skipUpdateIfNoValuesChanged: true,
        upsertType: "on-conflict-do-update"
      })
      .execute();

    let end = new Date();
    const time = end.getTime() - start.getTime();

    // 슬랙으로 알림 보내기
    const slackHookUrl: string = this.configService.get("SLACK_ALARM_URI_SCHEDULE");
    const color: string = slackLineColor.info;
    const text: string = "Stock Update Schedule";
    const mrkTitle: string = "주식 가치 정보 업데이트 성공";
    const mrkValue: string = `업데이트 걸린 시간: ${time}`;

    const message = new SlackMessage(color, text, mrkTitle, mrkValue);

    this.slackService.sendScheduleNoti(message, slackHookUrl);

    console.log("걸린 시간 : ", time);
  }

  /* 각 계좌의 총 가치 계산하기 */
  async calculateAccountValue() {
    const data = await this.accountRepository
      .createQueryBuilder("a")
      .select(["id", "point"])
      .addSelect((subQuery) => {
        return subQuery
          .select("SUM(sh.numbers * s.clpr)", "totalStockValue")
          .from("stock_holdings", "sh")
          .leftJoin("sh.stock", "s")
          .where("sh.accountId = a.id");
      }, "totalStockValue")
      .addSelect((subQuery) => {
        return subQuery
          .select(
            "SUM(CASE WHEN ao.status = 'order' AND ao.buySell='1' THEN ao.ttlPrice ELSE 0 END)",
            "totalOrderPrice"
          )
          .from("orders", "ao")
          .where("ao.accountId = a.id");
      }, "totalOrderPrice")
      .getRawMany();

    const totalAccountsValue = data.map((data) => {
      const { id, point, totalStockValue, totalOrderPrice } = data;

      const totalValue = point + totalStockValue + Number(totalOrderPrice);

      const basePoint = 100000000;
      const profit = totalValue - basePoint;
      const profitPercentage = ((profit / basePoint) * 100).toFixed(1);

      return {
        id,
        totalValue: +totalValue,
        profit,
        profitPercentage
      };
    });

    return totalAccountsValue;
  }

  async getRankAccounts(): Promise<Account[]> {
    const topTenAccounts: Account[] = await this.accountRepository
      .createQueryBuilder("a")
      .leftJoinAndSelect("a.user", "u")
      .select([
        "a.id",
        "a.accountNumber",
        "a.point",
        "a.totalValue",
        "a.profit",
        "a.profitPercentage",
        "a.name",
        "a.createdAt",
        "a.updatedAt",
        "u.nickName"
      ])
      .orderBy("a.totalValue", "DESC")
      .addOrderBy("a.createdAt", "DESC")
      .take(10)
      .getMany();

    return topTenAccounts;
  }
}
