import { Module } from '@nestjs/common';
import { SolutionEvaluationService } from './solution-evaluation.service';
import { DijkstraService } from './dijkstra/dijkstra.service';
import { FloydService } from './floyd/floyd.service';
import { KruskalService } from './kruskal/kruskal.service';
import { TransitiveClosureService } from './transitive-closure/transitive-closure.service';
import { BstInsertService } from './bst-insert/bst-insert.service';
import { BstRemoveService } from './bst-remove/bst-remove.service';

@Module({
  providers: [SolutionEvaluationService, DijkstraService, FloydService, KruskalService, TransitiveClosureService, BstInsertService, BstRemoveService],
  exports: [SolutionEvaluationService]
})

export class SolutionEvaluationModule {}
