import { Injectable } from '@nestjs/common';

@Injectable()
export class FloydService {

    evaluateSolution(initialStructure: any, studentSolution: any) {
        console.log(initialStructure, studentSolution);
        return {
            receivedPoints: 0,
            feedback: 'Floyd - Not Implemented',
        }
    }
}
