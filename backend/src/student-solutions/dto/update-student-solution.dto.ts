import { PartialType } from '@nestjs/mapped-types';
import { CreateStudentSolutionDto } from './create-student-solution.dto';

export class UpdateStudentSolutionDto extends PartialType(CreateStudentSolutionDto) {}
