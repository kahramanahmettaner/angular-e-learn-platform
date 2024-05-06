import { IPosition } from "./Position.interface";
import { ISize } from "./Size.interface";

export interface INode {
    nodeId: number;
    value: string;
    parent: INode | null;
    leftChild: INode | null;
    rightChild: INode | null;
    position: IPosition;
    size: ISize;
    center: IPosition;
}

