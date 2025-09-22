import { Test, TestingModule } from '@nestjs/testing';
import { QuestionService } from '../question.service';
import { QuestionRepository } from '../question.repository';
import { AnswerService } from 'src/answer/answer.service';
import { question_type } from 'types/prisma/question-type.enum';
import { Prisma } from '@prisma/client';

const mockQuestionRepository = {
  getQuestions: jest.fn(),
  getQuestion: jest.fn(),
  deleteQuestion: jest.fn(),
  updateQuestion: jest.fn(),
  createQuestion: jest.fn(),
  updateMCQAnswers: jest.fn(),
};
const mockAnswerService = {};

describe('QuestionService', () => {
  let service: QuestionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuestionService,
        { provide: QuestionRepository, useValue: mockQuestionRepository },
        { provide: AnswerService, useValue: mockAnswerService },
      ],
    }).compile();

    service = module.get<QuestionService>(QuestionService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getQuestions', () => {
    it('should return questions', async () => {
      mockQuestionRepository.getQuestions.mockResolvedValue([{ id: '1', text: 'Q1' }]);
      const questions = await service.getQuestions({});
      expect(questions).toEqual([{ id: '1', text: 'Q1' }]);
    });
  });

  describe('getQuestion', () => {
    it('should return a question', async () => {
      mockQuestionRepository.getQuestion.mockResolvedValue({ id: '1', text: 'Q1' });
      const question = await service.getQuestion('1');
      expect(question).toEqual({ id: '1', text: 'Q1' });
    });
  });

  describe('deleteQuestion', () => {
    it('should delete and return question', async () => {
      mockQuestionRepository.deleteQuestion.mockResolvedValue({ id: '1', text: 'Q1', deletedAt: new Date() });
      const question = await service.deleteQuestion('1');
      expect(question).toHaveProperty('deletedAt');
    });
  });

  describe('updateQuestion', () => {
    it('should update and return question', async () => {
      mockQuestionRepository.updateQuestion.mockResolvedValue({ id: '1', text: 'Updated Q1' });
      const question = await service.updateQuestion('1', { text: 'Updated Q1' } as Prisma.QuestionUpdateInput);
      expect(question).toEqual({ id: '1', text: 'Updated Q1' });
    });
  });

  describe('createQuestion', () => {
    it('should create and return question', async () => {
      mockQuestionRepository.createQuestion.mockResolvedValue({ id: '1', text: 'Q1' });
      const question = await service.createQuestion({ text: 'Q1' } as Prisma.QuestionUncheckedCreateInput);
      expect(question).toEqual({ id: '1', text: 'Q1' });
    });
  });

  describe('updateQuestionWithAnswers', () => {
    it('should update question and answers for MCQ', async () => {
      mockQuestionRepository.updateQuestion.mockResolvedValue({ id: '1', text: 'Q1', type: question_type.MULTIPLE_CHOICE });
      mockQuestionRepository.updateMCQAnswers.mockResolvedValue(2);
      const question = await service.updateQuestionWithAnswers('1', { text: 'Q1', type: question_type.MULTIPLE_CHOICE } as Prisma.QuestionUpdateInput, [{ text: 'A1' }, { text: 'A2' }]);
      expect(question).toEqual({ id: '1', text: 'Q1', type: question_type.MULTIPLE_CHOICE });
    });
    it('should throw if MCQ answers not updated', async () => {
      mockQuestionRepository.updateQuestion.mockResolvedValue({ id: '1', text: 'Q1', type: question_type.MULTIPLE_CHOICE });
      mockQuestionRepository.updateMCQAnswers.mockResolvedValue(0);
      await expect(service.updateQuestionWithAnswers('1', { text: 'Q1', type: question_type.MULTIPLE_CHOICE } as Prisma.QuestionUpdateInput, [{ text: 'A1' }])).rejects.toThrow('Failed to update answers');
    });
    it('should return null if question not found', async () => {
      mockQuestionRepository.updateQuestion.mockResolvedValue(null);
      const question = await service.updateQuestionWithAnswers('1', { text: 'Q1' } as Prisma.QuestionUpdateInput, [{ text: 'A1' }]);
      expect(question).toBeNull();
    });
    it('should update non-MCQ question', async () => {
      mockQuestionRepository.updateQuestion.mockResolvedValue({ id: '1', text: 'Q1', type: question_type.TRUE_FALSE });
      const question = await service.updateQuestionWithAnswers('1', { text: 'Q1', type: question_type.TRUE_FALSE } as Prisma.QuestionUpdateInput, []);
      expect(question).toEqual({ id: '1', text: 'Q1', type: question_type.TRUE_FALSE });
    });
  });
});
