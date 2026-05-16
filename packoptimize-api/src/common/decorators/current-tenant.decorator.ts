import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { ClsServiceManager } from 'nestjs-cls';

export const CurrentTenant = createParamDecorator(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  (_data: unknown, _ctx: ExecutionContext): string => {
    const cls = ClsServiceManager.getClsService();
    return cls.get('TENANT_ID');
  },
);
