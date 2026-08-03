import { BadRequestException } from '@nestjs/common';
import { evaluateMetreFormula } from './metre-calculator';

describe('evaluateMetreFormula', () => {
  it('calcule une surface répétée avec déduction', () => {
    expect(evaluateMetreFormula('(L*H*N)-OUVERTURES', { L: 4.2, H: 2.5, N: 2, OUVERTURES: 3 })).toBe(18);
  });

  it('accepte la virgule décimale', () => {
    expect(evaluateMetreFormula('2,5*3', {})).toBe(7.5);
  });

  it('refuse code, variable inconnue et division par zéro', () => {
    expect(() => evaluateMetreFormula('process.exit()', {})).toThrow(BadRequestException);
    expect(() => evaluateMetreFormula('L*H', { L: 2 })).toThrow(BadRequestException);
    expect(() => evaluateMetreFormula('2/0', {})).toThrow(BadRequestException);
  });
});
