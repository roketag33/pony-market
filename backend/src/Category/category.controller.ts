import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategorydto } from './dto/create-category.dto';
import { JwtAuthGuard } from '../tools/common/guards/jwt-auth.guard';
import { RolesGuard } from '../tools/common/guards/roles.guard';
import { Role } from '../user/enums/user.enums';
import { Roles } from '../tools/common/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Roles(Role.ADMIN)
  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createCategorydto: CreateCategorydto) {
    return this.categoryService.createCategory(createCategorydto);
  }
  @Get()
  findAll(@Query() query) {
    return this.categoryService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoryService.findOne(+id);
  }

  @Roles(Role.ADMIN)
  @Put(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @Body() updateCategorydto: CreateCategorydto,
  ) {
    return this.categoryService.update(+id, updateCategorydto);
  }

  @Roles(Role.ADMIN)
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.categoryService.remove(+id);
  }
}
