import { Test, TestingModule } from '@nestjs/testing';
import { AnswerService } from '../answer.service';
import { AnswerRepository } from '../answer.repository';
import { Prisma } from '@prisma/client';

const mockAnswerRepository = {
  getAnswers: jest.fn(),
  getAnswer: jest.fn(),
  deleteAnswer: jest.fn(),
  updateAnswer: jest.fn(),
  createAnswer: jest.fn(),
  createAnswers: jest.fn(),
  deleteAnswers: jest.fn(),
};

describe('AnswerService', () => {
  let service: AnswerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnswerService,
        { provide: AnswerRepository, useValue: mockAnswerRepository },
      ],
    }).compile();

    service = module.get<AnswerService>(AnswerService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAnswers', () => {
    it('should return answers', async () => {
      mockAnswerRepository.getAnswers.mockResolvedValue([
        { id: '1', text: 'A1' },
      ]);
      const answers = await service.getAnswers({});
      expect(answers).toEqual([{ id: '1', text: 'A1' }]);
    });
  });

  describe('getAnswer', () => {
    it('should return an answer', async () => {
      mockAnswerRepository.getAnswer.mockResolvedValue({ id: '1', text: 'A1' });
      const answer = await service.getAnswer('1');
      expect(answer).toEqual({ id: '1', text: 'A1' });
    });
  });

  describe('deleteAnswer', () => {
    it('should delete and return answer', async () => {
      mockAnswerRepository.deleteAnswer.mockResolvedValue({
        id: '1',
        text: 'A1',
        deletedAt: new Date(),
      });
      const answer = await service.deleteAnswer('1');
      expect(answer).toHaveProperty('deletedAt');
    });
  });

  describe('updateAnswer', () => {
    it('should update and return answer', async () => {
      mockAnswerRepository.updateAnswer.mockResolvedValue({
        id: '1',
        text: 'Updated A1',
      });
      const answer = await service.updateAnswer('1', {
        text: 'Updated A1',
      } as Prisma.AnswerUpdateInput);
      expect(answer).toEqual({ id: '1', text: 'Updated A1' });
    });
  });

  describe('createAnswer', () => {
    it('should create and return answer', async () => {
      mockAnswerRepository.createAnswer.mockResolvedValue({
        id: '1',
        text: 'A1',
      });
      const answer = await service.createAnswer({
        text: 'A1',
      } as Prisma.AnswerCreateInput);
      expect(answer).toEqual({ id: '1', text: 'A1' });
    });
  });

  describe('createAnswers', () => {
    it('should create multiple answers and return batch payload', async () => {
      mockAnswerRepository.createAnswers.mockResolvedValue({ count: 2 });
      const result = await service.createAnswers([
        { text: 'A1', questionId: 'q1' },
        { text: 'A2', questionId: 'q1' },
      ]);
      expect(result.count).toBe(2);
    });
  });

  describe('deleteAnswers', () => {
    it('should delete answers for a question and return batch payload', async () => {
      mockAnswerRepository.deleteAnswers.mockResolvedValue({ count: 2 });
      const result = await service.deleteAnswers('q1');
      expect(result.count).toBe(2);
    });
  });
});
