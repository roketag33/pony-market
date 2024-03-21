import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../tools/prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { CreateUserDto } from './dto/create-user.dto';
import { Role } from './enums/user.enums';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';
import * as handlebars from 'handlebars';
import { v4 as uuidv4 } from 'uuid';
import { addHours } from 'date-fns';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = {
      ...createUserDto,
      password: hashedPassword,
      role: Role.USER,
    };

    let newUser;
    try {
      newUser = await this.prisma.user.create({ data: user });

      const templateSource = fs.readFileSync(
        path.join(
          __dirname,
          '..',
          'mail',
          'templates',
          'welcome-email.handlebars',
        ),
        'utf8',
      );
      const template = handlebars.compile(templateSource);
      const htmlToSend = template({
        username: newUser.firstName || 'Utilisateur',
      });

      try {
        await this.mailService.sendEmail(
          newUser.email,
          'Bienvenue sur notre plateforme !',
          'Votre compte a été créé avec succès.',
          htmlToSend,
        );
      } catch (mailError) {
        console.error("Erreur lors de l'envoi de l'email :", mailError);
      }
    } catch (error) {
      if (error.code === 'P2002') {
        throw new BadRequestException(
          'Un utilisateur avec cet e-mail existe déjà.',
        );
      } else if (error instanceof Error && error.message.includes('ENOENT')) {
        throw new InternalServerErrorException(
          "Le template d'email n'a pas été trouvé.",
        );
      } else {
        console.error("Erreur lors de la création de l'utilisateur :", error);
        throw new InternalServerErrorException(
          'Une erreur inattendue est survenue lors de la création du compte.',
        );
      }
    }

    return newUser;
  }

  async findAll() {
    return this.prisma.user.findMany();
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }
    return user;
  }

  async update(id: number, updateUserDto: CreateUserDto) {
    try {
      return await this.prisma.user.update({
        where: { id },
        data: updateUserDto,
      });
    } catch (error) {
      throw new NotFoundException(
        `Could not find user with ID "${id}" to update`,
      );
    }
  }

  async remove(id: number) {
    try {
      return await this.prisma.user.delete({
        where: { id },
      });
    } catch (error) {
      throw new NotFoundException(
        `Could not find user with ID "${id}" to delete`,
      );
    }
  }
  async findOneByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }
  async setRefreshToken(
    userId: number,
    refreshToken: string,
    refreshTokenExpiry: Date,
  ) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken, refreshTokenExpiry },
    });
  }

  async validateRefreshToken(refreshToken: string) {
    const user = await this.prisma.user.findUnique({
      where: { refreshToken },
    });

    if (
      !user ||
      !user.refreshTokenExpiry ||
      user.refreshTokenExpiry < new Date()
    ) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    return user;
  }

  async clearRefreshToken(userId: number) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null, refreshTokenExpiry: null },
    });
  }
  async requestPasswordReset(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    const resetToken = uuidv4();
    const resetTokenExpiry = addHours(new Date(), 1); // Le token expire dans 1 heure

    await this.prisma.user.update({
      where: { email },
      data: { resetToken, resetTokenExpiry },
    });

    const resetLink = `${process.env.BASE_URL}/reset-password?token=${resetToken}`;
    await this.mailService.sendPasswordResetEmail(
      user.email,
      user.firstName || 'Cher utilisateur',
      resetLink,
    );
  }

  // Méthode pour réinitialiser le mot de passe
  async resetPassword(resetToken: string, newPassword: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        resetToken,
        resetTokenExpiry: { gt: new Date() },
      },
    });

    if (!user) {
      throw new BadRequestException(
        'Token de réinitialisation invalide ou expiré',
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });
  }
}
