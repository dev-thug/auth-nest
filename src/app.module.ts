// src/app.module.ts
import { ConfigModule, ConfigService } from '@nestjs/config';

import { APP_GUARD } from '@nestjs/core';
import { AdminModule } from './admin/admin.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthGuard } from './common/guards/auth.guard';
import { AuthModule } from './auth/auth.module';
import { MailModule } from './mail/mail.module';
import { Module } from '@nestjs/common';
import { RedisModule } from './redis/redis.module';
import { RedisService } from './redis/redis.service';
import { RoleGuard } from './common/guards/role.guard';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({ load: [configuration], isGlobal: true }),
    AuthModule,
    UserModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres',
        host: process.env.POSTGRES_HOST,
        port: +process.env.POSTGRES_PORT,
        username: process.env.POSTGRES_USERNAME,
        password: process.env.POSTGRES_PASS,
        database: process.env.POSTGRES_DB,
        autoLoadEntities: true,
        synchronize: true,
        // type: 'postgres',
        // host: configService.get<string>('db.postgres.host'),
        // port: configService.get<number>('db.postgres.port'),
        // username: configService.get<string>('db.postgres.username'),
        // password: configService.get<string>('db.postgres.password'),
        // database: configService.get<string>('db.postgres.database'),
        // autoLoadEntities: true,
        // synchronize: true,
      }),
    }),
    AdminModule,
    MailModule,
    RedisModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    RedisService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RoleGuard,
    },
  ],
  exports: [RedisService],
})
export class AppModule {}
