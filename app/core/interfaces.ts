import * as d3 from 'd3'

export type Point = [number, number, boolean]
export type Points = Point[]
export type Accessor = (v:any) => number
export type D3Selection = d3.Selection<any>

export interface Style {
	[name:string]:any
}

export interface IMargins {
	top:number,
	bottom:number,
	left:number,
	right:number
}

export interface AreaSize {
	width:number;
	height:number;
}


export interface IGenerator {
	data:any[]
	keyOffset:number
	insertPointAtIdx(idx:number, val:any):void
	insertPointAt(key:any):void
	removePointAtIdx(idx:number, val:any):void
	removePointAt(key:any):void
	draw(transition:boolean):void
}

export interface IInterpolator {
	path():string
	getPathPoints():Points
	data(points:Points):void
	insertAtPoint(val:number):void
	insertAtPointReverse(val:number):void
	insertAtIdx(i:number):void
	insertAtIdxReverse(i:number):void 
	getBBox?():SVGRect
}

