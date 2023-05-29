// src/user/entities/user.entity.ts

import {
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { ConfirmationStatus } from 'src/common/enums/confirmation-status.enums';
import { UserStatus } from 'src/common/enums/user-status.enums';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: ConfirmationStatus,
    default: ConfirmationStatus.PENDING,
  })
  confirmationStatus: ConfirmationStatus;

  @Column({ default: false })
  emailVerified: boolean;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.INACTIVE,
  })
  status: UserStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  approvedAt: Date;

  @BeforeUpdate()
  setApprovedAt() {
    if (this.status === UserStatus.ACTIVE && !this.approvedAt) {
      this.approvedAt = new Date();
    }
  }
}
