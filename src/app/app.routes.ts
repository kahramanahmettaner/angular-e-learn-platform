import { Routes } from '@angular/router';
import { BinarySearchTreeComponent } from './binary-search-tree/binary-search-tree.component';
import { GraphComponent } from './graph/graph.component';
import { HomeComponent } from './home/home.component';
import { AssignmentContainerComponent } from './assignment-container/assignment-container.component';
import { AssignmentsListComponent } from './assignments-list/assignments-list.component';
import { CreateAssignmentComponent } from './create-assignment/create-assignment.component';

export const routes: Routes = [
    {
        path: '',
        component: HomeComponent
    },
    {
        path: 'assignments',
        component: AssignmentsListComponent
    },
    {
        path: 'assignments/create',
        component: CreateAssignmentComponent
    },
    {
        path: 'tree',
        component: AssignmentContainerComponent,
        children: [
            {
                path: '',
                component: BinarySearchTreeComponent
            }
        ]
        
    },
    {
        path: 'graph',
        component: AssignmentContainerComponent,
        children: [
            {
                path: '',
                component: GraphComponent
            }
        ]
    },
];
