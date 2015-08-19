export enum Direction {
	x = 0,
	y = 1
}

export type Point = [number, number]

export interface Segment {

	contains(p:number, s:Direction):boolean 
	
	splitAt(pos:number, vertical:Direction):[Segment, Segment] 
	
	path:string  
}
