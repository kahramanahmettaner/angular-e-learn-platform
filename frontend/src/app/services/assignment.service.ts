import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import IAssignment from '../models/Assignment.interface';
import { BinarySearchTreeService } from './binary-search-tree.service';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AssignmentService {

  private assignments$ = new BehaviorSubject<IAssignment[]>([]);

  constructor(
    private httpClient: HttpClient
  ) {
    this.init();
  }

  public init(): void {
    
    this.fetchAssignments()

  }


  // ##########
  // API Calls

  private fetchAssignments() {
    
    this.httpClient.get<IAssignment[]>('http://localhost:3000/assignments').subscribe( assigment => {
      this.assignments$.next(assigment);
    })

  }  

  createAssignment(newAssignment: Partial<IAssignment>) {
    console.log(newAssignment)
    return this.httpClient.post('http://localhost:3000/assignments', newAssignment).subscribe( data => {
      console.log(data);
    })

  }  

  checkSolution(): string {
    return 'NOT IMPLEMENTED!'
  }

  // ##########
  // Assignment

  getAssignments(): Observable<IAssignment[]> {
    return this.assignments$;
  }

  getAssignmentById(id: number): Observable<IAssignment | undefined> {
    return this.assignments$.pipe(
      map((assignments) => assignments.find((assignment) => assignment.id === id))
    );
  }

}
