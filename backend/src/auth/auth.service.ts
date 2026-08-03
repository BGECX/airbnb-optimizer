import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { createHash, randomBytes } from 'crypto';
import { RegisterDto, LoginDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto, metadata?: TokenMetadata) {
    const email = dto.email.trim().toLowerCase();
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) throw new ConflictException('Email déjà utilisé');

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName: dto.firstName,
        lastName: dto.lastName,
      },
      select: { id: true, email: true, firstName: true, lastName: true, role: true },
    });

    const tokens = await this.issueTokens(user.id, user.email, user.role, metadata);
    return { user, ...tokens };
  }

  async login(dto: LoginDto, metadata?: TokenMetadata) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email.trim().toLowerCase() } });
    if (!user || !user.isActive) throw new UnauthorizedException('Identifiants invalides');

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('Identifiants invalides');

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const tokens = await this.issueTokens(user.id, user.email, user.role, metadata);
    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      ...tokens,
    };
  }

  async me(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, firstName: true, lastName: true, role: true, avatarUrl: true, phone: true },
    });
  }

  private async generateToken(userId: string, email: string, role: string) {
    return this.jwtService.sign({ sub: userId, email, role });
  }

  async refresh(rawToken: string, metadata?: TokenMetadata) {
    const tokenHash = this.hashToken(rawToken);
    const stored = await this.prisma.refreshToken.findUnique({ where: { tokenHash }, include: { user: true } });
    if (!stored || stored.revokedAt || stored.expiresAt <= new Date() || !stored.user.isActive) throw new UnauthorizedException('Session invalide');
    const nextRawToken = randomBytes(48).toString('base64url');
    const nextHash = this.hashToken(nextRawToken);
    const expiresAt = this.refreshExpiry();
    const next = await this.prisma.$transaction(async (tx) => {
      const created = await tx.refreshToken.create({ data: { userId: stored.userId, tokenHash: nextHash, expiresAt, ...metadata } });
      const revoked = await tx.refreshToken.updateMany({ where: { id: stored.id, revokedAt: null }, data: { revokedAt: new Date(), replacedById: created.id } });
      if (revoked.count !== 1) throw new UnauthorizedException('Session déjà renouvelée');
      return created;
    });
    return { accessToken: await this.generateToken(stored.user.id, stored.user.email, stored.user.role), refreshToken: nextRawToken, refreshTokenExpiresAt: next.expiresAt };
  }

  async logout(rawToken: string) {
    await this.prisma.refreshToken.updateMany({ where: { tokenHash: this.hashToken(rawToken), revokedAt: null }, data: { revokedAt: new Date() } });
    return { success: true };
  }

  async logoutAll(userId: string) {
    const result = await this.prisma.refreshToken.updateMany({ where: { userId, revokedAt: null }, data: { revokedAt: new Date() } });
    return { success: true, sessionsRevoked: result.count };
  }

  private async issueTokens(userId: string, email: string, role: string, metadata?: TokenMetadata) {
    const refreshToken = randomBytes(48).toString('base64url');
    const stored = await this.prisma.refreshToken.create({ data: { userId, tokenHash: this.hashToken(refreshToken), expiresAt: this.refreshExpiry(), ...metadata } });
    const accessToken = await this.generateToken(userId, email, role);
    return { accessToken, token: accessToken, refreshToken, refreshTokenExpiresAt: stored.expiresAt };
  }

  private hashToken(token: string) { return createHash('sha256').update(token).digest('hex'); }
  private refreshExpiry() { const date = new Date(); date.setUTCDate(date.getUTCDate() + Number(process.env.REFRESH_TOKEN_DAYS ?? 30)); return date; }
}

type TokenMetadata = { userAgent?: string; adresseIp?: string };
