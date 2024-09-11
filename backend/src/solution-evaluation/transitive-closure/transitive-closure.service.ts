import { Injectable } from '@nestjs/common';

@Injectable()
export class TransitiveClosureService {
    
    evaluateSolution(initialStructure: any, studentSolution: any, expectedSolution: any) {
        console.log(initialStructure, studentSolution, expectedSolution);
        return {
            receivedPoints: 0,
            feedback: 'Transitive Hülle - Not Implemented',
        }
    }
}
