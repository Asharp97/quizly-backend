import { Test, TestingModule } from '@nestjs/testing';
import { QuizSubmissionService } from '../quiz-submission.service';
import { QuizSubmissionRepository } from '../quiz-submission.repository';
import { UserService } from '../../user/user.service';
import { ProducerService } from '../../kafka/producer.service';
import { Prisma } from '@prisma/client';
import { processingStatus } from 'types/prisma/processing-status.enum';

// Mock dependencies
const mockQuizSubmissionRepository = {
  getQuizSubmissions: jest.fn(),
  getQuizSubmissionsCount: jest.fn(),
  getQuizSubmission: jest.fn(),
  getQuizSubmissionByIdempotencyKey: jest.fn(),
  deleteQuizSubmission: jest.fn(),
  updateQuizSubmission: jest.fn(),
  createQuizSubmission: jest.fn(),
};

const mockUserService = {
  getUserIdFromToken: jest.fn(),
};

const mockProducerService = {
  produce: jest.fn(),
};

describe('QuizSubmissionService', () => {
  let service: QuizSubmissionService;

  const mockQuizSubmission = {
    id: 'submission-123',
    quizId: 'quiz-456',
    userId: 'user-789',
    score: 85.5,
    timeTaken: 1200,
    submittedAt: new Date('2026-02-10T14:00:00Z'),
    idempotencyKey: 'idempotent-key-123',
    processingStatus: processingStatus.PENDING,
    createdAt: new Date('2026-02-10T13:00:00Z'),
    updatedAt: new Date('2026-02-10T13:00:00Z'),
    deletedAt: null,
    processedAt: null,
    AnswerSubmission: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuizSubmissionService,
        {
          provide: QuizSubmissionRepository,
          useValue: mockQuizSubmissionRepository,
        },
        { provide: UserService, useValue: mockUserService },
        { provide: ProducerService, useValue: mockProducerService },
      ],
    }).compile();

    service = module.get<QuizSubmissionService>(QuizSubmissionService);
    repository = module.get<QuizSubmissionRepository>(QuizSubmissionRepository);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getQuizSubmissions', () => {
    it('should return multiple quiz submissions', async () => {
      const mockSubmissions = [mockQuizSubmission];
      mockQuizSubmissionRepository.getQuizSubmissions.mockResolvedValue(
        mockSubmissions,
      );

      const result = await service.getQuizSubmissions({
        skip: 0,
        take: 10,
      });

      expect(result).toEqual(mockSubmissions);
      expect(
        mockQuizSubmissionRepository.getQuizSubmissions,
      ).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
      });
    });

    it('should return filtered quiz submissions with where clause', async () => {
      const mockSubmissions = [mockQuizSubmission];
      const whereClause: Prisma.QuizSubmissionWhereInput = {
        quizId: 'quiz-456',
      };

      mockQuizSubmissionRepository.getQuizSubmissions.mockResolvedValue(
        mockSubmissions,
      );

      const result = await service.getQuizSubmissions({
        where: whereClause,
      });

      expect(result).toEqual(mockSubmissions);
      expect(
        mockQuizSubmissionRepository.getQuizSubmissions,
      ).toHaveBeenCalledWith({
        where: whereClause,
      });
    });

    it('should return sorted quiz submissions with orderBy', async () => {
      const mockSubmissions = [mockQuizSubmission];
      const orderBy = { createdAt: 'desc' as const };

      mockQuizSubmissionRepository.getQuizSubmissions.mockResolvedValue(
        mockSubmissions,
      );

      const result = await service.getQuizSubmissions({
        orderBy,
      });

      expect(result).toEqual(mockSubmissions);
      expect(
        mockQuizSubmissionRepository.getQuizSubmissions,
      ).toHaveBeenCalledWith({
        orderBy,
      });
    });

    it('should return empty array when no submissions found', async () => {
      mockQuizSubmissionRepository.getQuizSubmissions.mockResolvedValue([]);

      const result = await service.getQuizSubmissions({});

      expect(result).toEqual([]);
    });
  });

  describe('getQuizSubmissionsCount', () => {
    it('should return count of quiz submissions', async () => {
      mockQuizSubmissionRepository.getQuizSubmissionsCount.mockResolvedValue(5);

      const result = await service.getQuizSubmissionsCount({});

      expect(result).toBe(5);
      expect(
        mockQuizSubmissionRepository.getQuizSubmissionsCount,
      ).toHaveBeenCalledWith({});
    });

    it('should return count with where filter', async () => {
      const whereClause: Prisma.QuizSubmissionWhereInput = {
        userId: 'user-789',
      };

      mockQuizSubmissionRepository.getQuizSubmissionsCount.mockResolvedValue(3);

      const result = await service.getQuizSubmissionsCount({
        where: whereClause,
      });

      expect(result).toBe(3);
      expect(
        mockQuizSubmissionRepository.getQuizSubmissionsCount,
      ).toHaveBeenCalledWith({
        where: whereClause,
      });
    });

    it('should return 0 when no submissions match filter', async () => {
      mockQuizSubmissionRepository.getQuizSubmissionsCount.mockResolvedValue(0);

      const result = await service.getQuizSubmissionsCount({
        where: { userId: 'non-existent-user' },
      });

      expect(result).toBe(0);
    });
  });

  describe('getQuizSubmission', () => {
    it('should return a single quiz submission by id', async () => {
      mockQuizSubmissionRepository.getQuizSubmission.mockResolvedValue(
        mockQuizSubmission,
      );

      const result = await service.getQuizSubmission('submission-123');

      expect(result).toEqual(mockQuizSubmission);
      expect(
        mockQuizSubmissionRepository.getQuizSubmission,
      ).toHaveBeenCalledWith('submission-123');
    });

    it('should return null when submission not found', async () => {
      mockQuizSubmissionRepository.getQuizSubmission.mockResolvedValue(null);

      const result = await service.getQuizSubmission('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('getQuizSubmissionByIdempotencyKey', () => {
    it('should return quiz submission by idempotency key', async () => {
      mockQuizSubmissionRepository.getQuizSubmissionByIdempotencyKey.mockResolvedValue(
        mockQuizSubmission,
      );

      const result =
        await service.getQuizSubmissionByIdempotencyKey('idempotent-key-123');

      expect(result).toEqual(mockQuizSubmission);
      expect(
        mockQuizSubmissionRepository.getQuizSubmissionByIdempotencyKey,
      ).toHaveBeenCalledWith('idempotent-key-123');
    });

    it('should return null when idempotency key not found', async () => {
      mockQuizSubmissionRepository.getQuizSubmissionByIdempotencyKey.mockResolvedValue(
        null,
      );

      const result =
        await service.getQuizSubmissionByIdempotencyKey('non-existent-key');

      expect(result).toBeNull();
    });
  });

  describe('deleteQuizSubmission', () => {
    it('should soft delete quiz submission by id', async () => {
      const deletedSubmission = {
        ...mockQuizSubmission,
        deletedAt: new Date('2026-02-10T15:00:00Z'),
      };

      mockQuizSubmissionRepository.deleteQuizSubmission.mockResolvedValue(
        deletedSubmission,
      );

      const result = await service.deleteQuizSubmission('submission-123');

      expect(result).toEqual(deletedSubmission);
      expect(result.deletedAt).not.toBeNull();
      expect(
        mockQuizSubmissionRepository.deleteQuizSubmission,
      ).toHaveBeenCalledWith('submission-123');
    });

    it('should return null when trying to delete non-existent submission', async () => {
      mockQuizSubmissionRepository.deleteQuizSubmission.mockResolvedValue(null);

      const result = await service.deleteQuizSubmission('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('updateQuizSubmission', () => {
    it('should update quiz submission with new data', async () => {
      const updateData: Prisma.QuizSubmissionUpdateInput = {
        score: 90,
        processingStatus: processingStatus.COMPLETED,
      };

      const updatedSubmission = {
        ...mockQuizSubmission,
        score: 90,
        processingStatus: processingStatus.COMPLETED,
      };

      mockQuizSubmissionRepository.updateQuizSubmission.mockResolvedValue(
        updatedSubmission,
      );

      const result = await service.updateQuizSubmission(
        'submission-123',
        updateData,
      );

      expect(result).toEqual(updatedSubmission);
      expect(result.score).toBe(90);
      expect(result.processingStatus).toBe(processingStatus.COMPLETED);
      expect(
        mockQuizSubmissionRepository.updateQuizSubmission,
      ).toHaveBeenCalledWith({
        where: { id: 'submission-123' },
        data: updateData,
      });
    });

    it('should update only specific fields', async () => {
      const updateData: Prisma.QuizSubmissionUpdateInput = {
        timeTaken: 1500,
      };

      const updatedSubmission = {
        ...mockQuizSubmission,
        timeTaken: 1500,
      };

      mockQuizSubmissionRepository.updateQuizSubmission.mockResolvedValue(
        updatedSubmission,
      );

      const result = await service.updateQuizSubmission(
        'submission-123',
        updateData,
      );

      expect(result.timeTaken).toBe(1500);
    });

    it('should return null when updating non-existent submission', async () => {
      mockQuizSubmissionRepository.updateQuizSubmission.mockResolvedValue(null);

      const result = await service.updateQuizSubmission('non-existent-id', {
        score: 100,
      });

      expect(result).toBeNull();
    });
  });

  describe('createQuizSubmission', () => {
    it('should create quiz submission with valid token', async () => {
      const createData: Prisma.QuizSubmissionCreateInput = {
        Quiz: { connect: { id: 'quiz-456' } },
        idempotencyKey: 'idempotent-key-123',
      };

      mockUserService.getUserIdFromToken.mockReturnValue('user-789');
      mockQuizSubmissionRepository.createQuizSubmission.mockResolvedValue(
        mockQuizSubmission,
      );
      mockProducerService.produce.mockResolvedValue(undefined);

      const result = await service.createQuizSubmission(
        createData,
        'valid-token',
        'idempotent-key-123',
      );

      expect(result).toEqual(mockQuizSubmission);
      expect(mockUserService.getUserIdFromToken).toHaveBeenCalledWith(
        'valid-token',
      );
      expect(
        mockQuizSubmissionRepository.createQuizSubmission,
      ).toHaveBeenCalled();
      expect(mockProducerService.produce).toHaveBeenCalled();
    });

    it('should throw error when token is invalid', async () => {
      const createData: Prisma.QuizSubmissionCreateInput = {
        Quiz: { connect: { id: 'quiz-456' } },
      };

      mockUserService.getUserIdFromToken.mockReturnValue(null);

      await expect(
        service.createQuizSubmission(createData, 'invalid-token'),
      ).rejects.toThrow('Invalid token');
    });

    it('should generate idempotency key if not provided', async () => {
      const createData: Prisma.QuizSubmissionCreateInput = {
        Quiz: { connect: { id: 'quiz-456' } },
      };

      mockUserService.getUserIdFromToken.mockReturnValue('user-789');
      mockQuizSubmissionRepository.createQuizSubmission.mockResolvedValue({
        ...mockQuizSubmission,
        idempotencyKey: expect.any(String),
      });
      mockProducerService.produce.mockResolvedValue(undefined);

      const result = await service.createQuizSubmission(
        createData,
        'valid-token',
      );

      expect(result).toEqual(mockQuizSubmission);
      expect(
        mockQuizSubmissionRepository.createQuizSubmission,
      ).toHaveBeenCalled();
    });

    it('should emit Kafka event when quiz submission is created', async () => {
      const createData: Prisma.QuizSubmissionCreateInput = {
        Quiz: { connect: { id: 'quiz-456' } },
      };

      mockUserService.getUserIdFromToken.mockReturnValue('user-789');
      mockQuizSubmissionRepository.createQuizSubmission.mockResolvedValue(
        mockQuizSubmission,
      );
      mockProducerService.produce.mockResolvedValue(undefined);

      await service.createQuizSubmission(createData, 'valid-token');

      expect(mockProducerService.produce).toHaveBeenCalledWith({
        topic: 'quiz.submitted',
        messages: expect.arrayContaining([
          expect.objectContaining({
            key: 'submission-123',
            value: expect.stringContaining('submission-123'),
          }),
        ]),
      });
    });

    it('should not fail if Kafka event emission fails', async () => {
      const createData: Prisma.QuizSubmissionCreateInput = {
        Quiz: { connect: { id: 'quiz-456' } },
      };

      mockUserService.getUserIdFromToken.mockReturnValue('user-789');
      mockQuizSubmissionRepository.createQuizSubmission.mockResolvedValue(
        mockQuizSubmission,
      );
      mockProducerService.produce.mockRejectedValue(new Error('Kafka error'));

      const result = await service.createQuizSubmission(
        createData,
        'valid-token',
      );

      expect(result).toEqual(mockQuizSubmission);
      expect(mockProducerService.produce).toHaveBeenCalled();
    });

    it('should connect user from token to quiz submission', async () => {
      const createData: Prisma.QuizSubmissionCreateInput = {
        Quiz: { connect: { id: 'quiz-456' } },
      };

      mockUserService.getUserIdFromToken.mockReturnValue('user-789');
      mockQuizSubmissionRepository.createQuizSubmission.mockResolvedValue(
        mockQuizSubmission,
      );
      mockProducerService.produce.mockResolvedValue(undefined);

      await service.createQuizSubmission(createData, 'valid-token');

      expect(
        mockQuizSubmissionRepository.createQuizSubmission,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          User: { connect: { id: 'user-789' } },
          Quiz: { connect: { id: 'quiz-456' } },
        }),
      );
    });

    it('should extract quiz ID from connect object in Kafka event', async () => {
      const createData: Prisma.QuizSubmissionCreateInput = {
        Quiz: { connect: { id: 'quiz-456' } },
      };

      mockUserService.getUserIdFromToken.mockReturnValue('user-789');
      mockQuizSubmissionRepository.createQuizSubmission.mockResolvedValue(
        mockQuizSubmission,
      );
      mockProducerService.produce.mockResolvedValue(undefined);

      await service.createQuizSubmission(createData, 'valid-token');

      const kafkaCall = mockProducerService.produce.mock.calls[0][0];
      const eventMessage = JSON.parse(kafkaCall.messages[0].value);

      expect(eventMessage.quizId).toBe('quiz-456');
      expect(eventMessage.userId).toBe('user-789');
      expect(eventMessage.quizSubmissionId).toBe('submission-123');
    });

    it('should include answer count in Kafka event', async () => {
      const createData: Prisma.QuizSubmissionCreateInput = {
        Quiz: { connect: { id: 'quiz-456' } },
      };

      const submissionWithAnswers = {
        ...mockQuizSubmission,
        AnswerSubmission: [
          {
            id: 'answer-1',
            quizSubmissionId: 'submission-123',
            answerId: 'ans-1',
            isCorrect: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: 'answer-2',
            quizSubmissionId: 'submission-123',
            answerId: 'ans-2',
            isCorrect: false,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      };

      mockUserService.getUserIdFromToken.mockReturnValue('user-789');
      mockQuizSubmissionRepository.createQuizSubmission.mockResolvedValue(
        submissionWithAnswers,
      );
      mockProducerService.produce.mockResolvedValue(undefined);

      await service.createQuizSubmission(createData, 'valid-token');

      const kafkaCall = mockProducerService.produce.mock.calls[0][0];
      const eventMessage = JSON.parse(kafkaCall.messages[0].value);

      expect(eventMessage.answerCount).toBe(2);
    });
  });
});
