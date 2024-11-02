import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseIntPipe,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { UserService } from './user.service';
import { CreateUserdto } from './dto/create-user.dto';
import { UserResponsedto } from './dto/Responses/user-response.dto';
import { ListUsersResponsedto } from './dto/Responses/list-users-response.dto';
import { DeleteUserResponsedto } from './dto/Responses/delete-user-response.dto';
import { JwtAuthGuard, RolesGuard } from '@/tools/common/guards';
import { Roles } from '@/tools/common/decorators';
import { Role } from '@prisma/client';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
  private readonly logger = new Logger(UserController.name);

  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiOperation({ summary: 'Créer un nouvel utilisateur' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Utilisateur créé avec succès',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Données invalides',
  })
  @Throttle({ short: { ttl: 60000, limit: 5 } }) // Limite la création de comptes
  async create(@Body() createUserdto: CreateUserdto) {
    this.logger.log(`Tentative de création d'un utilisateur`);
    return this.userService.create(createUserdto);
  }

  @Get()
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Récupérer tous les utilisateurs' })
  @ApiResponse({ status: HttpStatus.OK, type: ListUsersResponsedto })
  @Throttle({ medium: { ttl: 300000, limit: 100 } })
  async findAll(): Promise<ListUsersResponsedto> {
    this.logger.log('Récupération de tous les utilisateurs');
    return this.userService.findAll();
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Récupérer un utilisateur par son ID' })
  @ApiResponse({ status: HttpStatus.OK, type: UserResponsedto })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Utilisateur non trouvé',
  })
  @Throttle({ short: { ttl: 60000, limit: 10 } })
  async findOne(
    @Param(
      'id',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST }),
    )
    id: number,
  ): Promise<UserResponsedto> {
    this.logger.log(`Récupération de l'utilisateur avec l'ID: ${id}`);
    return this.userService.findOne(id);
  }

  @Put(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mettre à jour un utilisateur' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Utilisateur mis à jour avec succès',
  })
  @Throttle({ short: { ttl: 60000, limit: 5 } })
  async update(
    @Param(
      'id',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST }),
    )
    id: number,
    @Body() updateUserdto: CreateUserdto,
  ) {
    this.logger.log(`Mise à jour de l'utilisateur avec l'ID: ${id}`);
    return this.userService.update(id, updateUserdto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Supprimer un utilisateur' })
  @ApiResponse({ status: HttpStatus.OK, type: DeleteUserResponsedto })
  @Throttle({ medium: { ttl: 300000, limit: 20 } })
  async remove(
    @Param(
      'id',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST }),
    )
    id: number,
  ): Promise<DeleteUserResponsedto> {
    this.logger.log(`Suppression de l'utilisateur avec l'ID: ${id}`);
    return this.userService.remove(id);
  }

  @Post('request-reset-password')
  @ApiOperation({ summary: 'Demander une réinitialisation de mot de passe' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Email de réinitialisation envoyé',
  })
  @Throttle({ short: { ttl: 300000, limit: 3 } }) // Limite stricte pour éviter les abus
  async requestResetPassword(@Body('email') email: string) {
    this.logger.log('Demande de réinitialisation de mot de passe');
    return this.userService.requestPasswordReset(email);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Réinitialiser le mot de passe' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Mot de passe réinitialisé avec succès',
  })
  @Throttle({ short: { ttl: 300000, limit: 3 } }) // Limite stricte pour éviter les abus
  async resetPassword(
    @Body('resetToken') resetToken: string,
    @Body('newPassword') newPassword: string,
  ) {
    this.logger.log('Réinitialisation de mot de passe');
    return this.userService.resetPassword(resetToken, newPassword);
  }
}
