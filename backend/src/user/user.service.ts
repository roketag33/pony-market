import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../tools/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { Role } from './enums/user.enums';
import * as bcrypt from 'bcrypt';
@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = {
      ...createUserDto,
      password: hashedPassword,
      role: Role.USER,
    };

    try {
      return await this.prisma.user.create({
        data: user,
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new BadRequestException(
          'Un utilisateur avec cet e-mail existe déjà.',
        );
      }
      throw new BadRequestException(
        "Une erreur est survenue lors de la création de l'utilisateur.",
      );
    }
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
}
