import { Injectable } from '@nestjs/common';

@Injectable()
export class BstInsertService {

    evaluateSolution(initialStructure: any, studentSolution: any, expectedSolution: any) {
        console.log(initialStructure, studentSolution, expectedSolution);
        return {
            receivedPoints: 0,
            feedback: 'Binärer Suchbaum Einfügen - Not Implemented',
        }
    }
}
