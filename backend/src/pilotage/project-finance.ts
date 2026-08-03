export function calculateProjectKpis(input: {
  budget: number; depenses: number; coutMainOeuvre: number;
  engagementsAchats: number; engagementsSousTraitance: number; chiffreAffaires: number;
}) {
  const money = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;
  const coutReel = money(input.depenses + input.coutMainOeuvre);
  const resteEngage = money(input.engagementsAchats + input.engagementsSousTraitance);
  return {
    coutReel, resteEngage,
    coutPrevisionnelFinal: money(coutReel + resteEngage),
    margeReelle: money(input.chiffreAffaires - coutReel),
    margePrevisionnelle: money(input.chiffreAffaires - coutReel - resteEngage),
    ecartBudget: money(input.budget - coutReel - resteEngage),
  };
}
