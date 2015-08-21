import * as d3 from 'd3'

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
	insertPointAtIdx(idx:number, val:any):void
	removePointAtIdx(idx:number, val:any):void
	draw(transition:boolean):void
}

export interface Point {
	key: any;
	keyPos: number;
	value: any;
	valPos: number;
	added?: boolean;
	deleted?: boolean
}
