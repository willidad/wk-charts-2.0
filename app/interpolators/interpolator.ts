export type Point = [number, number]
export type Points = Point[]
export type Accessor = (v:any) => number

export interface IInterpolator {
	path():string
	data(points:Points):void
	insertAtPoint(val:number):void
	insertAtPointReverse?(val:number):void
	insertAtIdx(i:number):void
	insertAtIdxReverse?(i:number):void
}

