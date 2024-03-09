import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid'; // Assurez-vous d'installer uuid avec npm ou yarn

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

  async login(user: any) {
    const payload = { username: user.username, sub: user.userId };
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '15m', // Exemple d'expiration
    });

    const refreshToken = uuidv4(); // Générez un refresh token
    const refreshTokenExpiry = new Date();
    refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + 7); // Exemple de durée de vie du refresh token

    await this.userService.setRefreshToken(
      user.userId,
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
