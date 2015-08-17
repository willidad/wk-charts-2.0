export type Point = [number, number]
export type Points = Point[]

export interface IInterpolator {
	path(tension:number):string;
	data(points:Points):void
	insertAtPoint(val:number, reverse?:boolean):void
	insertAtIdx(i:number, nbr:number, reverse?:boolean):void
}

