import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import IAssignment from '../models/Assignment.interface';
import { AssignmentService } from '../services/assignment.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-assignment',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './create-assignment.component.html',
  styleUrl: './create-assignment.component.css'
})
export class CreateAssignmentComponent {

  form: FormGroup;
  options = ['tree', 'graph'];
  showCheckbox = false;

  constructor(
    private assignmentService: AssignmentService,
    private fb: FormBuilder,
    private router: Router
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

  onSubmit(): void {
    if (this.form.valid) {

      const newAssignment: IAssignment = {
        id: -1, // TODO: for now use -1 but it should not be given here
        title: this.form.value.title,
        text: this.form.value.text,
        stepsEnabled: this.form.value.stepsEnabled,
        dataStructure: this.form.value.selectedOption,
      };

      // Set configuration for graph or tree according to the selected dataStructure
      if (this.form.value.selectedOption === "graph") {
        newAssignment.graphConfiguration = {
          initialNodeData: [],
          initialEdgeData: [],
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
            initialNodeData: [],
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

    // Show checkboxes only if graph structure is selected
    this.showCheckbox = option === 'graph'; 
  }
}
