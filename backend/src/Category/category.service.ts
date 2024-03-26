import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { CreateCategorydto } from './dto/create-category.dto';
import { PrismaService } from '../tools/prisma/prisma.service';

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) {}

  async createCategory(createCategorydto: CreateCategorydto) {
    const { name, parentId } = createCategorydto;

    const existingCategory = await this.prisma.category.findUnique({
      where: { name },
    });

    if (existingCategory) {
      throw new ConflictException('Une catégorie avec ce nom existe déjà.');
    }

    if (parentId !== undefined) {
      const parentCategory = await this.prisma.category.findUnique({
        where: { id: parentId },
      });

      if (!parentCategory) {
        throw new NotFoundException(
          `Catégorie parente avec l'ID "${parentId}" non trouvée.`,
        );
      }
    }

    return this.prisma.category.create({
      data: {
        name,
        parentId: parentId || null,
      },
    });
  }

  async findAll(query: any) {
    const { page = 1, limit = 10, name } = query;
    const where = name
      ? {
          name: {
            contains: name,
            mode: 'insensitive' as const,
          },
        }
      : {};

    const categories = await this.prisma.category.findMany({
      where,
      skip: (page - 1) * limit,
      take: +limit,
      include: {
        children: true,
      },
    });

    const total = await this.prisma.category.count({ where });
    const totalPages = Math.ceil(total / limit);

    return {
      data: categories,
      total,
      page,
      totalPages,
    };
  }

  async findOne(id: number) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        children: true,
      },
    });

    if (!category) {
      throw new NotFoundException(`Catégorie avec l'ID "${id}" non trouvée.`);
    }

    return category;
  }

  async update(id: number, updateCategorydto: CreateCategorydto) {
    try {
      return await this.prisma.category.update({
        where: { id },
        data: updateCategorydto,
      });
    } catch (error) {
      throw new ConflictException(
        'Mise à jour impossible. Le nom de la catégorie est peut-être déjà utilisé.',
      );
    }
  }

  async remove(id: number) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) {
      throw new NotFoundException(`Catégorie avec l'ID "${id}" non trouvée.`);
    }

    const associatedProducts = await this.prisma.product.findMany({
      where: { categoryId: id },
    });
    const childCategories = await this.prisma.category.findMany({
      where: { parentId: id },
    });

    if (associatedProducts.length > 0 || childCategories.length > 0) {
      throw new ConflictException(
        'Cette catégorie contient des produits ou des sous-catégories et ne peut pas être supprimée.',
      );
    }

    return this.prisma.category.delete({
      where: { id },
    });
  }
}
