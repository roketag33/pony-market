import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { LoginDto } from './dto/login.dto';
import { PrismaService } from 'src/tools/prisma/prisma.service';
import { randomBytes } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.userService.findOneByEmail(email);
    if (user && (await bcrypt.compare(pass, user.password))) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, refreshToken, refreshTokenExpiry, ...result } = user;
      return result;
    }
    throw new UnauthorizedException('Informations de connexion incorrectes.');
  }

  async login(loginDto: LoginDto) {
    const user = await this.userService.findOneByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Email ou mot de passe incorrect.');
    }

    const passwordIsValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!passwordIsValid) {
      throw new UnauthorizedException('Email ou mot de passe incorrect.');
    }

    const payload = { email: user.email, sub: user.id };
    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '60m',
    });

    const refreshToken = uuidv4();
    const refreshTokenExpiry = new Date();
    refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + 7);

    await this.userService.setRefreshToken(
      user.id,
      refreshToken,
      refreshTokenExpiry,
    );

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async refreshToken(refreshToken: string) {
    const user = await this.userService.validateRefreshToken(refreshToken);
    const payload = { email: user.email, sub: user.id };
    const newAccessToken = this.jwtService.sign(payload, {
      expiresIn: '15m',
    });

    const newRefreshToken = uuidv4();
    const newRefreshTokenExpiry = new Date();
    newRefreshTokenExpiry.setDate(newRefreshTokenExpiry.getDate() + 7);

    await this.userService.setRefreshToken(
      user.id,
      newRefreshToken,
      newRefreshTokenExpiry,
    );

    return {
      access_token: newAccessToken,
      refresh_token: newRefreshToken,
    };
  }

  async logout(userId: number) {
    await this.userService.clearRefreshToken(userId);
  }

  private async findOrCreate(profile: any) {
    const email = profile.emails[0].value;
    let user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      const randomPassword = randomBytes(16).toString('hex');

      user = await this.prisma.user.create({
        data: {
          email,
          firstName: profile.name.givenName,
          lastName: profile.name.familyName,
          password: randomPassword,
        },
      });
    }

    return user;
  }

  async validateOAuthLogin(profile: any): Promise<string> {
    const user = await this.findOrCreate(profile);

    const payload = { email: user.email, sub: user.id };
    return this.jwtService.sign(payload);
  }
}
