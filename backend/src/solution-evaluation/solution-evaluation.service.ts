import { Injectable } from '@nestjs/common';
import { BstInsertService } from './bst-insert/bst-insert.service';
import { BstRemoveService } from './bst-remove/bst-remove.service';
import { DijkstraService } from './dijkstra/dijkstra.service';
import { FloydService } from './floyd/floyd.service';
import { KruskalService } from './kruskal/kruskal.service';
import { TransitiveClosureService } from './transitive-closure/transitive-closure.service';

@Injectable()
export class SolutionEvaluationService {

    constructor(
        private readonly bstInsertService: BstInsertService,
        private readonly bstRemoveService: BstRemoveService,
        private readonly dijkstraService: DijkstraService,
        private readonly floydService: FloydService,
        private readonly kruskalService: KruskalService,
        private readonly transitiveClosureService: TransitiveClosureService,
    ){}

    evaluateSolution(assignment: any, studentSolution: any) {

        switch (assignment.type) {
            case 'bst_insert':
                return this.bstInsertService.evaluateSolution(assignment.initialStructure, studentSolution, assignment.expectedSolution);

            case 'bst_remove':
                return this.bstRemoveService.evaluateSolution(assignment.initialStructure, studentSolution);

            case 'dijkstra':
                return this.dijkstraService.evaluateSolution(assignment.initialStructure, studentSolution, assignment.expectedSolution);

            case 'floyd':
                return this.floydService.evaluateSolution(assignment.initialStructure, studentSolution);

            case 'kruskal':
                return this.kruskalService.evaluateSolution(assignment.initialStructure, studentSolution);
                
            case 'transitive_closure':
                return this.transitiveClosureService.evaluateSolution(assignment.initialStructure, studentSolution, assignment.expectedSolution);

            default:
                throw new Error(`Der Aufgabentyp ${assignment.type} wird nicht unterstützt.`);
            }

    }
}
