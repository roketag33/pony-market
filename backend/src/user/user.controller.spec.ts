import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from '../tools/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import { Role, Status } from './enums/user.enums';
jest.mock('bcrypt');

describe('UserService', () => {
  let service: UserService;
  let prismaServiceMock: Partial<PrismaService>;

  beforeEach(async () => {
    prismaServiceMock = {
      user: {
        create: jest
          .fn()
          .mockImplementation((dto) =>
            Promise.resolve({ id: Date.now(), ...dto.data }),
          ),
        findMany: jest.fn().mockResolvedValue([]),
        findUnique: jest.fn().mockResolvedValue(null),
        update: jest
          .fn()
          .mockImplementation((dto) => Promise.resolve({ ...dto.data })),
        delete: jest.fn().mockResolvedValue({}),
      },
    } as unknown as PrismaClient;

    (bcrypt.hash as jest.Mock) = jest.fn().mockResolvedValue('hashedPassword');

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: PrismaService, useValue: prismaServiceMock },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user with hashed password', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        password: 'testPassword',
        role: Role.USER,
        status: Status.ACTIVE,
      };
      const result = await service.create(createUserDto);

      expect(prismaServiceMock.user.create).toHaveBeenCalledWith({
        data: {
          ...createUserDto,
          password: 'hashedPassword',
          role: 'USER',
        },
      });
      expect(result).toEqual(expect.objectContaining(createUserDto));
    });
  });
});
