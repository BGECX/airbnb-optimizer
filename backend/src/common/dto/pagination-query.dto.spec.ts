import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { PaginationQueryDto } from './pagination-query.dto';

describe('PaginationQueryDto', () => {
  it('applique les valeurs par défaut', () => {
    const query = plainToInstance(PaginationQueryDto, {});
    expect(query).toMatchObject({ page: 1, limit: 50 });
    expect(query.skip).toBe(0);
  });

  it('calcule le décalage et refuse plus de 100 éléments', async () => {
    const valid = plainToInstance(PaginationQueryDto, { page: '3', limit: '25' });
    expect(valid.skip).toBe(50);
    expect(await validate(valid)).toHaveLength(0);
    expect(await validate(plainToInstance(PaginationQueryDto, { limit: '101' }))).not.toHaveLength(0);
  });
});
