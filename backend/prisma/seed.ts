import { PrismaClient, UserRole, ClientType, ChantierStatut, DevisStatut, FactureStatut, ContratType, DiagnosticType, LotSituation } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Users
  const seedPassword = process.env.SEED_ADMIN_PASSWORD;
  if (!seedPassword || seedPassword.length < 12) {
    throw new Error('SEED_ADMIN_PASSWORD (12 caractères minimum) est obligatoire pour exécuter le seed');
  }
  const adminPassword = await bcrypt.hash(seedPassword, 12);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@kritia.fr',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'KRITIA',
      role: UserRole.ADMIN,
    },
  });

  const seedManagerPassword = process.env.SEED_MANAGER_PASSWORD;
  if (!seedManagerPassword || seedManagerPassword.length < 12) {
    throw new Error('SEED_MANAGER_PASSWORD (12 caractères minimum) est obligatoire pour exécuter le seed');
  }
  const managerPassword = await bcrypt.hash(seedManagerPassword, 12);
  const manager = await prisma.user.create({
    data: {
      email: 'manager@dupont-batiment.fr',
      password: managerPassword,
      firstName: 'Pierre',
      lastName: 'Dupont',
      role: UserRole.MANAGER,
    },
  });

  // Paramètres entreprise
  await prisma.parametreEntreprise.create({
    data: {
      id: 'default',
      raisonSociale: 'SARL Dupont Bâtiment',
      siret: '123 456 789 00012',
      adresse: '15 rue de la République',
      codePostal: '92100',
      ville: 'Boulogne-Billancourt',
      telephone: '01 46 05 12 34',
      email: 'contact@dupont-batiment.fr',
      siteWeb: 'www.dupont-batiment.fr',
      couleurPrimary: '#2563eb',
      couleurSecondary: '#f59e0b',
    },
  });

  // TVA
  await prisma.parametreTVA.createMany({
    data: [
      { nom: 'Taux normal', taux: 20.00, isDefault: true },
      { nom: 'Taux réduit', taux: 5.50, isDefault: false },
      { nom: 'Taux intermédiaire', taux: 10.00, isDefault: false },
    ],
  });

  // Clients
  const client1 = await prisma.client.create({
    data: {
      type: ClientType.COPROPRIETE,
      nom: 'Résidence Les Jardins',
      siret: '123 456 789 00012',
      adresse: '12 rue des Jardins',
      codePostal: '92100',
      ville: 'Boulogne-Billancourt',
      telephone: '01 23 45 67 89',
      email: 'contact@lesjardins.fr',
    },
  });

  const client2 = await prisma.client.create({
    data: {
      type: ClientType.ENTREPRISE,
      nom: 'SCI Bellevue',
      siret: '987 654 321 00021',
      adresse: '45 avenue Kléber',
      codePostal: '75016',
      ville: 'Paris',
      telephone: '01 98 76 54 32',
      email: 'gestion@scibellevue.fr',
    },
  });

  // Chantiers
  const chantier1 = await prisma.chantier.create({
    data: {
      reference: 'CH-2026-042',
      clientId: client1.id,
      objet: 'Rénovation complète 12 lots',
      adresse: '12 rue des Jardins, 92100 Boulogne',
      dateDebutPrevue: new Date('2026-06-01'),
      dateFinPrevue: new Date('2026-09-15'),
      montantPrevu: 320000,
      avancement: 65,
      statut: ChantierStatut.EN_COURS,
      responsableId: manager.id,
      description: 'Rénovation complète des lots 2A, 2B, 3A, 3B, 4A, 4B',
    },
  });

  const chantier2 = await prisma.chantier.create({
    data: {
      reference: 'CH-2026-038',
      clientId: client2.id,
      objet: 'Aménagement salle des fêtes',
      adresse: '31 rue Peclet, 75015 Paris',
      dateDebutPrevue: new Date('2026-05-01'),
      dateFinPrevue: new Date('2026-10-30'),
      montantPrevu: 185000,
      avancement: 40,
      statut: ChantierStatut.EN_COURS,
      responsableId: manager.id,
    },
  });

  // Devis
  await prisma.devis.create({
    data: {
      numero: 'D-2026-092',
      clientId: client1.id,
      chantierId: chantier1.id,
      objet: 'Rénovation sdb lot 4B',
      date: new Date('2026-07-28'),
      dateValidite: new Date('2026-08-27'),
      tauxTva: 20,
      totalHt: 3572,
      totalTva: 714.40,
      totalTtc: 4286.40,
      statut: DevisStatut.ENVOYE,
      createdById: manager.id,
      lignes: {
        create: [
          { ordre: 1, designation: 'Démolition existant sdb', unite: 'forfait', quantite: 1, prixUnitaireHt: 850, totalHt: 850 },
          { ordre: 2, designation: 'Carrelage mural 30x60', unite: 'm²', quantite: 12, prixUnitaireHt: 35, totalHt: 420 },
          { ordre: 3, designation: 'Carrelage sol 60x60 antidérapant', unite: 'm²', quantite: 6, prixUnitaireHt: 42, totalHt: 252 },
          { ordre: 4, designation: 'Robinetterie complète', unite: 'forfait', quantite: 1, prixUnitaireHt: 1200, totalHt: 1200 },
          { ordre: 5, designation: 'Meuble vasque + miroir', unite: 'forfait', quantite: 1, prixUnitaireHt: 850, totalHt: 850 },
        ],
      },
    },
  });

  // Factures
  await prisma.facture.create({
    data: {
      numero: 'F-2026-156',
      clientId: client1.id,
      chantierId: chantier1.id,
      type: 'SITUATION',
      objet: 'Acompte situation 2',
      date: new Date('2026-07-30'),
      dateEcheance: new Date('2026-08-30'),
      tauxTva: 20,
      totalHt: 64000,
      totalTva: 12800,
      totalTtc: 76800,
      statut: FactureStatut.ENVOYEE,
      createdById: manager.id,
    },
  });

  // Employés
  const emp1 = await prisma.employe.create({
    data: {
      nom: 'Dupont',
      prenom: 'Pierre',
      telephone: '06 12 34 56 78',
      email: 'p.dupont@dupont-batiment.fr',
      fonction: 'Chef de chantier',
      qualification: 'ETAM',
      dateEntree: new Date('2022-03-01'),
    },
  });

  const emp2 = await prisma.employe.create({
    data: {
      nom: 'Martin',
      prenom: 'Sophie',
      telephone: '06 23 45 67 89',
      email: 's.martin@dupont-batiment.fr',
      fonction: 'Maçon qualifiée',
      qualification: 'Ouvrier',
      dateEntree: new Date('2023-06-15'),
    },
  });

  // Contrats
  await prisma.contrat.create({
    data: {
      employeId: emp1.id,
      type: ContratType.CDI,
      dateDebut: new Date('2022-03-01'),
      poste: 'Chef de chantier',
      coefficient: 'ETAM 220',
      salaireBrut: 2800,
      dureeEssai: '2 mois',
      createdById: manager.id,
    },
  });

  // Copropriété
  const copro = await prisma.copropriete.create({
    data: {
      nom: 'Résidence Les Jardins',
      adresse: '12 rue des Jardins',
      codePostal: '92100',
      ville: 'Boulogne-Billancourt',
      nombreLots: 12,
      dateConstruction: new Date('2015-09-01'),
      syndicNom: 'Syndic Plus',
      syndicContact: '01 23 45 67 88 / syndic@plus.fr',
    },
  });

  // Lots
  await prisma.lot.createMany({
    data: [
      { coproprieteId: copro.id, numero: '1A', designation: 'RDC droite', tantiemes: 85, surface: 45, pointSituation: LotSituation.OK },
      { coproprieteId: copro.id, numero: '1B', designation: 'RDC gauche', tantiemes: 85, surface: 45, pointSituation: LotSituation.OK },
      { coproprieteId: copro.id, numero: '2A', designation: '1er étage droite', tantiemes: 92, surface: 52, pointSituation: LotSituation.TRAVAUX_EN_COURS, montantConsignation: 2500 },
      { coproprieteId: copro.id, numero: '2B', designation: '1er étage gauche', tantiemes: 92, surface: 52, pointSituation: LotSituation.A_CONTROLER },
      { coproprieteId: copro.id, numero: '3A', designation: '2e étage droite', tantiemes: 92, surface: 52, pointSituation: LotSituation.TRAVAUX_EN_COURS, montantConsignation: 3200 },
      { coproprieteId: copro.id, numero: '3B', designation: '2e étage gauche', tantiemes: 92, surface: 52, pointSituation: LotSituation.NON_COMMENCE },
      { coproprieteId: copro.id, numero: '4A', designation: '3e étage droite', tantiemes: 95, surface: 55, pointSituation: LotSituation.NON_COMMENCE },
      { coproprieteId: copro.id, numero: '4B', designation: '3e étage gauche', tantiemes: 95, surface: 55, pointSituation: LotSituation.TRAVAUX_EN_COURS, montantConsignation: 2800 },
    ],
  });

  // Diagnostics
  await prisma.diagnostic.createMany({
    data: [
      { coproprieteId: copro.id, type: DiagnosticType.AMIANTE_DAPP, dateRealisation: new Date('2024-01-15'), dateValidite: new Date('2029-01-15'), conclusion: 'CONFORME' },
      { coproprieteId: copro.id, type: DiagnosticType.PLOMB_CREP, dateRealisation: new Date('2024-01-15'), dateValidite: new Date('2029-01-15'), conclusion: 'CONFORME' },
      { coproprieteId: copro.id, type: DiagnosticType.ELECTRICITE, dateRealisation: new Date('2023-03-20'), dateValidite: new Date('2026-03-20'), conclusion: 'NON_CONFORME' },
      { coproprieteId: copro.id, type: DiagnosticType.GAZ, dateRealisation: new Date('2024-02-10'), dateValidite: new Date('2029-02-10'), conclusion: 'CONFORME' },
      { coproprieteId: copro.id, type: DiagnosticType.TERMITES, dateRealisation: new Date('2024-04-05'), dateValidite: new Date('2029-04-05'), conclusion: 'CONFORME' },
    ],
  });

  // Tâches Gantt
  await prisma.tacheGantt.createMany({
    data: [
      { nom: 'Démolition', chantierId: chantier1.id, createdById: admin.id, dateDebut: new Date('2026-06-01'), dateFin: new Date('2026-06-15'), couleur: '#2563eb', avancement: 100 },
      { nom: 'Maçonnerie', chantierId: chantier1.id, createdById: admin.id, dateDebut: new Date('2026-06-16'), dateFin: new Date('2026-07-10'), couleur: '#f59e0b', avancement: 80 },
      { nom: 'Électricité', chantierId: chantier1.id, createdById: admin.id, dateDebut: new Date('2026-07-11'), dateFin: new Date('2026-07-25'), couleur: '#10b981', avancement: 60 },
      { nom: 'Plomberie', chantierId: chantier1.id, createdById: admin.id, dateDebut: new Date('2026-07-11'), dateFin: new Date('2026-07-20'), couleur: '#3b82f6', avancement: 70 },
      { nom: 'Finitions', chantierId: chantier1.id, createdById: admin.id, dateDebut: new Date('2026-07-26'), dateFin: new Date('2026-08-10'), couleur: '#f59e0b', avancement: 20 },
    ],
  });

  console.log('✅ Seed completed successfully!');
  console.log('👤 Admin créé : admin@kritia.fr');
  console.log(`👤 Manager: manager@dupont-batiment.fr / manager123`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
