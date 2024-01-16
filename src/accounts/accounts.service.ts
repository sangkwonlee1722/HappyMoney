import { Injectable, NotFoundException } from "@nestjs/common";
import { CreateAccountDto } from "./dto/create-account.dto";
import { UpdateAccountDto } from "./dto/update-account.dto";
import { v4 as uuidv4 } from "uuid";
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
    await this.accountRepository.save({
      name,
      userId
    });
  }

  async findAllMyAccountsById(userId: number): Promise<Account[]> {
    const accounts: Account[] = await this.accountRepository.find({
      where: { userId },
      select: ["id", "name", "point", "userId"] // 주식 총 평가금액 추가 예정
    });

    return accounts;
  }

  async findOneMyAccountById(userId: number, accountId: number): Promise<Account> {
    const account: Account = await this.accountRepository
      .createQueryBuilder("a")
      .where("a.userId=:userId", { userId })
      .andWhere("a.id=:accountId", { accountId })
      .select(["a.id", "a.name", "a.point", "a.userId"]) // 계좌가 보유한 주식 목록 조인 예정
      .getOne();

    if (!account) {
      throw new NotFoundException("해당하는 계좌를 찾을 수 없습니다.");
    }

    return account;
  }

  async updateMyAccount(accountId: number, userId: number, name: string) {
    await this.findOneMyAccountById(userId, accountId);

    await this.accountRepository.update({ id: accountId }, { name });
  }

  remove(id: number) {
    return `This action removes a #${id} account`;
  }
}
