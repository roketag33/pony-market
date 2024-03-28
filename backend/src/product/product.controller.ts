import {
  Controller,
  UseGuards,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Get,
  UseInterceptors,
  UploadedFiles,
  Request,
  Req,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ProductService } from './product.service';
import { CreateProductdto } from './dto/requests/create-product-request.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { diskStorage } from 'multer';
import { extname } from 'path';

@UseGuards(JwtAuthGuard)
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @UseInterceptors(
    FilesInterceptor('images', 20, {
      storage: diskStorage({
        destination: './uploads/products',
        filename: (req, file, callback) => {
          const name = file.originalname.split('.')[0];
          const fileExtName = extname(file.originalname);
          const randomName = Array(4)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          callback(null, `${name}-${randomName}${fileExtName}`);
        },
      }),
    }),
  )
  async create(
    @Req() req,
    @Body() createProductdto: CreateProductdto,
    @UploadedFiles() images: Array<Express.Multer.File>,
  ) {
    const userId = req.user.userId;
    return this.productService.create(userId, createProductdto, images);
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
    @Body() updateProductdto: CreateProductdto,
    @Request() req: any,
  ) {
    return this.productService.update(req.user.userId, +id, updateProductdto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: any) {
    return this.productService.remove(req.user.userId, +id);
  }
}
