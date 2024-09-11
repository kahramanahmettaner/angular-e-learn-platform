import { Test, TestingModule } from '@nestjs/testing';
import { StudentSolutionsController } from './student-solutions.controller';
import { StudentSolutionsService } from './student-solutions.service';

describe('StudentSolutionsController', () => {
  let controller: StudentSolutionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StudentSolutionsController],
      providers: [StudentSolutionsService],
    }).compile();

    controller = module.get<StudentSolutionsController>(StudentSolutionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
