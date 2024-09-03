import { IGraphEdgeJSON } from "./GraphEdgeJSON.interface";
import { IGraphNodeJSON } from "./GraphNodeJSON.interface";

export interface IGraphDataJSON {
    nodes: IGraphNodeJSON[];
    edges: IGraphEdgeJSON[];
}