import { IsNotEmpty, IsString, IsBoolean, IsNumber } from "class-validator";
import { BaseEntity } from "src/common/entities/base.entity";
import { User } from "src/user/entities/user.entity";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";

@Entity({ name: "twits" })
export class Twit extends BaseEntity {
  @IsNumber()
  @Column({ nullable: false })
  senderId: number;

  @IsNumber()
  @Column({ nullable: false })
  receiveId: number;

  @IsString()
  @Column({ nullable: false })
  senderName: string;

  @IsString()
  @Column({ nullable: false })
  receiverName: string;

  /**
   * 쪽지 메세지
   * @example "안녕하세요~!"
   * @requires true
   */
  @IsString()
  @IsNotEmpty({ message: "보낼 쪽지메세지를 입력해주세요." })
  @Column({ type: "text", nullable: false })
  contents: string;

  @IsBoolean()
  @Column({ nullable: false, default: false })
  isDeletedBySender: boolean;

  @IsBoolean()
  @Column({ nullable: false, default: false })
  isDeletedByReceiver: boolean;

  @IsBoolean()
  @Column({ nullable: false, default: false })
  isRead: boolean;

  @ManyToOne(() => User, (user) => user.receivetwits)
  @JoinColumn({ name: "receive_id" })
  receiver: User;

  @ManyToOne(() => User, (user) => user.sendtwits)
  @JoinColumn({ name: "sender_id" })
  sender: User;
}
