import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../tools/prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { Role } from '../user/enums/user.enums'; // Assurez-vous que le chemin d'importation de l'enum Role est correct

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, createProductDto: CreateProductDto) {
    return this.prisma.product.create({
      data: {
        ...createProductDto,
        userId,
      },
    });
  }

  async findAll() {
    return this.prisma.product.findMany();
  }

  async findOne(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });
    if (!product) {
      throw new NotFoundException(`Product with ID "${id}" not found`);
    }
    return product;
  }

  async update(userId: number, id: number, updateProductDto: CreateProductDto) {
    const product = await this.prisma.product.findUnique({ where: { id } });

    if (!product) {
      throw new NotFoundException(`Product with ID "${id}" not found`);
    }

    if (product.userId !== userId && !(await this.isAdmin(userId))) {
      throw new UnauthorizedException(
        "You don't have permission to update this product",
      );
    }

    return this.prisma.product.update({
      where: { id },
      data: updateProductDto,
    });
  }

  async remove(userId: number, id: number) {
    const product = await this.prisma.product.findUnique({ where: { id } });

    if (!product) {
      throw new NotFoundException(`Product with ID "${id}" not found`);
    }

    if (product.userId !== userId && !(await this.isAdmin(userId))) {
      throw new UnauthorizedException(
        "You don't have permission to delete this product",
      );
    }

    await this.prisma.product.delete({ where: { id } });
    return { message: 'Product deleted successfully' };
  }

  private async isAdmin(userId: number): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    return user?.role === Role.ADMIN;
  }
}
