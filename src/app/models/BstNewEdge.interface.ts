import { BstChildRole } from "./BstChildRole.enum";
import { IBstNode } from "./BstNode.interface";

export interface IBstNewEdge {
    started: boolean; 
    parent: IBstNode | null; 
    child: IBstNode | null; 
    childRole: BstChildRole;
}