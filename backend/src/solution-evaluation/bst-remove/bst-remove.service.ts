import { Injectable } from '@nestjs/common';

@Injectable()
export class BstRemoveService {
    
    evaluateSolution(initialStructure: any, studentSolution: any) {
        console.log(initialStructure, studentSolution);
        return {
            receivedPoints: 0,
            feedback: 'Binärer Suchbaum Löschen - Not Implemented',
        }
    }
}
