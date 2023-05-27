// src/user/entities/user.entity.ts

import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  //   @Column()
  //   userName: string;

  @Column({ default: true })
  isActive: boolean;

  //   @BeforeInsert()
  //   @BeforeUpdate()
  //   createUserName() {
  //     this.userName = `${this.lastName}${this.firstName} `;
  //   }
}
