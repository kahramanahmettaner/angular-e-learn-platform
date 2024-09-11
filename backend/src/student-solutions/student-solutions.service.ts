import { Injectable } from '@nestjs/common';
import { CreateStudentSolutionDto } from './dto/create-student-solution.dto';
import { UpdateStudentSolutionDto } from './dto/update-student-solution.dto';
import { DatabaseService } from 'src/database/database.service';
import { SolutionEvaluationService } from 'src/solution-evaluation/solution-evaluation.service';

@Injectable()
export class StudentSolutionsService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly solutionEvaluationService: SolutionEvaluationService
  ){}

  async create(createStudentSolutionDto: any) {

    const { assignmentId, studentSolution } = createStudentSolutionDto;

    const assignment = await this.databaseService.assignment.findUnique({
      where: { id: assignmentId }
    });

    if (!assignment) {
      return `Keine Aufgabe mit der ID ${assignmentId} wurde gefunden.`;
    }

    const {
      feedback, receivedPoints
    } = this.solutionEvaluationService.evaluateSolution(assignment, studentSolution);

    return { feedback, receivedPoints };
  }

  async findAll() {
    return `This action returns all studentSolutions`;
  }

  async findOne(id: number) {
    return `This action returns a #${id} studentSolution`;
  }

  async update(id: number, updateStudentSolutionDto: UpdateStudentSolutionDto) {
    return `This action updates a #${id} studentSolution: ${updateStudentSolutionDto}`;
  }

  async remove(id: number) {
    return `This action removes a #${id} studentSolution`;
  }
}
