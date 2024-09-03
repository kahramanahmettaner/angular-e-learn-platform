export interface IGraphEdgeJSON {
    node1Id: number; // startNode for directed edges
    node2Id: number; // endNode for directed edges
    weight: number | null;
}