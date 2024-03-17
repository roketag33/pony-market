import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../tools/prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { Role } from '../user/enums/user.enums';

@Injectable()
export class ProductService {
  private readonly baseUrl: string =
    process.env.BASE_URL || 'http://monapplication.com';

  constructor(private prisma: PrismaService) {}

  async create(
    userId: number,
    createProductDto: CreateProductDto,
    imageFiles: Express.Multer.File[],
  ) {
    if (!imageFiles || imageFiles.length === 0) {
      throw new BadRequestException('No images provided');
    }

    const imagePaths = imageFiles.map((file) => file.path);

    try {
      return await this.prisma.product.create({
        data: {
          ...createProductDto,
          userId,
          images: imagePaths,
        },
      });
    } catch (error) {
      console.error('Error creating product:', error);
      throw new InternalServerErrorException('Failed to create product');
    }
  }

  async findAll() {
    const products = await this.prisma.product.findMany();
    return products.map((product) => ({
      ...product,
      images: product.images.map((image) => `${this.baseUrl}/uploads/${image}`),
    }));
  }

  async findOne(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID "${id}" not found`);
    }

    return {
      ...product,
      images: product.images.map((image) => `${this.baseUrl}/uploads/${image}`),
    };
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
