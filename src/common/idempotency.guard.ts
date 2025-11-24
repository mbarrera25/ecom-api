import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import type { Cache } from 'cache-manager';
import { Request } from 'express';

@Injectable()
export class IdempotencyGuard implements CanActivate {
  constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const idempotencyKey = request.header('Idempotency-Key');

    if (!idempotencyKey) {
      throw new BadRequestException('Idempotency-Key header is required');
    }

    const cacheKey = `idempotency:${idempotencyKey}`;
    const exists = await this.cache.get(cacheKey);

    if (exists) {
      throw new BadRequestException('Duplicate request detected');
    }

    const parsedTtl = Number(process.env.IDEMPOTENCY_TTL ?? 60);
    const ttlInSeconds = Number.isFinite(parsedTtl) && parsedTtl > 0 ? parsedTtl : 60;
    await this.cache.set(cacheKey, true, ttlInSeconds);

    return true;
  }
}
