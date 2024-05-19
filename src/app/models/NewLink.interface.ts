import { ChildRole } from "./ChildRole.enum";
import { INode } from "./Node.interface";

export interface INewLink {
    started: boolean; 
    parent: INode | null; 
    child: INode | null; 
    childRole: ChildRole;
}