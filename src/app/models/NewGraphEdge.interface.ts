import { IGraphEdge } from "./GraphEdge.interface";
import { IGraphNode } from "./GraphNode.interface";

export interface INewGraphEdge {
    started: boolean;
    from: IGraphNode | null;
    to: IGraphNode | null;
    weight: number;
}