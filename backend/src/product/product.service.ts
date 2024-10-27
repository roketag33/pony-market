import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../tools/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { CreateProductDto } from './dto/requests/create-product-request.dto';
import { UpdateProductDto } from './dto/requests/update-product.dto';
import { ProductResponseDto } from './dto/responses/product-response.dto';
import { Prisma, ProductCondition, Role } from '@prisma/client'; // Ajout de ProductCondition ici
import * as fs from 'fs';

@Injectable()
export class ProductService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  async create(
    userId: number,
    createProductDto: CreateProductDto,
    imageFiles: Express.Multer.File[],
  ): Promise<ProductResponseDto> {
    // Vérifier la catégorie si fournie
    if (createProductDto.categoryId) {
      const category = await this.prisma.category.findUnique({
        where: { id: createProductDto.categoryId },
      });
      if (!category) {
        throw new BadRequestException('Category not found');
      }
    }

    // Vérifier et traiter les images
    if (!imageFiles || imageFiles.length === 0) {
      throw new BadRequestException('At least one image is required');
    }
    if (imageFiles.length > 10) {
      throw new BadRequestException('Maximum 10 images allowed');
    }

    const imagePaths = imageFiles.map((file) => file.path.split('uploads/')[1]);

    try {
      const product = await this.prisma.product.create({
        data: {
          ...createProductDto,
          userId,
          images: imagePaths,
        },
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatarUrl: true,
            },
          },
        },
      });

      return this.mapProductToResponse(product);
    } catch (error) {
      // Supprimer les images en cas d'erreur
      imagePaths.forEach((path) => {
        try {
          fs.unlinkSync(`uploads/${path}`);
        } catch (e) {
          console.error(`Failed to delete image: ${path}`, e);
        }
      });

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('Product with this name already exists');
        }
      }
      throw new InternalServerErrorException('Failed to create product');
    }
  }

  async findAll(query: {
    page?: number;
    limit?: number;
    category?: number;
    condition?: ProductCondition;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
    userId?: number;
  }): Promise<{ data: ProductResponseDto[]; total: number; pages: number }> {
    const {
      page = 1,
      limit = 10,
      category,
      condition,
      minPrice,
      maxPrice,
      search,
      userId,
    } = query;

    const where: Prisma.ProductWhereInput = {
      isAvailable: true,
      ...(category && { categoryId: category }),
      ...(condition && { condition }),
      ...(minPrice && { price: { gte: minPrice } }),
      ...(maxPrice && { price: { lte: maxPrice } }),
      ...(userId && { userId }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data: products.map(this.mapProductToResponse),
      total,
      pages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number): Promise<ProductResponseDto> {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID "${id}" not found`);
    }

    return this.mapProductToResponse(product);
  }

  async update(
    userId: number,
    id: number,
    updateProductDto: UpdateProductDto,
    imageFiles?: Express.Multer.File[],
  ) {
    const product = await this.prisma.product.findUnique({ where: { id } });

    if (!product) {
      throw new NotFoundException(`Product with ID "${id}" not found`);
    }

    if (product.userId !== userId && !(await this.isAdmin(userId))) {
      throw new UnauthorizedException(
        "You don't have permission to update this product",
      );
    }

    // Traiter les nouvelles images si fournies
    let imagePaths = product.images;
    if (imageFiles && imageFiles.length > 0) {
      // Supprimer les anciennes images
      product.images.forEach((path) => {
        try {
          fs.unlinkSync(`uploads/${path}`);
        } catch (e) {
          console.error(`Failed to delete image: ${path}`, e);
        }
      });

      imagePaths = imageFiles.map((file) => file.path.split('uploads/')[1]);
    }

    try {
      const updatedProduct = await this.prisma.product.update({
        where: { id },
        data: {
          ...updateProductDto,
          ...(imageFiles && { images: imagePaths }),
        },
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatarUrl: true,
            },
          },
        },
      });

      return this.mapProductToResponse(updatedProduct);
    } catch (error) {
      if (imageFiles) {
        // Supprimer les nouvelles images en cas d'erreur
        imagePaths.forEach((path) => {
          try {
            fs.unlinkSync(`uploads/${path}`);
          } catch (e) {
            console.error(`Failed to delete image: ${path}`, e);
          }
        });
      }
      throw new InternalServerErrorException('Failed to update product');
    }
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

    // Supprimer les images
    product.images.forEach((path) => {
      try {
        fs.unlinkSync(`uploads/${path}`);
      } catch (e) {
        console.error(`Failed to delete image: ${path}`, e);
      }
    });

    await this.prisma.product.delete({ where: { id } });
    return { message: 'Product deleted successfully' };
  }

  private async isAdmin(userId: number): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    return user?.role === Role.ADMIN;
  }

  private mapProductToResponse(product: any): ProductResponseDto {
    return {
      ...product,
      images: product.images.map(
        (image) => `${this.configService.get('BASE_URL')}/uploads/${image}`,
      ),
    };
  }
}
