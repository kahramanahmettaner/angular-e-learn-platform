import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { GraphService } from '../services/graph.service';
import * as graphData from '../../assets/graphData.json';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

  form: FormGroup;
  options = ['Binärer Suchbaum', 'Graph'];
  showCheckbox = false;
  predesigned_examples = graphData.examples;

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

  choosePredesigned(index: number) {

          // For now, Binary Search Tree is not implemented suitable for this
          // Graph:
          if (this.predesigned_examples[index].data.structureType === "graph") {
            // Reset Graph State
            this.graphService.resetGraph();
    
            // Set Graph Configuration
            this.graphService.configureGraph({
              nodes: {
                visited: false,
                weight: this.predesigned_examples[index].data.configuration.nodes.weight
              },
              edges: {
                directed: this.predesigned_examples[index].data.configuration.edges.directed,
                weight: this.predesigned_examples[index].data.configuration.edges.weight
              }
            })
            
            const graphJSON = JSON.stringify(this.predesigned_examples[index].data, null, 2);
            this.graphService.graphFromJSON(graphJSON);
    
            this.navigateToRoute('/graph')
          }

  }
}
