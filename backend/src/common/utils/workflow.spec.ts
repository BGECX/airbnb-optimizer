import { BadRequestException } from '@nestjs/common';
import { assertTransition } from './workflow';

describe('assertTransition', () => {
  const flow = { OUVERT: ['TRAITE'], TRAITE: [] } as const;
  it('accepte une transition déclarée', () => expect(() => assertTransition('test', 'OUVERT', 'TRAITE', flow)).not.toThrow());
  it('refuse un retour arrière', () => expect(() => assertTransition('test', 'TRAITE', 'OUVERT', flow)).toThrow(BadRequestException));
});
