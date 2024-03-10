import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UnauthorizedException } from '@nestjs/common';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let userServiceMock: Partial<UserService>;
  let jwtServiceMock: Partial<JwtService>;

  beforeEach(async () => {
    userServiceMock = {
      findOneByEmail: jest.fn().mockImplementation((email) => {
        if (email === 'existing@example.com') {
          return Promise.resolve({
            email,
            password: bcrypt.hashSync('correctpassword', 10),
            userId: 1,
            username: 'user1',
          });
        }
        return null;
      }),
    };

    jwtServiceMock = {
      sign: jest
        .fn()
        .mockImplementation(
          (payload) => `signed-token-for-${payload.username}`,
        ),
    };

    (bcrypt.compare as jest.Mock) = jest.fn().mockImplementation((pass) => {
      return pass === 'correctpassword'
        ? Promise.resolve(true)
        : Promise.resolve(false);
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: userServiceMock },
        { provide: JwtService, useValue: jwtServiceMock },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user data without password if valid credentials', async () => {
      const result = await service.validateUser(
        'existing@example.com',
        'correctpassword',
      );
      expect(result).toBeDefined();
      expect(result.email).toEqual('existing@example.com');
      expect(result.password).toBeUndefined();
      expect(bcrypt.compare).toHaveBeenCalledWith(
        'correctpassword',
        expect.any(String),
      );
    });

    it('should throw UnauthorizedException if invalid credentials', async () => {
      await expect(
        service.validateUser('existing@example.com', 'wrongpassword'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
