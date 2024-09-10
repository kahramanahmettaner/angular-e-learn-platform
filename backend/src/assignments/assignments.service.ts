import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class AssignmentsService {
  constructor(private readonly databaseService: DatabaseService){}

  async create(createAssignmentDto: Prisma.AssignmentCreateInput) {

    const {
      title, text, dataStructure, stepsEnabled, 
      initialStructure, expectedSolution, graphConfiguration
    } = createAssignmentDto;

    if (title === undefined || typeof title !== 'string') {
      return "Die Aufgabe muss einen gültigen Titel haben."
    }

    if (text === undefined || typeof text !== 'string') {
      return "Die Aufgabe muss einen gültigen text Field haben."
    }

    // If stepsEnabled is not valid, assign false as default
    if (stepsEnabled === undefined || typeof stepsEnabled !== 'boolean') {
      createAssignmentDto.stepsEnabled = false;
    }

    // If dataStructure is not valid, do not continue
    if (dataStructure !== 'graph' && dataStructure !== 'tree') {
      return "Datenstruktur muss entweder 'graph' oder 'tree' sein."
    }

    // TODO: check type
    // If initialStructure is not valid, assign default value
    if (!initialStructure) {
      if (dataStructure === 'tree') {
        createAssignmentDto.initialStructure = null;
      }
      else {
        createAssignmentDto.initialStructure = { nodes: [], edges: []};
      }
    }

    // TODO: check type
    // If expectedStructure is not valid, assign default value
    if (!expectedSolution) {
      if (dataStructure === 'tree') {
        createAssignmentDto.expectedSolution = null;
      }
      else {
        createAssignmentDto.expectedSolution = { nodes: [], edges: []};
      }
    }

    // Check if graphConfiguration is valid
    if (dataStructure === 'tree') {
      createAssignmentDto.graphConfiguration = null;
    }
    else {
      if (!graphConfiguration) {
        return 'Graph Konfiguration ist nicht gültig.'
      }
    }

    // Create the assignment
    // Do not allow id input from client
    return this.databaseService.assignment.create({
      data: { ...createAssignmentDto, id: undefined }
    })
  }

  async findAll() {
    return this.databaseService.assignment.findMany();
  }

  async findOne(id: number) {
    const assignment = this.databaseService.assignment.findUnique({
      where: { id }
    });

    if (assignment) {
      return assignment;
    }
    return `Keine Aufgabe mit id=${id} gefunden.`
  }

  async update(id: number, updateAssignmentDto: Prisma.AssignmentUpdateInput) {
    return `This action updates a #${id} assignment: ${updateAssignmentDto}`;
  }

  async remove(id: number) {
    return this.databaseService.assignment.delete({
      where: { id }
    })
  }
}
