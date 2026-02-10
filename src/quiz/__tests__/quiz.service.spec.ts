import { Test, TestingModule } from '@nestjs/testing';
import { QuizService } from '../quiz.service';
import { QuizRepository } from '../quiz.repository';
import { UserService } from 'src/user/user.service';
import { Prisma } from '@prisma/client';

jest.mock('src/common/utils/genLink', () => ({
  genLink: jest.fn(() => 'mocked-link'),
}));

const mockQuizRepository = {
  getQuizzes: jest.fn(),
  getQuiz: jest.fn(),
  deleteQuiz: jest.fn(),
  updateQuiz: jest.fn(),
  createQuiz: jest.fn(),
};
const mockUserService = {
  getUserIdFromToken: jest.fn(),
};

describe('QuizService', () => {
  let service: QuizService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuizService,
        { provide: QuizRepository, useValue: mockQuizRepository },
        { provide: UserService, useValue: mockUserService },
      ],
    }).compile();

    service = module.get<QuizService>(QuizService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getQuizzes', () => {
    it('should return quizzes', async () => {
      mockQuizRepository.getQuizzes.mockResolvedValue([
        { id: '1', title: 'Quiz 1' },
      ]);
      const quizzes = await service.getQuizzes({});
      expect(quizzes).toEqual([{ id: '1', title: 'Quiz 1' }]);
    });
  });

  describe('getQuiz', () => {
    it('should return a quiz', async () => {
      mockQuizRepository.getQuiz.mockResolvedValue({
        id: '1',
        title: 'Quiz 1',
      });
      const quiz = await service.getQuiz('1');
      expect(quiz).toEqual({ id: '1', title: 'Quiz 1' });
    });
  });

  describe('deleteQuiz', () => {
    it('should delete and return quiz', async () => {
      mockQuizRepository.deleteQuiz.mockResolvedValue({
        id: '1',
        title: 'Quiz 1',
        deletedAt: new Date(),
      });
      const quiz = await service.deleteQuiz('1');
      expect(quiz).toHaveProperty('deletedAt');
    });
  });

  describe('updateQuiz', () => {
    it('should update and return quiz', async () => {
      mockQuizRepository.updateQuiz.mockResolvedValue({
        id: '1',
        title: 'Updated Quiz',
      });
      const quiz = await service.updateQuiz('1', {
        title: 'Updated Quiz',
      } as Prisma.QuizUpdateInput);
      expect(quiz).toEqual({ id: '1', title: 'Updated Quiz' });
    });
  });

  describe('createQuiz', () => {
    it('should throw if token is invalid', async () => {
      mockUserService.getUserIdFromToken.mockReturnValue(null);
      await expect(
        service.createQuiz(
          { title: 'Quiz' } as Prisma.QuizCreateInput,
          'badtoken',
        ),
      ).rejects.toThrow('Invalid token');
    });
    it('should create quiz and connect user', async () => {
      mockUserService.getUserIdFromToken.mockReturnValue('user-1');
      mockQuizRepository.createQuiz.mockResolvedValue({
        id: '1',
        title: 'Quiz',
        link: 'mocked-link',
      });
      const result = await service.createQuiz(
        { title: 'Quiz' } as Prisma.QuizCreateInput,
        'token',
      );
      expect(result).toEqual({ id: '1', title: 'Quiz', link: 'mocked-link' });
      expect(mockQuizRepository.createQuiz).toHaveBeenCalledWith({
        title: 'Quiz',
        link: 'mocked-link',
        User: { connect: { id: 'user-1' } },
      });
    });
  });
});
