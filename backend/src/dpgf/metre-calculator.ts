import { BadRequestException } from '@nestjs/common';

export function evaluateMetreFormula(formula: string, variables: Record<string, number>): number {
  const tokens = formula.replace(/,/g, '.').match(/\d+(?:\.\d+)?|[A-Za-z_][A-Za-z0-9_]*|[()+\-*/]/g) ?? [];
  if (tokens.join('') !== formula.replace(/[\s,]/g, (value) => value === ',' ? '.' : '')) {
    throw new BadRequestException('Formule de métré invalide');
  }
  let cursor = 0;
  const expression = (): number => {
    let value = term();
    while (tokens[cursor] === '+' || tokens[cursor] === '-') {
      const operator = tokens[cursor++];
      const right = term();
      value = operator === '+' ? value + right : value - right;
    }
    return value;
  };
  const term = (): number => {
    let value = factor();
    while (tokens[cursor] === '*' || tokens[cursor] === '/') {
      const operator = tokens[cursor++];
      const right = factor();
      if (operator === '/' && right === 0) throw new BadRequestException('Division par zéro dans le métré');
      value = operator === '*' ? value * right : value / right;
    }
    return value;
  };
  const factor = (): number => {
    const token = tokens[cursor++];
    if (token === '-') return -factor();
    if (token === '(') {
      const value = expression();
      if (tokens[cursor++] !== ')') throw new BadRequestException('Parenthèse fermante manquante');
      return value;
    }
    if (/^\d/.test(token ?? '')) return Number(token);
    if (/^[A-Za-z_]/.test(token ?? '') && Object.prototype.hasOwnProperty.call(variables, token)) return Number(variables[token]);
    throw new BadRequestException(`Variable inconnue dans la formule : ${token ?? ''}`);
  };

  const result = expression();
  if (cursor !== tokens.length || !Number.isFinite(result) || result < 0) {
    throw new BadRequestException('Résultat de métré invalide');
  }
  return Math.round((result + Number.EPSILON) * 1000) / 1000;
}
