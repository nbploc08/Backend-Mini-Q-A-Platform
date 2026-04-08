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
    example: 'clxyz1234567890',
    type: 'string',
  });
