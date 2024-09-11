import { Test, TestingModule } from '@nestjs/testing';
import { StudentSolutionsService } from './student-solutions.service';

describe('StudentSolutionsService', () => {
  let service: StudentSolutionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StudentSolutionsService],
    }).compile();

    service = module.get<StudentSolutionsService>(StudentSolutionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
