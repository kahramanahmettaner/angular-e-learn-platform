import { Injectable } from '@nestjs/common';

@Injectable()
export class DijkstraService {

    evaluateSolution(initialStructure: any, studentSolution: any, expectedSolution: any) {
        console.log(initialStructure, studentSolution, expectedSolution);
        return {
            receivedPoints: 0,
            feedback: 'Dijsktra - Not Implemented',
        }
    }
}