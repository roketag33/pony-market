import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid'; // Assurez-vous d'installer uuid avec npm ou yarn
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
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

  // AuthService - Méthode login mise à jour
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
      secret: process.env.JWT_SECRET, // Assurez-vous que la clé secrète est bien définie
      expiresIn: '60m', // Durée de vie du token d'accès
    });

    const refreshToken = uuidv4();
    const refreshTokenExpiry = new Date();
    refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + 7); // Expiration dans 7 jours

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
      expiresIn: '15m', // Nouvelle expiration
    });

    // Générez un nouveau refresh token pour chaque rafraîchissement (optionnel)
    const newRefreshToken = uuidv4();
    const newRefreshTokenExpiry = new Date();
    newRefreshTokenExpiry.setDate(newRefreshTokenExpiry.getDate() + 7); // Nouvelle durée de vie

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
    // Vous pourriez ajouter d'autres logiques pour gérer la déconnexion, si nécessaire
  }
}
