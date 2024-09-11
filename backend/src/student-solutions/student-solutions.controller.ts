import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { StudentSolutionsService } from './student-solutions.service';
import { CreateStudentSolutionDto } from './dto/create-student-solution.dto';
import { UpdateStudentSolutionDto } from './dto/update-student-solution.dto';

@Controller('student-solutions')
export class StudentSolutionsController {
  constructor(private readonly studentSolutionsService: StudentSolutionsService) {}

  @Post()
  create(@Body() createStudentSolutionDto: CreateStudentSolutionDto) {
    return this.studentSolutionsService.create(createStudentSolutionDto);
  }

  @Get()
  findAll() {
    return this.studentSolutionsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.studentSolutionsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateStudentSolutionDto: UpdateStudentSolutionDto) {
    return this.studentSolutionsService.update(+id, updateStudentSolutionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.studentSolutionsService.remove(+id);
  }
}
