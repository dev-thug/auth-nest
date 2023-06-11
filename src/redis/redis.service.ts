// redis.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import Redis, { Redis as RedisClient } from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit {
  private client: RedisClient;

  onModuleInit() {
    this.client = new Redis({
      host: process.env.REDIS_HOST, // Redis 서버의 주소
      port: +process.env.REDIS_PORT, // Redis 서버의 포트
      // password: 'redis',
    });
  }

  getClient(): RedisClient {
    return this.client;
  }
}
