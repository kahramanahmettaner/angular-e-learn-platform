import { IPosition } from "./Position.interface";
import { ISize } from "./Size.interface";

export interface IBstNodeJSON {
    nodeId: number;
    value: string;
    leftChild: IBstNodeJSON | null;
    rightChild: IBstNodeJSON | null;
    position: IPosition;
    size: ISize;
    center: IPosition;
}

