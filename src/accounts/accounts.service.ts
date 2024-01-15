import { Injectable } from "@nestjs/common";
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

  async createNewAccount(name: string, userId: number) {
    await this.accountRepository.save({
      name,
      userId
    });
  }

  findAll() {
    return `This action returns all accounts`;
  }

  findOne(id: number) {
    return `This action returns a #${id} account`;
  }

  update(id: number, updateAccountDto: UpdateAccountDto) {
    return `This action updates a #${id} account`;
  }

  remove(id: number) {
    return `This action removes a #${id} account`;
  }

  generateUniqueAccountNumber() {
    const uniqueId = uuidv4();
    const formattedAccountId = uniqueId.replace(/-/g, "").substring(0, 9);
    const accountNumber = `${formattedAccountId.slice(0, 3)}-${formattedAccountId.slice(3, 6)}-${formattedAccountId.slice(6)}`;
    return accountNumber;
  }
}
