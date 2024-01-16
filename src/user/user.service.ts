import { ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { CreateUserDto } from "./dto/create-user.dto";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { compareSync, hashSync } from "bcrypt";
import { User } from "./entities/user.entity";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly configService: ConfigService,
    private jwtService: JwtService
  ) {}

  async createUser(createUserDto: CreateUserDto) {
    const { email, password, name, nickName, phone } = createUserDto;

    const existUser = await this.findUserByEmail(email);

    if (existUser) throw new ConflictException("이미 존재하는 회원입니다.");

    const existNickName = await this.findUserByNickName(nickName);
    if (existNickName) throw new ConflictException("이미 존재하는 이름입니다.");

    const hashRound = this.configService.get<number>("PASSWORD_HASH_ROUNDS");
    const hashPassword = hashSync(password, hashRound);
    await this.userRepository.save({
      email,
      password: hashPassword,
      nickName,
      phone,
      name
    });
  }

  async login(email: string, password: string) {
    const user = await this.findUserByEmail(email);
    if (!user) throw new UnauthorizedException("이메일을 확인해주세요.");

    if (!compareSync(password, user?.password ?? "")) throw new UnauthorizedException("비밀번호를 확인해주세요.");

    const payload = { sub: user.id, tokenType: "access" };

    return {
      success: true,
      message: "okay",
      accessToken: this.jwtService.sign(payload, { expiresIn: "1d" })
    };
  }

  async updateUserInfo(id: number, nickName: string, phone: string, password: string) {
    const updated = await this.userRepository.update({ id }, { nickName, phone, password });

    return updated;
  }

  async deleteUser(id: number) {
    const user: User = await this.userRepository.findOne({
      where: { id }
    });

    return await this.userRepository.softRemove(user);
  }

  async find() {
    return await this.userRepository.find();
  }

  async findUserById(id: number) {
    return await this.userRepository.findOneBy({ id });
  }

  async findUserByEmail(email: string) {
    return await this.userRepository.findOne({
      select: ["id", "email", "password", "name", "role"],
      where: [{ email }]
    });
  }

  async findUserByNickName(nickName: string) {
    return await this.userRepository.findOneBy({ nickName });
  }
}
