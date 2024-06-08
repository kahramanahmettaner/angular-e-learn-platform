import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import IAssignment from '../models/Assignment.interface';
import { AssignmentService } from '../services/assignment.service';
import { GraphService } from '../services/graph.service';
import { CommonModule } from '@angular/common';
import { GraphComponent } from '../graph/graph.component';
import { BinarySearchTreeComponent } from '../binary-search-tree/binary-search-tree.component';

@Component({
  selector: 'app-assignment-container',
  standalone: true,
  imports: [CommonModule, RouterLink, GraphComponent, BinarySearchTreeComponent],
  templateUrl: './assignment-container.component.html',
  styleUrl: './assignment-container.component.css'
})
export class AssignmentContainerComponent implements OnInit {

  public assignment$!: Observable<IAssignment | undefined>;

  constructor(
    private assignmentService: AssignmentService,
    private graphService: GraphService,
    //private bstService: BinarySearchTreeService,
    private route: ActivatedRoute
  ) {

  }

  
  ngOnInit(): void {
    const idStr = this.route.snapshot.paramMap.get('id') || '-1';
    const id = parseInt(idStr);

    this.assignment$ = this.assignmentService.getAssignmentById(id);

    this.assignment$.subscribe((assignment) => {  
      if (assignment?.dataStructure === 'graph') {
        console.log('Graph Structure');
        if (assignment.graphConfiguration === undefined) {
          console.log('No Configuration');
        } else {
          console.log('Successfull');          
          this.graphService.configureGraph({
            "nodes": assignment.graphConfiguration?.nodeConfiguration,
            "edges": assignment.graphConfiguration?.edgeConfiguration,
          })
        }
      }
      else if (assignment?.dataStructure === 'tree') {
        console.log('Binary Search Tree Structure');
      }
    })
  }
}
