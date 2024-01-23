import { ConflictException, Injectable, NotFoundException, Req, UnauthorizedException } from "@nestjs/common";
import { CreateUserDto } from "./dto/create-user.dto";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { compareSync, hashSync } from "bcrypt";
import { User } from "./entities/user.entity";
import { v4 as uuidv4 } from "uuid";
import { createTransport } from "nodemailer";
interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService
  ) {}

  async createUser(createUserDto: CreateUserDto) {
    const { email, password, name, nickName, phone } = createUserDto;

    const existUser = await this.findUserByEmail(email);

    if (existUser) throw new ConflictException("이미 존재하는 회원입니다.");

    const existNickName = await this.findUserByNickName(nickName);
    if (existNickName) throw new ConflictException("이미 존재하는 이름입니다.");

    try {
      const hashRound = this.configService.get<number>("PASSWORD_HASH_ROUNDS");
      const hashPassword = hashSync(password, hashRound);

      const transporter = createTransport({
        service: "gmail",
        host: "smtp.gmail.com",
        port: 587,
        secure: true,
        auth: {
          type: "OAuth2",
          user: this.configService.get<string>("GMAIL_OAUTH_USER"),
          clientId: this.configService.get<string>("GMAIL_OAUTH_CLIENT_ID"),
          clientSecret: this.configService.get<string>("GAMIL_OAUTH_CLIENT_SECRET"),
          refreshToken: this.configService.get<string>("GAMIL_OAUTH_REFRESH_TOKEN")
        }
      });

      await this.userRepository.save({
        email,
        password: hashPassword,
        nickName,
        phone,
        name,
        isEmailVerified: false
      });

      const mailOptions = {
        to: email,
        subject: "[happymoney] 회원가입 이메일 인증 메일입니다.",
        html: `인증링크 : <a href="http://localhost:3000/views/signin-email-verify.html?email=${encodeURIComponent(email)}">인증하기</a>`
      };

      transporter.sendMail(mailOptions);
    } catch (err: any) {
      console.error(err);
    }
  }

  async login(email: string, password: string) {
    const user = await this.findUserByEmail(email);

    if (user.isEmailVerified === false) {
      throw new NotFoundException("등록된 이메일 인증을 진행해주세요.");
    }
    if (!user) throw new UnauthorizedException("이메일을 확인해주세요.");

    if (!compareSync(password, user?.password ?? "")) throw new UnauthorizedException("비밀번호를 확인해주세요.");

    const payload = { sub: user.id, tokenType: "access" };

    return {
      success: true,
      message: "okay",
      accessToken: this.jwtService.sign(payload, { expiresIn: "1d" })
    };
  }

  async updateUserInfo(id: number, nickName: string, phone: string) {
    const updated = await this.userRepository.update({ id }, { nickName, phone });

    return updated;
  }

  async deleteUserSendEmail(id: number) {
    const user: User = await this.userRepository.findOne({
      where: { id }
    });

    try {
      const transporter = createTransport({
        service: "gmail",
        host: "smtp.gmail.com",
        port: 587,
        secure: true,
        auth: {
          type: "OAuth2",
          user: this.configService.get<string>("GMAIL_OAUTH_USER"),
          clientId: this.configService.get<string>("GMAIL_OAUTH_CLIENT_ID"),
          clientSecret: this.configService.get<string>("GAMIL_OAUTH_CLIENT_SECRET"),
          refreshToken: this.configService.get<string>("GAMIL_OAUTH_REFRESH_TOKEN")
        }
      });

      const mailOptions = {
        to: user.email,
        subject: "[happymoney] 회원탈퇴 이메일 인증 메일입니다.",
        html: `인증링크 : <a href="http://localhost:3000/views/signout-email-verify.html?email=${encodeURIComponent(user.email)}">인증하기</a>`
      };

      transporter.sendMail(mailOptions);
    } catch (err: any) {
      console.error(err);
    }
  }

  async deleteUser(id: number) {
    const user: User = await this.userRepository.findOne({
      where: { id }
    });

    await this.updateUserVerify(user.id, {
      isEmailVerified: false
    });
    await this.userRepository.softRemove(user);
  }

  async find() {
    return await this.userRepository.find();
  }

  async findUserById(id: number) {
    return await this.userRepository.findOneBy({ id });
  }

  async findUserByEmail(email: string) {
    return await this.userRepository.findOne({
      select: ["id", "email", "password", "name", "role", "isEmailVerified"],
      where: [{ email }]
    });
  }

  async findUserByNickName(nickName: string) {
    return await this.userRepository.findOneBy({ nickName });
  }

  async updateUserVerify(userId: number, updateData: Partial<User>): Promise<void> {
    await this.userRepository.update(userId, updateData);
  }
}
