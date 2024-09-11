import { Test, TestingModule } from '@nestjs/testing';
import { SolutionEvaluationService } from './solution-evaluation.service';

describe('SolutionEvaluationService', () => {
  let service: SolutionEvaluationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SolutionEvaluationService],
    }).compile();

    service = module.get<SolutionEvaluationService>(SolutionEvaluationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
