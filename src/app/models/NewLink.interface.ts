import { INode } from "./Node.interface";

export interface INewLink {
    started: boolean; 
    parent: INode | null; 
    child: INode | null; 
    isLeftChild: boolean;
}