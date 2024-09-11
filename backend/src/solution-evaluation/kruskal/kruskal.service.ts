import { Injectable } from '@nestjs/common';

@Injectable()
export class KruskalService {

    evaluateSolution(initialStructure: any, studentSolution: any) {
        console.log(initialStructure, studentSolution);
        return {
            receivedPoints: 0,
            feedback: 'Kruskal - Not Implemented',
        }
    }
}
