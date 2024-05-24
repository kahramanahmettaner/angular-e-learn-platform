import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { GraphService } from '../services/graph.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, CommonModule, ReactiveFormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

  form: FormGroup;
  options = ['Binärer Suchbaum', 'Graph'];
  showCheckbox = false;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private graphService: GraphService
  ){
    this.form = this.fb.group({
      selectedOption: ['', Validators.required],
      checkboxEdgeDirected: [false],
      checkboxEdgeWeighted: [false],
      checkboxNodeWeighted: [false]
    });
  }

  navigateToRoute(route: string): void {
    this.router.navigate([route]);
  }

  onSubmit() {
    if (this.form.valid) {

      // Binary Search Tree:
      if (!this.showCheckbox) {
        this.navigateToRoute('/tree')
      }
      else { // Graph:
        
        // Reset Graph State
        this.graphService.resetGraph();

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

        this.navigateToRoute('/graph')
      }
    }
  }

  onChangeOption(event: any) {
    const option = event.target.value;

    // Show checkboxes only if graph structure is selected
    this.showCheckbox = option === 'Graph'; 
  }

}
