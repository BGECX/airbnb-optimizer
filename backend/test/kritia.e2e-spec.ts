import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { FactureStatut, UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { FacturesService } from '../src/factures/factures.service';

describe('KRITIA API avec PostgreSQL', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let facturesService: FacturesService;
  let baseUrl: string;
  const suffix = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const adminEmail = `admin-e2e-${suffix}@kritia.test`;
  const userEmail = `user-e2e-${suffix}@kritia.test`;
  const password = 'TestSolide2026';

  beforeAll(async () => {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl || !new URL(databaseUrl).pathname.replace(/^\//, '').endsWith('_test')) {
      throw new Error('Les tests e2e refusent toute base dont le nom ne se termine pas par _test');
    }
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication({ rawBody: true });
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    app.setGlobalPrefix('api');
    await app.listen(0, '127.0.0.1');
    baseUrl = await app.getUrl();
    prisma = app.get(PrismaService);
    facturesService = app.get(FacturesService);
    await prisma.user.create({
      data: { email: adminEmail, password: await bcrypt.hash(password, 4), firstName: 'Admin', lastName: 'E2E', role: UserRole.ADMIN },
    });
  });

  afterAll(async () => {
    await app?.close();
  });

  async function request(path: string, options: RequestInit = {}) {
    const response = await fetch(`${baseUrl}/api${path}`, {
      ...options,
      headers: { 'content-type': 'application/json', ...options.headers },
    });
    const body = await response.json();
    return { status: response.status, body };
  }

  async function login(email: string) {
    const response = await request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
    expect(response.status).toBe(201);
    return response.body.accessToken as string;
  }

  it('sécurise inscription, connexion, refresh et permissions', async () => {
    const registration = await request('/auth/register', {
      method: 'POST', body: JSON.stringify({ email: userEmail, password, firstName: 'User', lastName: 'E2E' }),
    });
    expect(registration.status).toBe(201);
    expect(registration.body.user.role).toBe('USER');

    const refreshed = await request('/auth/refresh', {
      method: 'POST', body: JSON.stringify({ refreshToken: registration.body.refreshToken }),
    });
    expect(refreshed.status).toBe(201);
    expect(refreshed.body.refreshToken).not.toBe(registration.body.refreshToken);

    const reuse = await request('/auth/refresh', {
      method: 'POST', body: JSON.stringify({ refreshToken: registration.body.refreshToken }),
    });
    expect(reuse.status).toBe(401);

    const forbidden = await request('/clients', {
      method: 'POST', headers: { authorization: `Bearer ${registration.body.accessToken}` },
      body: JSON.stringify({ type: 'ENTREPRISE', nom: 'Interdit' }),
    });
    expect(forbidden.status).toBe(403);
  });

  it('crée des numéros uniques et transforme un devis une seule fois', async () => {
    const token = await login(adminEmail);
    const clientResponse = await request('/clients', {
      method: 'POST', headers: { authorization: `Bearer ${token}` },
      body: JSON.stringify({ type: 'ENTREPRISE', nom: `Client E2E ${suffix}`, adresse: '1 rue du Test', siret: '12345678900012' }),
    });
    expect(clientResponse.status).toBe(201);
    const clientId = clientResponse.body.id as string;

    const quotePayload = { clientId, objet: 'Travaux test', dateValidite: '2027-01-01', tauxTva: 20, lignes: [{ designation: 'Ouvrage', unite: 'u', quantite: 2, prixUnitaireHt: 100 }] };
    const first = await request('/devis', { method: 'POST', headers: { authorization: `Bearer ${token}` }, body: JSON.stringify(quotePayload) });
    const second = await request('/devis', { method: 'POST', headers: { authorization: `Bearer ${token}` }, body: JSON.stringify(quotePayload) });
    expect(first.status).toBe(201);
    expect(second.status).toBe(201);
    expect(first.body.numero).not.toBe(second.body.numero);

    for (const statut of ['ENVOYE', 'ACCEPTE']) {
      const transition = await request(`/devis/${first.body.id}`, { method: 'PATCH', headers: { authorization: `Bearer ${token}` }, body: JSON.stringify({ statut }) });
      expect(transition.status).toBe(200);
    }
    const invoice = await request(`/devis/${first.body.id}/facture`, {
      method: 'POST', headers: { authorization: `Bearer ${token}` }, body: JSON.stringify({ dateEcheance: '2027-02-01' }),
    });
    expect(invoice.status).toBe(201);
    expect(invoice.body.sourceDevisId).toBe(first.body.id);
    expect(Number(invoice.body.totalTtc)).toBe(240);

    const duplicate = await request(`/devis/${first.body.id}/facture`, {
      method: 'POST', headers: { authorization: `Bearer ${token}` }, body: JSON.stringify({ dateEcheance: '2027-02-01' }),
    });
    expect(duplicate.status).toBe(400);
  });

  it('garantit la numérotation et la transformation sous concurrence', async () => {
    const token = await login(adminEmail);
    const client = await request('/clients', {
      method: 'POST', headers: { authorization: `Bearer ${token}` },
      body: JSON.stringify({ type: 'ENTREPRISE', nom: `Concurrence ${suffix}`, adresse: '2 rue du Test', siret: '12345678900020' }),
    });
    const payload = { clientId: client.body.id, objet: 'Concurrence', dateValidite: '2027-01-01', lignes: [{ designation: 'Poste', unite: 'u', quantite: 1, prixUnitaireHt: 10 }] };
    const devis = await Promise.all(Array.from({ length: 8 }, () => request('/devis', {
      method: 'POST', headers: { authorization: `Bearer ${token}` }, body: JSON.stringify(payload),
    })));
    expect(devis.every(({ status }) => status === 201)).toBe(true);
    expect(new Set(devis.map(({ body }) => body.numero)).size).toBe(8);

    for (const statut of ['ENVOYE', 'ACCEPTE']) await request(`/devis/${devis[0].body.id}`, {
      method: 'PATCH', headers: { authorization: `Bearer ${token}` }, body: JSON.stringify({ statut }),
    });
    const transformations = await Promise.all([
      request(`/devis/${devis[0].body.id}/facture`, { method: 'POST', headers: { authorization: `Bearer ${token}` }, body: JSON.stringify({ dateEcheance: '2027-02-01' }) }),
      request(`/devis/${devis[0].body.id}/facture`, { method: 'POST', headers: { authorization: `Bearer ${token}` }, body: JSON.stringify({ dateEcheance: '2027-02-01' }) }),
    ]);
    expect(transformations.map(({ status }) => status).sort()).toEqual([201, 400]);
  });

  it('empêche les dépassements concurrents de paiements et d’avoirs', async () => {
    const admin = await prisma.user.findUniqueOrThrow({ where: { email: adminEmail } });
    const client = await prisma.client.create({ data: { type: 'ENTREPRISE', nom: `Finance ${suffix}` } });
    const invoice = await prisma.facture.create({
      data: { numero: `TEST-${suffix}`, clientId: client.id, objet: 'Concurrence financière', dateEcheance: new Date('2027-02-01'), totalHt: 100, totalTva: 20, totalTtc: 120, statut: FactureStatut.ENVOYEE, createdById: admin.id },
    });
    const payments = await Promise.allSettled([
      facturesService.registerPayment(invoice.id, { montant: 80, date: '2027-01-10', mode: 'VIREMENT' }),
      facturesService.registerPayment(invoice.id, { montant: 80, date: '2027-01-10', mode: 'VIREMENT' }),
    ]);
    expect(payments.filter(({ status }) => status === 'fulfilled')).toHaveLength(1);
    expect(Number((await prisma.facture.findUniqueOrThrow({ where: { id: invoice.id } })).montantPaye)).toBe(80);

    const credits = await Promise.allSettled([
      facturesService.createAvoir(invoice.id, { montantHt: 70, motif: 'Correction A' }),
      facturesService.createAvoir(invoice.id, { montantHt: 70, motif: 'Correction B' }),
    ]);
    expect(credits.filter(({ status }) => status === 'fulfilled')).toHaveLength(1);
    const totalCredited = (await prisma.avoir.findMany({ where: { factureId: invoice.id } })).reduce((sum, avoir) => sum + Number(avoir.montantHt), 0);
    expect(totalCredited).toBe(70);
  });

  it('limite les données financières et les chantiers au périmètre du rôle', async () => {
    const userToken = await login(userEmail);
    expect((await request('/factures', { headers: { authorization: `Bearer ${userToken}` } })).status).toBe(403);
    expect((await request('/devis', { headers: { authorization: `Bearer ${userToken}` } })).status).toBe(403);
    const userSites = await request('/chantiers', { headers: { authorization: `Bearer ${userToken}` } });
    expect(userSites.status).toBe(200);
    expect(userSites.body).toEqual([]);

    const chefEmail = `chef-e2e-${suffix}@kritia.test`;
    const chef = await prisma.user.create({ data: { email: chefEmail, password: await bcrypt.hash(password, 4), firstName: 'Chef', lastName: 'E2E', role: UserRole.CHEF_CHANTIER } });
    const client = await prisma.client.create({ data: { type: 'ENTREPRISE', nom: `Périmètre ${suffix}` } });
    const assigned = await prisma.chantier.create({ data: { reference: `SCOPE-A-${suffix}`, clientId: client.id, objet: 'Affecté', responsableId: chef.id } });
    const hidden = await prisma.chantier.create({ data: { reference: `SCOPE-H-${suffix}`, clientId: client.id, objet: 'Masqué' } });
    const chefToken = await login(chefEmail);
    const visible = await request('/chantiers', { headers: { authorization: `Bearer ${chefToken}` } });
    expect(visible.body.map(({ id }: { id: string }) => id)).toContain(assigned.id);
    expect(visible.body.map(({ id }: { id: string }) => id)).not.toContain(hidden.id);
    expect((await request(`/chantiers/${hidden.id}`, { headers: { authorization: `Bearer ${chefToken}` } })).status).toBe(404);
    expect((await request(`/chantiers/${hidden.id}`, { method: 'PATCH', headers: { authorization: `Bearer ${chefToken}` }, body: JSON.stringify({ avancement: 10 }) })).status).toBe(403);
  });
});
