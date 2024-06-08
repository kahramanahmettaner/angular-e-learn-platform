import { Component, NgModule, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import IAssignment from '../models/Assignment.interface';
import { AssignmentService } from '../services/assignment.service';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-assignments-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './assignments-list.component.html',
  styleUrl: './assignments-list.component.css'
})
export class AssignmentsListComponent implements OnInit {

  public assignments$!: Observable<IAssignment[]>;

  constructor(
    private router: Router,
    private assignmentService: AssignmentService
  ) {}

  ngOnInit() {
    this.assignments$ = this.assignmentService.getAssignments();

    this.assignments$.subscribe((assignments) => console.log(assignments))
  }

  navigateToRoute(route: string): void {
    this.router.navigate([route]);
  }

  onBtnClick(id: number): void {
    // TODO: Route to the assignment container:
    //this.navigateToRoute(`/assignment/${id}`);
    alert('Not Implemented.')
  }
}
