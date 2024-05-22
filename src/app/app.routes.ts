import { Routes } from '@angular/router';
import { BinarySearchTreeComponent } from './binary-search-tree/binary-search-tree.component';
import { GraphComponent } from './graph/graph.component';
import { HomeComponent } from './home/home.component';

export const routes: Routes = [
    {
        path: '',
        component: HomeComponent
    },
    {
        path: 'tree',
        component: BinarySearchTreeComponent
    },
    {
        path: 'graph',
        component: GraphComponent
    },
];
