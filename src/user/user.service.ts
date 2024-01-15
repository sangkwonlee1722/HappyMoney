import { ConflictException, Injectable } from "@nestjs/common";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { hashSync } from "bcrypt";
import { User } from "./entities/user.entity";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly configService: ConfigService,
    private jwtService: JwtService
  ) {}

  async createUser(email: string, password: string, name: string, nickName: string, phone: string, signupType: string) {
    const existUser = await this.findUserByEmail(email);
    if (existUser) throw new ConflictException("이미 존재하는 회원입니다.");

    const existNickName = await this.findUserByNickName(nickName);
    if (existNickName) throw new ConflictException("이미 존재하는 이름입니다.");

    const hashRound = this.configService.get<number>("PASSWORD_HASH_ROUNDS");
    const hashPassword = hashSync(password, hashRound);
    return await this.userRepository.save({
      email,
      password: hashPassword,
      nickName,
      phone,
      name,
      signupType
    });
  }

  findAll() {
    return `This action returns all user`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  async findUserById(id: number) {
    return await this.userRepository.findOneBy({ id });
  }

  async findUserByEmail(email: string) {
    return await this.userRepository.findOneBy({ email });
  }

  async findUserByNickName(nickName: string) {
    return await this.userRepository.findOneBy({ nickName });
  }
}
