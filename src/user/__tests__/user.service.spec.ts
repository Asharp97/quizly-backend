import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../user.service';
import { UserRepository } from '../user.repository';
import { JwtService } from '@nestjs/jwt';
import { RedisService } from '@liaoliaots/nestjs-redis';
import { signUpRequestDTO } from '../dto/signupRequest.dto';

// Mock dependencies
const mockUserRepository = {
  getUsers: jest.fn(),
  getUser: jest.fn(),
  deleteUser: jest.fn(),
  updateUser: jest.fn(),
  createUser: jest.fn(),
  getUserByEmail: jest.fn(),
};
const mockJwtService = {
  sign: jest.fn(),
  verify: jest.fn(),
  verifyAsync: jest.fn(),
};
const mockRedis = {
  hmset: jest.fn(),
  expire: jest.fn(),
  del: jest.fn(),
  exists: jest.fn(),
};
const mockRedisService = {
  getOrThrow: jest.fn(() => mockRedis),
};

describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: UserRepository, useValue: mockUserRepository },
        { provide: JwtService, useValue: mockJwtService },
        { provide: RedisService, useValue: mockRedisService },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getUsers', () => {
    it('should return users', async () => {
      mockUserRepository.getUsers.mockResolvedValue([
        { id: '1', email: 'test@test.com' },
      ]);
      const users = await service.getUsers();
      expect(users).toEqual([{ id: '1', email: 'test@test.com' }]);
    });
  });

  describe('signUp', () => {
    it('should throw if email or password missing', async () => {
      await expect(
        service.signUp({ email: '', password: '' } as signUpRequestDTO),
      ).rejects.toThrow('Email and password are required');
    });
    it('should throw if user exists', async () => {
      mockUserRepository.getUserByEmail.mockResolvedValue({
        id: '1',
        email: 'test@test.com',
      });
      await expect(
        service.signUp({
          email: 'test@test.com',
          password: 'pass',
        } as signUpRequestDTO),
      ).rejects.toThrow('User with this email already exists');
    });
    it('should create user and return tokens', async () => {
      mockUserRepository.getUserByEmail.mockResolvedValue(null);
      mockUserRepository.createUser.mockResolvedValue({
        id: '2',
        email: 'new@test.com',
      });
      mockJwtService.sign.mockReturnValue('token');
      const result = await service.signUp({
        email: 'new@test.com',
        password: 'pass',
      } as signUpRequestDTO);
      expect(result.accessToken).toBe('token');
      expect(result.refreshToken).toBe('token');
    });
  });

  describe('login', () => {
    it('should throw if user not found', async () => {
      mockUserRepository.getUserByEmail.mockResolvedValue(null);
      await expect(service.login('notfound@test.com', 'pass')).rejects.toThrow(
        'Invalid credentials',
      );
    });
    it('should throw if password invalid', async () => {
      mockUserRepository.getUserByEmail.mockResolvedValue({
        id: '1',
        email: 'test@test.com',
        password: 'hashed',
      });
      jest.spyOn(require('bcryptjs'), 'compare').mockResolvedValue(false);
      await expect(service.login('test@test.com', 'wrong')).rejects.toThrow(
        'Invalid credentials',
      );
    });
    it('should return tokens if valid', async () => {
      mockUserRepository.getUserByEmail.mockResolvedValue({
        id: '1',
        email: 'test@test.com',
        password: 'hashed',
      });
      jest.spyOn(require('bcryptjs'), 'compare').mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue('token');
      const result = await service.login('test@test.com', 'pass');
      expect(result.accessToken).toBe('token');
      expect(result.refreshToken).toBe('token');
    });
  });

  describe('logout', () => {
    it('should delete tokens and return success', async () => {
      mockJwtService.verifyAsync.mockResolvedValue({
        data: { userId: '1', sessionId: 'abc' },
      });
      mockRedis.del.mockResolvedValue(2);
      const result = await service.logout('token');
      expect(result.success).toBe(true);
    });
    it('should return failure on error', async () => {
      mockJwtService.verifyAsync.mockRejectedValue(new Error('fail'));
      const result = await service.logout('badtoken');
      expect(result.success).toBe(false);
    });
  });

  describe('refreshToken', () => {
    it('should throw if token invalid', async () => {
      mockJwtService.verifyAsync.mockRejectedValue(new Error('fail'));
      await expect(service.refreshToken('badtoken')).rejects.toThrow(
        'Refresh token is invalid or has expired.',
      );
    });
    it('should throw if session not found', async () => {
      mockJwtService.verifyAsync.mockResolvedValue({
        data: { userId: '1', sessionId: 'abc' },
      });
      mockRedis.exists.mockResolvedValue(0);
      await expect(service.refreshToken('token')).rejects.toThrow(
        'This session has been logged out.',
      );
    });
    it('should throw if user not found', async () => {
      mockJwtService.verifyAsync.mockResolvedValue({
        data: { userId: '1', sessionId: 'abc' },
      });
      mockRedis.exists.mockResolvedValue(1);
      mockUserRepository.getUser.mockResolvedValue(null);
      await expect(service.refreshToken('token')).rejects.toThrow(
        'User not found.',
      );
    });
    it('should return new tokens if valid', async () => {
      mockJwtService.verifyAsync.mockResolvedValue({
        data: { userId: '1', sessionId: 'abc' },
      });
      mockRedis.exists.mockResolvedValue(1);
      mockUserRepository.getUser.mockResolvedValue({
        id: '1',
        email: 'test@test.com',
      });
      mockJwtService.sign.mockReturnValue('token');
      mockRedis.del.mockResolvedValue(2);
      const result = await service.refreshToken('token');
      expect(result.accessToken).toBe('token');
      expect(result.refreshToken).toBe('token');
    });
  });

  describe('getUserFromToken', () => {
    it('should return user if token valid', async () => {
      mockJwtService.verify.mockReturnValue({ data: { userId: '1' } });
      mockUserRepository.getUser.mockResolvedValue({
        id: '1',
        email: 'test@test.com',
      });
      const result = await service.getUserFromToken('token');
      expect(result).toEqual({ id: '1', email: 'test@test.com' });
    });
    it('should return null if error', async () => {
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('fail');
      });
      const result = await service.getUserFromToken('badtoken');
      expect(result).toBeNull();
    });
  });
});
