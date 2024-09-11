import { Module } from '@nestjs/common';
import { StudentSolutionsService } from './student-solutions.service';
import { StudentSolutionsController } from './student-solutions.controller';
import { DatabaseModule } from 'src/database/database.module';
import { SolutionEvaluationModule } from 'src/solution-evaluation/solution-evaluation.module';

@Module({
  imports: [DatabaseModule, SolutionEvaluationModule],
  controllers: [StudentSolutionsController],
  providers: [StudentSolutionsService],
})
export class StudentSolutionsModule {}
