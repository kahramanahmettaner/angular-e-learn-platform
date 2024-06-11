import { IPosition } from "./Position.interface";
import { ISize } from "./Size.interface";

export interface IGraphNodeJSON {
    nodeId: number;
    value: string;
    visited: boolean;
    weight: number
    position: IPosition;
    size: ISize;
    center: IPosition;
}