import { ApiParam } from '@nestjs/swagger';

export const ID_PARAM = (resource: string) =>
  ApiParam({
    name: 'id',
    description: `ID của ${resource}`,
    example: 1,
    type: 'number',
  });

export const STRING_ID_PARAM = (resource: string) =>
  ApiParam({
    name: 'id',
    description: `ID của ${resource}`,
    example: '00000000-0000-4000-8000-0000000003e8',
    type: 'string',
  });
