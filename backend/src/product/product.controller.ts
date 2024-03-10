// src/product/product.controller.ts

import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; // Assurez-vous que le chemin est correct

@UseGuards(JwtAuthGuard) // Appliquez JwtAuthGuard à tout le contrôleur si toutes les routes nécessitent une authentification
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  create(@Body() createProductDto: CreateProductDto, @Request() req: any) {
    // Supposons que req.user contienne l'ID de l'utilisateur (req.user.userId)
    return this.productService.create(req.user.userId, createProductDto);
  }

  @Get()
  findAll() {
    return this.productService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productService.findOne(+id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateProductDto: CreateProductDto,
    @Request() req: any,
  ) {
    return this.productService.update(req.user.userId, +id, updateProductDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: any) {
    return this.productService.remove(req.user.userId, +id);
  }
}
