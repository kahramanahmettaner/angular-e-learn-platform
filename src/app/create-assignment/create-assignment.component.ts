import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import IAssignment from '../models/Assignment.interface';
import { AssignmentService } from '../services/assignment.service';
import { Router } from '@angular/router';
import { GraphComponent } from '../graph/graph.component';
import { BinarySearchTreeComponent } from '../binary-search-tree/binary-search-tree.component';
import { GraphService } from '../services/graph.service';
import { BinarySearchTreeService } from '../services/binary-search-tree.service';
import { IGraphNode } from '../models/GraphNode.interface';
import { IGraphEdge } from '../models/GraphEdge.interface';
import { IBstNode } from '../models/BstNode.interface';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-create-assignment',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, GraphComponent, BinarySearchTreeComponent],
  templateUrl: './create-assignment.component.html',
  styleUrl: './create-assignment.component.css'
})
export class CreateAssignmentComponent implements OnInit, OnDestroy {

  form: FormGroup;
  options = ['tree', 'graph'];
  showCheckbox = false;

  workspaceIsActive = false;
  initialStructureSet = false;

  graphNodes!: IGraphNode[];
  graphEdges!: IGraphEdge[];
  bstNodes!: IBstNode[];

  graphNodesSubscription!: Subscription;
  graphEdgesSubscription!: Subscription;
  bstNodesSubscription!: Subscription;

  constructor(
    private assignmentService: AssignmentService,
    private fb: FormBuilder,
    private router: Router,
    private graphService: GraphService,
    private bstService: BinarySearchTreeService,
  ) {
    this.form = this.fb.group({
      title: ['', Validators.required],
      stepsEnabled: [false],
      text: ['', Validators.required],
      selectedOption: ['', Validators.required],
      checkboxEdgeDirected: [false],
      checkboxEdgeWeighted: [false],
      checkboxNodeWeighted: [false]
    });
  }

  ngOnInit(): void {
    this.resetState();

    // #############################
    // Subscribe to Observables from the graphService and bstService
    this.graphNodesSubscription = this.graphService.getNodes().subscribe( nodes => {
      this.graphNodes = nodes;
    });

    this.graphEdgesSubscription = this.graphService.getEdges().subscribe( edges => {
      this.graphEdges = edges;
    });

    this.bstNodesSubscription = this.bstService.getNodes().subscribe( nodes => {
      this.bstNodes = nodes;
    });
  }

  ngOnDestroy(): void {
    
    // #############################
    // Unsubscribe from all subscriptions to prevent memory leaks
    if (this.graphNodesSubscription) {
      this.graphNodesSubscription.unsubscribe();
    }
    if (this.graphEdgesSubscription) {
      this.graphEdgesSubscription.unsubscribe();
    }
    if (this.bstNodesSubscription) {
      this.bstNodesSubscription.unsubscribe();
    }
  }

  onSubmit(): void {
    if (this.form.valid) {

      const newAssignment: IAssignment = {
        id: this.assignmentService.generateDummyId(), // TODO: for now use this function but it should not be given here but in backend
        title: this.form.value.title,
        text: this.form.value.text,
        stepsEnabled: this.form.value.stepsEnabled,
        dataStructure: this.form.value.selectedOption,
      };

      // Set configuration for graph or tree according to the selected dataStructure
      if (this.form.value.selectedOption === "graph") {
        newAssignment.graphConfiguration = {
          initialNodeData: this.graphNodes,
          initialEdgeData: this.graphEdges,
          nodeConfiguration: {
            weight: this.form.value.checkboxNodeWeighted,
            visited: false
          },
          edgeConfiguration: {
            directed: this.form.value.checkboxEdgeDirected,
            weight: this.form.value.checkboxEdgeWeighted
          }
        };
      } else if (this.form.value.selectedOption === "tree") { 
          newAssignment.binarySearchTreeConfiguration = {
            initialNodeData: this.bstNodes,
          };
      }
      
      // Add new assignment
      this.assignmentService.createAssignment(newAssignment);

      // Route to the route 'assignments'
      this.navigateToRoute('assignments');

    } else { 
        console.log("Not valid");
    }
  }

  navigateToRoute(route: string): void {
    this.router.navigate([route]);
  }

  onChangeOption(event: any): void {
    const option = event.target.value;

    if (this.initialStructureSet) {
      alert('Der Entwurf wurde zurückgesetzt.')
      this.resetState();
    }

    // Show checkboxes only if graph structure is selected
    this.showCheckbox = option === 'graph'; 
  }

  onChangeCheckbox(event: any): void {
    if (this.initialStructureSet) {
      alert('Der Entwurf wurde zurückgesetzt.')
      this.resetState();
    }
  }

  resetState() {
    this.initialStructureSet = false;
    this.graphService.resetGraph();
    this.bstService.resetTree();
  }

  activateWorkspace() {
    this.workspaceIsActive = true;
    this.initialStructureSet = true;

    if (this.form.controls['selectedOption'].value === 'graph') {

      // Set Graph Configuration
      this.graphService.configureGraph({
        nodes: {
          visited: false,
          weight: this.form.value.checkboxNodeWeighted
        },
        edges: {
          directed: this.form.value.checkboxEdgeDirected,
          weight: this.form.value.checkboxEdgeWeighted
        }
      })
    }
    
  }

  deactivateWorkspace() {
    this.workspaceIsActive = false;
  }
}
