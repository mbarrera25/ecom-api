import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export const CurrentUser = createParamDecorator(
  (property: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request & { user?: Record<string, unknown> }>();
    const user = request.user ?? null;

    if (!property || !user) {
      return user;
    }

    return user[property];
  },
);
