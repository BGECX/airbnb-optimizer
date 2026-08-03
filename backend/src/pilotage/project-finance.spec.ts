import { calculateProjectKpis } from './project-finance';

describe('calculateProjectKpis', () => {
  it('sépare réalisé, engagé et marge prévisionnelle', () => {
    expect(calculateProjectKpis({ budget: 100000, depenses: 30000, coutMainOeuvre: 15000, engagementsAchats: 10000, engagementsSousTraitance: 5000, chiffreAffaires: 85000 })).toEqual({
      coutReel: 45000, resteEngage: 15000, coutPrevisionnelFinal: 60000,
      margeReelle: 40000, margePrevisionnelle: 25000, ecartBudget: 40000,
    });
  });
});
