import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Account } from "./entities/account.entity";
import { Repository } from "typeorm";

@Injectable()
export class AccountsService {
  constructor(
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

  async findAllMyAccountsById(userId: number): Promise<Account[]> {
    const accounts: Account[] = await this.accountRepository.find({
      where: { userId },
      select: ["id", "name", "point", "userId", "accountNumber"] // 주식 총 평가금액 추가 예정
    });

    return accounts;
  }

  async findOneMyAccountById(userId: number, accountId: number): Promise<Account> {
    const account: Account = await this.accountRepository
      .createQueryBuilder("a")
      .where("a.userId=:userId", { userId })
      .andWhere("a.id=:accountId", { accountId })
      .select(["a.id", "a.name", "a.point", "a.userId", "a.accountNumber"]) // 계좌가 보유한 주식 목록 조인 예정
      .getOne();

    if (!account) {
      throw new NotFoundException("해당하는 계좌를 찾을 수 없습니다.");
    }

    return account;
  }

  async updateMyAccount(accountId: number, userId: number, name: string): Promise<void> {
    await this.findOneMyAccountById(userId, accountId);

    await this.accountRepository.update({ id: accountId }, { name });
  }

  async removeMyAccountById(accountId: number, userId: number): Promise<void> {
    const account: Account = await this.findOneMyAccountById(userId, accountId);

    await this.accountRepository.softRemove(account);
  }
}
