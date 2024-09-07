import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class AssignmentsService {
  constructor(private readonly databaseService: DatabaseService){}

  async create(createAssignmentDto: Prisma.AssignmentCreateInput) {
    return 'This action adds a new assignment';
  }

  async findAll() {
    return `This action returns all assignments`;
  }

  async findOne(id: number) {
    return `This action returns a #${id} assignment`;
  }

  async update(id: number, updateAssignmentDto: Prisma.AssignmentUpdateInput) {
    return `This action updates a #${id} assignment`;
  }

  async remove(id: number) {
    return `This action removes a #${id} assignment`;
  }
}
